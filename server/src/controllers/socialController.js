import { SocialAccount } from "../models/SocialAccount.js";
import { createAuthorizationUrl, exchangeCodeForTokens } from "../services/oauthService.js";
import { env } from "../config/env.js";

function encodeState(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeState(raw) {
  return JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
}

export async function listAccounts(req, res) {
  const accounts = await SocialAccount.find({ user: req.user._id }).select(
    "provider providerAccountId tokenExpiresAt createdAt updatedAt"
  ).lean();

  const visibleAccounts = [...accounts];
  upsertStaticAccount(visibleAccounts, "facebook", env.meta.facebook.pageId, env.meta.facebook.pageAccessToken);
  upsertStaticAccount(visibleAccounts, "instagram", env.meta.instagram.userId, env.meta.instagram.accessToken);

  res.json({ accounts: visibleAccounts });
}

function upsertStaticAccount(accounts, provider, providerAccountId, accessToken) {
  if (!providerAccountId || !accessToken) {
    return;
  }

  const existingIndex = accounts.findIndex((account) => account.provider === provider);
  if (existingIndex >= 0) {
    accounts.splice(existingIndex, 1);
  }

  accounts.push({
    provider,
    providerAccountId,
    tokenExpiresAt: null,
    createdAt: null,
    updatedAt: null,
    source: "environment",
  });
}

export async function getOAuthUrl(req, res) {
  const { provider } = req.params;

  if (hasStaticMetaAccount(provider)) {
    return res.json({
      authorizationUrl: `${env.clientUrl}?connected=${provider}&source=environment`,
    });
  }

  const state = encodeState({ provider, userId: req.user._id.toString() });
  const authorizationUrl = createAuthorizationUrl(provider, state);
  res.json({ authorizationUrl });
}

function hasStaticMetaAccount(provider) {
  if (provider === "facebook") {
    return Boolean(env.meta.facebook.pageId && env.meta.facebook.pageAccessToken);
  }

  if (provider === "instagram") {
    return Boolean(env.meta.instagram.userId && env.meta.instagram.accessToken);
  }

  return false;
}

export async function handleOAuthCallback(req, res) {
  const { provider } = req.params;
  const { code, state } = req.query;

  if (!state) {
    return res.status(400).json({ message: "Missing OAuth state" });
  }

  const decoded = decodeState(state);
  const tokenSet = await exchangeCodeForTokens(provider, code);

  await SocialAccount.findOneAndUpdate(
    { user: decoded.userId, provider },
    {
      user: decoded.userId,
      provider,
      providerAccountId: tokenSet.providerAccountId,
      accessToken: tokenSet.accessToken,
      refreshToken: tokenSet.refreshToken,
      tokenExpiresAt: tokenSet.tokenExpiresAt,
      scope: tokenSet.scope,
      meta: tokenSet.meta,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.redirect(`${env.clientUrl}?connected=${provider}`);
}
