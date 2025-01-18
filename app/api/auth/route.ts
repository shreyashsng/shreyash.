import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    if (username === process.env.ADMIN_ID && password === process.env.ADMIN_PASSWORD) {
      // Set auth cookie
      cookies().set('is_admin', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      })
      
      return NextResponse.json({ success: true })
    }
    
    return new NextResponse('Unauthorized', { status: 401 })
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
} 