import { Post } from "../models/Post.js";
import { SocialAccount } from "../models/SocialAccount.js";
import { env } from "../config/env.js";
import axios from "axios";

const META_GRAPH_VERSION = env.meta.apiVersion;

export async function publishPostById(postId) {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error("Post not found for publishing");
  }

  post.status = "processing";
  await post.save();

  const results = [];

  for (const platform of post.platforms) {
    const account = await getPublishingAccount(post.user, platform);

    if (!account) {
      results.push({
        provider: platform,
        status: "failed",
        message: getMissingAccountMessage(platform),
      });
      continue;
    }

    try {
      const result = await publishToPlatform(platform, post, account);
      results.push({
        provider: platform,
        status: "published",
        externalPostId: result.externalPostId,
        message: result.message,
      });
    } catch (error) {
      const message = getPublishErrorMessage(error);
      if (!account.isStaticEnvAccount && isInvalidMetaTokenError(platform, error)) {
        await SocialAccount.deleteOne({ _id: account._id });
      }

      results.push({
        provider: platform,
        status: "failed",
        message,
      });
    }
  }

  post.results = results;
  post.status = results.every((item) => item.status === "published") ? "published" : "failed";
  await post.save();

  return post;
}

async function getPublishingAccount(userId, platform) {
  const staticAccount = getStaticMetaAccount(platform);
  if (staticAccount) {
    return staticAccount;
  }

  return SocialAccount.findOne({ user: userId, provider: platform });
}

function getStaticMetaAccount(platform) {
  if (platform === "facebook" && env.meta.facebook.pageId && env.meta.facebook.pageAccessToken) {
    return {
      providerAccountId: env.meta.facebook.pageId,
      accessToken: env.meta.facebook.pageAccessToken,
      isStaticEnvAccount: true,
      meta: {
        pageId: env.meta.facebook.pageId,
      },
    };
  }

  if (platform === "instagram" && env.meta.instagram.userId && env.meta.instagram.accessToken) {
    return {
      providerAccountId: env.meta.instagram.userId,
      accessToken: env.meta.instagram.accessToken,
      isStaticEnvAccount: true,
      meta: {
        instagramBusinessAccountId: env.meta.instagram.userId,
      },
    };
  }

  return null;
}

function getMissingAccountMessage(platform) {
  if (platform === "facebook") {
    return "Facebook credentials missing. Set FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN in .env.";
  }

  if (platform === "instagram") {
    return "Instagram credentials missing. Set IG_USER_ID and IG_ACCESS_TOKEN in .env.";
  }

  return "No connected account found for this platform.";
}

async function publishToPlatform(platform, post, account) {
  if (platform === "facebook") {
    return post.mediaResourceType === "video"
      ? publishFacebookVideo(post, account)
      : publishFacebookPhoto(post, account);
  }

  if (platform === "instagram") {
    return post.mediaResourceType === "video"
      ? publishInstagramVideo(post, account)
      : publishInstagramPhoto(post, account);
  }

  if (platform === "youtube") {
    return publishYouTubeVideo(post, account);
  }
   if (platform === "Tiktok") {
    return publishYouTubeVideo(post, account);
  }

  throw new Error(`Unsupported platform: ${platform}`);
}

async function publishFacebookPhoto(post, account) {
  if (post.mediaResourceType !== "image") {
    throw new Error("Facebook photo publishing requires an image upload.");
  }

  const pageId = account.meta?.pageId || account.providerAccountId;
  const response = await axios.post(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${pageId}/photos`,
    null,
    {
      params: {
        url: post.mediaUrl,
        caption: buildCaption(post),
        access_token: account.accessToken,
      },
    }
  );

  return {
    externalPostId: response.data.post_id || response.data.id,
    message: "Published to Facebook Page.",
  };
}

async function publishFacebookVideo(post, account) {
  const pageId = account.meta?.pageId || account.providerAccountId;
  const response = await axios.post(
    `https://graph-video.facebook.com/${META_GRAPH_VERSION}/${pageId}/videos`,
    null,
    {
      params: {
        file_url: post.mediaUrl,
        description: buildCaption(post),
        access_token: account.accessToken,
      },
    }
  );

  return {
    externalPostId: response.data.id,
    message: "Published video to Facebook Page.",
  };
}

async function publishInstagramPhoto(post, account) {
  if (post.mediaResourceType !== "image") {
    throw new Error("Instagram photo publishing requires an image upload.");
  }

  const instagramAccountId = account.meta?.instagramBusinessAccountId || account.providerAccountId;
  const mediaResponse = await axios.post(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${instagramAccountId}/media`,
    null,
    {
      params: {
        image_url: post.mediaUrl,
        caption: buildCaption(post),
        access_token: account.accessToken,
      },
    }
  );

  const publishResponse = await axios.post(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${instagramAccountId}/media_publish`,
    null,
    {
      params: {
        creation_id: mediaResponse.data.id,
        access_token: account.accessToken,
      },
    }
  );

  return {
    externalPostId: publishResponse.data.id,
    message: "Published to Instagram.",
  };
}

