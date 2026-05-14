import { env } from "../config/env.js";
import axios from "axios";

const META_GRAPH_VERSION = env.meta.apiVersion;

const providerConfig = {
  youtube: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scope: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  },
  facebook: {
    authUrl: "https://www.facebook.com/v20.0/dialog/oauth",
    scope: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
  },
  instagram: {
    authUrl: "https://www.facebook.com/v20.0/dialog/oauth",
    scope: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
  },
};

export function createAuthorizationUrl(provider, state) {
  const providerEnv = env.providers[provider];
  const config = providerConfig[provider];

  if (!providerEnv?.clientId || !providerEnv?.redirectUri || !config) {
    throw new Error(`OAuth configuration missing for ${provider}`);
  }

  const url = new URL(config.authUrl);

  url.searchParams.set("client_id", providerEnv.clientId);
  url.searchParams.set("redirect_uri", providerEnv.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scope.join(" "));
  url.searchParams.set("state", state);

  if (provider === "youtube") {
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
  }

  return url.toString();
}

export async function exchangeCodeForTokens(provider, code) {
  if (!code) {
    throw new Error("Missing authorization code");
  }

  const providerEnv = env.providers[provider];

  if (!providerEnv?.clientId || !providerEnv?.clientSecret) {
    throw new Error(`OAuth credentials missing for ${provider}`);
  }

  if (provider === "facebook" || provider === "instagram") {
    return exchangeMetaCodeForTokens(provider, code, providerEnv);
  }

  if (provider === "youtube") {
    return exchangeGoogleCodeForTokens(code, providerEnv);
  }
  
    if (provider === "Tiktok") {
    return exchangeGoogleCodeForTokens(code, providerEnv);
  }


  throw new Error(`${provider} OAuth token exchange is not implemented yet.`);
}

async function exchangeGoogleCodeForTokens(code, providerEnv) {
  const body = new URLSearchParams({
    client_id: providerEnv.clientId,
    client_secret: providerEnv.clientSecret,
    redirect_uri: providerEnv.redirectUri,
    grant_type: "authorization_code",
    code,
  });

  const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn, scope } = tokenResponse.data;
  const profileResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    providerAccountId: profileResponse.data.id || profileResponse.data.email || "youtube-account",
    accessToken,
    refreshToken: refreshToken || "",
    tokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
    scope: scope ? scope.split(" ") : [],
    meta: {
      email: profileResponse.data.email,
      name: profileResponse.data.name,
      picture: profileResponse.data.picture,
    },
  };
}

async function exchangeMetaCodeForTokens(provider, code, providerEnv) {
  const tokenResponse = await axios.get(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token`,
    {
      params: {
        client_id: providerEnv.clientId,
        redirect_uri: providerEnv.redirectUri,
        client_secret: providerEnv.clientSecret,
        code,
      },
    }
  );

  const userAccessToken = tokenResponse.data.access_token;
  const expiresIn = tokenResponse.data.expires_in;

  const pagesResponse = await axios.get(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/me/accounts`,
    {
      params: {
        fields: "id,name,access_token,instagram_business_account{id,username}",
        access_token: userAccessToken,
      },
    }
  );

  const pages = pagesResponse.data.data || [];

  if (provider === "facebook") {
    const page = pages.find((item) => item.access_token);
    if (!page) {
      throw new Error("No Facebook Page found for this account. Connect or create a Page first.");
    }

    return {
      providerAccountId: page.id,
      accessToken: page.access_token,
      refreshToken: "",
      tokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
      scope: [],
      meta: {
        pageId: page.id,
        pageName: page.name,
      },
    };
  }

  const pageWithInstagram = pages.find((item) => item.instagram_business_account?.id && item.access_token);
  if (!pageWithInstagram) {
    throw new Error("No Instagram Business account linked to a Facebook Page was found.");
  }

  return {
    providerAccountId: pageWithInstagram.instagram_business_account.id,
    accessToken: pageWithInstagram.access_token,
    refreshToken: "",
    tokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
    scope: [],
    meta: {
      pageId: pageWithInstagram.id,
      pageName: pageWithInstagram.name,
      instagramBusinessAccountId: pageWithInstagram.instagram_business_account.id,
      instagramUsername: pageWithInstagram.instagram_business_account.username,
    },
  };
}
