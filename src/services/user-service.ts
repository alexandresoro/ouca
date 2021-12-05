import { DatabaseRole, User } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";
import { SignJWT } from "jose";
import { UserCreateInput, UserLoginInput } from "../model/graphql";
import prisma from "../sql/prisma";
import { SALT_AND_PWD_DELIMITER, SIGNING_TOKEN_ALGO, TokenKeys } from "../utils/keys";

const PASSWORD_KEY_LENGTH = 64;

const createSignedTokenForUser = async (user: User): Promise<string> => {
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

export const createUser = async (signupData: UserCreateInput, role: DatabaseRole): Promise<string> => {

  const { password, ...otherUserInfo } = signupData;

  // Make sure that the password is properly encrypted :-)
  const salt = randomBytes(16);
  const encryptedPasswordBuffer = scryptSync(password, salt, PASSWORD_KEY_LENGTH);

  return prisma.user.create({
    data: {
      ...otherUserInfo,
      role,
      password: `${salt.toString('hex')}${SALT_AND_PWD_DELIMITER}${encryptedPasswordBuffer.toString('hex')}`
    }
  }).then(createSignedTokenForUser);
};

export const loginUser = async (loginData: UserLoginInput): Promise<string> => {

  const { username, password } = loginData;

  // Try to find the matching profile
  const matchingUser = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!matchingUser) {
    return Promise.reject("No matching user has been found");
  }

  // Check that the password matches
  const [saltAsHex, storedSaltedPassword] = matchingUser.password.split(SALT_AND_PWD_DELIMITER);
  const inputSaltedPassword = scryptSync(password, Buffer.from(saltAsHex, 'hex'), PASSWORD_KEY_LENGTH).toString('hex');

  if (inputSaltedPassword !== storedSaltedPassword) {
    return Promise.reject("The provided password is incorrect")
  }

  return createSignedTokenForUser(matchingUser);
};