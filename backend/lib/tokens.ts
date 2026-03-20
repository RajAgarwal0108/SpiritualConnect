import crypto from "crypto";
import { prisma } from "./prisma";

const HASH_ALGORITHM = "sha256";

const hashToken = (token: string) => crypto.createHash(HASH_ALGORITHM).update(token).digest("hex");

type TokenType = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

const invalidateActiveTokens = async (userId: number, type: TokenType) => {
  await prisma.verificationToken.updateMany({
    where: { userId, type, used: false },
    data: { used: true },
  });
};

export const createVerificationToken = async (
  userId: number,
  type: TokenType,
  expiresInMinutes: number
): Promise<string> => {
  await invalidateActiveTokens(userId, type);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  await prisma.verificationToken.create({
    data: {
      token: hashToken(rawToken),
      type,
      expiresAt,
      userId,
    },
  });

  return rawToken;
};

export const consumeVerificationToken = async (token: string, type: TokenType) => {
  const hashedToken = hashToken(token);
  const now = new Date();

  const record = await prisma.verificationToken.findFirst({
    where: {
      token: hashedToken,
      type,
      used: false,
      expiresAt: { gt: now },
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return null;
  }

  await prisma.verificationToken.update({
    where: { id: record.id },
    data: { used: true },
  });

  return record.user;
};

export type { TokenType };
