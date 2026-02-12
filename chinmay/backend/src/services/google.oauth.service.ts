import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";

const client = new OAuth2Client(env.google.clientId || "google_client_id_placeholder");

export type GoogleProfile = {
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  sub: string;
};

export const googleOAuthService = {
  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.google.clientId
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid Google token");
    }

    return {
      email: payload.email,
      emailVerified: !!payload.email_verified,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub!
    };
  }
};

