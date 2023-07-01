import { createHash, type BinaryLike } from "node:crypto";

export const sha256 = (content: BinaryLike): string => {
  return createHash("sha256").update(content).digest("hex");
};
