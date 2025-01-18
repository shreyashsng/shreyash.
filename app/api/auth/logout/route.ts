import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  cookies().delete('is_admin')
  return NextResponse.json({ success: true })
} 