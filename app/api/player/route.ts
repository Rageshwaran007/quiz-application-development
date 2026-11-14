import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

function validName(value: unknown): value is string {
  return typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 30 && /^[\p{L}\p{M} .'-]+$/u.test(value.trim())
}

export async function GET() {
  const name = (await cookies()).get("quiz_player")?.value ?? null
  return NextResponse.json({ name })
}

export async function POST(request: NextRequest) {
  const { name } = await request.json()
  if (!validName(name)) return NextResponse.json({ error: "Enter a name between 2 and 30 letters." }, { status: 400 })
  const normalized = name.trim().replace(/\s+/g, " ")
  const response = NextResponse.json({ name: normalized })
  response.cookies.set("quiz_player", normalized, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ name: null })
  response.cookies.set("quiz_player", "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 })
  return response
}
