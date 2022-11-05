import { CookieSerializeOptions } from "@fastify/cookie";
import { DatabaseRole, User } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { LoggedUser } from "../types/LoggedUser";
import { SIGNING_TOKEN_ALGO, TokenKeys } from "../utils/keys";
import options from "../utils/options";
import { getUser } from "./user-service";

const TOKEN_KEY = "token";

const COOKIE_OPTIONS: CookieSerializeOptions = {
  httpOnly: true,
  sameSite: options.jwt.cookie.sameSite ? "strict" : "none",
  secure: options.jwt.cookie.secure,
  maxAge: 60 * 60 * 24, // Let's keep it for 1 day for now
};

type AdditionalUserInfo = {
  name: string;
};

export type LoggedUserInfo = LoggedUser & AdditionalUserInfo;

export const getLoggedUserInfo = (tokenPayload: JWTPayload): LoggedUserInfo | null => {
  if (tokenPayload?.sub && tokenPayload.roles) {
    return {
      id: tokenPayload.sub,
      role: tokenPayload.roles as DatabaseRole,
      name: tokenPayload.name as string,
    };
  }
  return null;
};

export const validateAndExtractUserToken = async (request: FastifyRequest): Promise<JWTPayload | null> => {
  // Extract the token from the authentication cookie, if any
  const token = request.cookies["token"];
  if (token) {
    const publicKey = await TokenKeys.getKey();
    const tokenVerifyResult = await jwtVerify(token, publicKey);

    // Check that the user still exists in the database and has a valid role
    if (!tokenVerifyResult.payload?.sub) {
      throw new Error("Authentication credentials are missing required information");
    }
    const matchingDbUser = await getUser(tokenVerifyResult.payload.sub);

    if (!matchingDbUser || matchingDbUser?.role !== tokenVerifyResult.payload.roles) {
      throw new Error("Authentication credentials are invalid");
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
    roles: role,
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
  void reply.clearCookie(TOKEN_KEY, COOKIE_OPTIONS);
};
