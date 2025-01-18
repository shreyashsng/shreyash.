import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    // Add console.log for debugging (remove in production)
    console.log('Received credentials:', { 
      username, 
      password,
      expected: {
        username: process.env.ADMIN_ID,
        passwordMatch: password === process.env.ADMIN_PASSWORD
      }
    })
    
    if (username === process.env.ADMIN_ID && password === process.env.ADMIN_PASSWORD) {
      // Set auth cookie
      cookies().set('is_admin', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      })
      
      return NextResponse.json({ success: true })
    }
    
    // Return more specific error
    return new NextResponse(
      JSON.stringify({ error: 'Invalid credentials' }), 
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 