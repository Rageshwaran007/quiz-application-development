import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"
import type { QuizAttempt } from "@/lib/questions"

function getKey() {
  const secret = process.env.DATABASE_URL
  if (!secret) throw new Error("DATABASE_URL is required to protect quiz answers.")
  return createHash("sha256").update(secret).digest()
}

export function sealQuizAttempt(attempt: QuizAttempt) {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(attempt)), cipher.final()])
  return [iv, cipher.getAuthTag(), encrypted].map((value) => value.toString("base64url")).join(".")
}

export function openQuizAttempt(token: string): QuizAttempt {
  const [encodedIv, encodedTag, encodedBody] = token.split(".")
  if (!encodedIv || !encodedTag || !encodedBody || token.length > 16_000) throw new Error("Invalid quiz token.")
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(encodedIv, "base64url"))
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"))
  const body = Buffer.concat([decipher.update(Buffer.from(encodedBody, "base64url")), decipher.final()]).toString("utf8")
  const attempt = JSON.parse(body) as QuizAttempt
  if (!attempt.id || !Array.isArray(attempt.questions) || attempt.questions.length !== 15 || attempt.expiresAt < Date.now()) {
    throw new Error("Quiz attempt expired. Start another quiz.")
  }
  return attempt
}
