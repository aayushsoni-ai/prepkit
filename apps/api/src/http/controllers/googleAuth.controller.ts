import { randomBytes } from "crypto";
import { Request, Response } from "express";
import { request } from "undici";
import { getEnv } from "../../config/env.js";
import { AuthService } from "../../services/auth.service.js";

const authService = new AuthService();

function getRedirectUri(req: Request): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = typeof forwardedProto === "string" ? forwardedProto.split(",")[0].trim() : req.protocol;
  const host = req.get("host") || "localhost:3000";
  return `${proto}://${host}/api/auth/google/callback`;
}

export async function handleGoogleRedirect(req: Request, res: Response): Promise<void> {
  const env = getEnv();
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    res.redirect("/login?error=Google+login+is+not+configured+yet");
    return;
  }

  const state = randomBytes(16).toString("hex");
  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000
  });

  const redirectUri = getRedirectUri(req);
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account"
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

export async function handleGoogleCallback(req: Request, res: Response): Promise<void> {
  const env = getEnv();
  const { code, state } = req.query;
  const storedState = req.cookies?.oauth_state;

  res.clearCookie("oauth_state");

  if (!code || !state || typeof code !== "string" || state !== storedState) {
    res.redirect("/login?error=Invalid+state+or+authorization+code");
    return;
  }

  const redirectUri = getRedirectUri(req);
  const tokenRes = await request("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    }).toString()
  });

  if (tokenRes.statusCode < 200 || tokenRes.statusCode >= 300) {
    res.redirect("/login?error=Google+authentication+failed");
    return;
  }

  const tokenData = (await tokenRes.body.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    res.redirect("/login?error=Failed+to+obtain+Google+token");
    return;
  }

  const userRes = await request("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });

  if (userRes.statusCode < 200 || userRes.statusCode >= 300) {
    res.redirect("/login?error=Failed+to+fetch+Google+profile");
    return;
  }

  const profile = (await userRes.body.json()) as { sub?: string; email?: string };
  if (!profile.sub || !profile.email) {
    res.redirect("/login?error=Google+profile+missing+email");
    return;
  }

  const { rawToken } = await authService.handleGoogleAuth(profile.sub, profile.email);

  res.cookie("prepkit_session", rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.redirect("/kits");
}
