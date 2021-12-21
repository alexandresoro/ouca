import { User } from "@prisma/client";
import { FastifyReply } from "fastify";
import { CookieSerializeOptions } from "fastify-cookie";
import { SignJWT } from "jose";
import { SIGNING_TOKEN_ALGO, TokenKeys } from "../utils/keys";
import options from "../utils/options";

const TOKEN_KEY = "token";

const COOKIE_OPTIONS: CookieSerializeOptions = {
  httpOnly: true,
  sameSite: options.jwtCookieSameSite ? "strict" : "none",
  secure: options.jwtCookieSecure,
  maxAge: 60 * 60 * 24 // Let's keep it for 1 day for now
}

const createSignedTokenForUser = async (user: Omit<User, 'password'>): Promise<string> => {
  const { id, firstName, lastName, role, username } = user;

  const signingKey = await TokenKeys.getKey();

  return new SignJWT(
    {
      name: username,
      given_name: firstName,
      family_name: lastName,
      roles: role
    })
    .setProtectedHeader({ alg: SIGNING_TOKEN_ALGO })
    .setIssuedAt()
    .setSubject(id)
    .sign(signingKey);
}

export const createAndAddSignedTokenAsCookie = async (reply: FastifyReply, user: Omit<User, 'password'>): Promise<void> => {

  const token = await createSignedTokenForUser(user);

  void reply.setCookie(TOKEN_KEY, token, COOKIE_OPTIONS);
}

export const deleteTokenCookie = async (reply: FastifyReply): Promise<void> => {
  void reply.clearCookie(TOKEN_KEY);
}