async function publishInstagramVideo(post, account) {
  const instagramAccountId = account.meta?.instagramBusinessAccountId || account.providerAccountId;
  const mediaResponse = await axios.post(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${instagramAccountId}/media`,
    null,
    {
      params: {
        media_type: "REELS",
        video_url: post.mediaUrl,
        caption: buildCaption(post),
        access_token: account.accessToken,
      },
    }
  );

  const creationId = mediaResponse.data.id;
  await waitForInstagramContainer(creationId, account.accessToken);

  const publishResponse = await axios.post(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${instagramAccountId}/media_publish`,
    null,
    {
      params: {
        creation_id: creationId,
        access_token: account.accessToken,
      },
    }
  );

  return {
    externalPostId: publishResponse.data.id,
    message: "Published video to Instagram Reels.",
  };
}

async function waitForInstagramContainer(creationId, accessToken) {
  const maxAttempts = 24;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await axios.get(`https://graph.facebook.com/${META_GRAPH_VERSION}/${creationId}`, {
      params: {
        fields: "status_code",
        access_token: accessToken,
      },
    });

    const statusCode = response.data.status_code;
    if (statusCode === "FINISHED") {
      return;
    }

    if (statusCode === "ERROR" || statusCode === "EXPIRED") {
      throw new Error(`Instagram video processing failed with status ${statusCode}.`);
    }

    await delay(5000);
  }

  throw new Error("Instagram video is still processing. Try publishing again in a few minutes.");
}

async function publishYouTubeVideo(post, account) {
  if (post.mediaResourceType !== "video") {
    throw new Error("YouTube publishing requires a video upload.");
  }

  const accessToken = await getValidYouTubeAccessToken(account);
  const videoHead = await axios.head(post.mediaUrl).catch(() => null);
  const contentType = videoHead?.headers?.["content-type"] || "video/mp4";
  const contentLength = videoHead?.headers?.["content-length"];

  const metadataResponse = await axios.post(
    "https://www.googleapis.com/upload/youtube/v3/videos",
    {
      snippet: {
        title: post.title,
        description: buildCaption(post),
        categoryId: "22",
        tags: (post.hashtags || []).map((tag) => tag.replace(/^#/, "")).filter(Boolean),
      },
      status: {
        privacyStatus: env.youtube.privacyStatus,
        selfDeclaredMadeForKids: false,
      },
    },
    {
      params: {
        uploadType: "resumable",
        part: "snippet,status",
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": contentType,
        ...(contentLength ? { "X-Upload-Content-Length": contentLength } : {}),
      },
    }
  );

  const uploadUrl = metadataResponse.headers.location;
  if (!uploadUrl) {
    throw new Error("YouTube did not return an upload session URL.");
  }

  const mediaResponse = await axios.get(post.mediaUrl, {
    responseType: "stream",
  });

  const uploadResponse = await axios.put(uploadUrl, mediaResponse.data, {
    headers: {
      "Content-Type": mediaResponse.headers["content-type"] || contentType,
      ...(mediaResponse.headers["content-length"] ? { "Content-Length": mediaResponse.headers["content-length"] } : {}),
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  return {
    externalPostId: uploadResponse.data.id,
    message: `Uploaded video to YouTube as ${env.youtube.privacyStatus}.`,
  };
}

async function getValidYouTubeAccessToken(account) {
  const expiresAt = account.tokenExpiresAt ? new Date(account.tokenExpiresAt).getTime() : 0;
  const refreshSkewMs = 5 * 60 * 1000;

  if (account.accessToken && (!expiresAt || expiresAt - Date.now() > refreshSkewMs)) {
    return account.accessToken;
  }

  if (!account.refreshToken) {
    throw new Error("YouTube access expired. Reconnect YouTube to continue publishing.");
  }

  const providerEnv = env.providers.youtube;
  const body = new URLSearchParams({
    client_id: providerEnv.clientId,
    client_secret: providerEnv.clientSecret,
    grant_type: "refresh_token",
    refresh_token: account.refreshToken,
  });

  const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  account.accessToken = tokenResponse.data.access_token;
  account.tokenExpiresAt = tokenResponse.data.expires_in
    ? new Date(Date.now() + tokenResponse.data.expires_in * 1000)
    : null;
  await account.save();

  return account.accessToken;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildCaption(post) {
  const hashtags = (post.hashtags || [])
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ");

  return [post.caption, hashtags].filter(Boolean).join("\n\n");
}

function getPublishErrorMessage(error) {
  const providerMessage = error.response?.data?.error?.message || error.message || "";

  if (providerMessage.toLowerCase().includes("cannot parse access token")) {
    return "Saved OAuth token is invalid. Reconnect this platform and try publishing again.";
  }

  return providerMessage || "Publishing failed.";
}

function isInvalidMetaTokenError(platform, error) {
  if (platform !== "facebook" && platform !== "instagram") {
    return false;
  }

  const providerMessage = error.response?.data?.error?.message || error.message || "";
  return providerMessage.toLowerCase().includes("cannot parse access token");
}
