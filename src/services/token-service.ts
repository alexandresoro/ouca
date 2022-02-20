import { User } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { CookieSerializeOptions } from "fastify-cookie";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import prisma from "../sql/prisma";
import { SIGNING_TOKEN_ALGO, TokenKeys } from "../utils/keys";
import options from "../utils/options";

const TOKEN_KEY = "token";

const COOKIE_OPTIONS: CookieSerializeOptions = {
  httpOnly: true,
  sameSite: options.jwtCookieSameSite ? "strict" : "none",
  secure: options.jwtCookieSecure,
  maxAge: 60 * 60 * 24 // Let's keep it for 1 day for now
};

export const validateAndExtractUserToken = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<JWTPayload | null> => {
  // Extract the token from the authentication cookie, if any
  const token = request.cookies["token"];
  if (token) {
    const publicKey = await TokenKeys.getKey();
    const tokenVerifyResult = await jwtVerify(token, publicKey).catch((e) => {
      // If the user has sent a token that could not be validated,
      // make sure that at least the cookie is deleted
      void deleteTokenCookie(reply);
      throw e;
    });

    // Check that the user still exists in the database and has a valid role
    const matchingDbUser = await prisma.user.findFirst({
      where: {
        id: tokenVerifyResult.payload.sub
      }
    });

    if (!matchingDbUser || matchingDbUser?.role !== tokenVerifyResult.payload.roles) {
      return null;
    }

    return tokenVerifyResult.payload;
  }

  return null;
};

const createSignedTokenForUser = async (user: Omit<User, "password">): Promise<string> => {
  const { id, firstName, lastName, role, username } = user;

  const signingKey = await TokenKeys.getKey();

  return new SignJWT({
    name: username,
    given_name: firstName,
    family_name: lastName,
    roles: role
  })
    .setProtectedHeader({ alg: SIGNING_TOKEN_ALGO })
    .setIssuedAt()
    .setSubject(id)
    .sign(signingKey);
};

export const createAndAddSignedTokenAsCookie = async (
  reply: FastifyReply,
  user: Omit<User, "password">
): Promise<void> => {
  const token = await createSignedTokenForUser(user);

  void reply.setCookie(TOKEN_KEY, token, COOKIE_OPTIONS);
};

export const deleteTokenCookie = async (reply: FastifyReply): Promise<void> => {
  void reply.clearCookie(TOKEN_KEY);
};
