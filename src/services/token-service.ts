import { User } from "@prisma/client";
import { FastifyReply } from "fastify";
import { CookieSerializeOptions } from "fastify-cookie";
import { SignJWT } from "jose";
import { SIGNING_TOKEN_ALGO, TokenKeys } from "../utils/keys";

const TOKEN_KEY = "token";

// TODO improve these policies for prod
const COOKIE_OPTION: CookieSerializeOptions = {
  httpOnly: true,
  sameSite: "none",
  secure: true,
  maxAge: 60 * 60 * 24 * 2 // Let's keep if for 2 days for now
}

const createSignedTokenForUser = async (user: Omit<User, 'password'>): Promise<string> => {
  const { firstName, lastName, role, username } = user;

  const signingKey = await TokenKeys.getKey();

  return new SignJWT(
    {
      given_name: firstName,
      family_name: lastName,
      roles: role
    })
    .setProtectedHeader({ alg: SIGNING_TOKEN_ALGO })
    .setIssuedAt()
    .setSubject(username)
    .sign(signingKey);
}

export const createAndAddSignedTokenAsCookie = async (reply: FastifyReply, user: Omit<User, 'password'>): Promise<void> => {

  const token = await createSignedTokenForUser(user);

  void reply.setCookie(TOKEN_KEY, token, COOKIE_OPTION);
}

export const deleteTokenCookie = async (reply: FastifyReply): Promise<void> => {
  void reply.clearCookie(TOKEN_KEY, COOKIE_OPTION);
}
