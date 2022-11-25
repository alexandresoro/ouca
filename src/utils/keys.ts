import { generateSecret, type KeyLike } from "jose";
import { TextEncoder } from "node:util";
import options from "./options";

export const SALT_AND_PWD_DELIMITER = ":";

export const SIGNING_TOKEN_ALGO = "HS256";

// For now HMAC based signing should be enough
// We may need to explore asymmetric keys if needed
// https://github.com/panva/jose/issues/114
// The way we generate the keys mean that they are changed everytime the app starts
// So a token will be invalidated if it comes from a previous session
class TokenKeysClass {
  private key!: KeyLike | Uint8Array;

  public getKey = async (): Promise<KeyLike | Uint8Array> => {
    if (!this.key) {
      if (options.jwt.signingKey) {
        // JWS signing key is provided by config
        this.key = new TextEncoder().encode(options.jwt.signingKey);
      } else {
        // JWS signing key is generated
        this.key = await generateSecret(SIGNING_TOKEN_ALGO);
      }
    }
    return this.key;
  };
}

export const TokenKeys = new TokenKeysClass();
