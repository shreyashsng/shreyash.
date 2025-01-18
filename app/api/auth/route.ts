import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    // Debug log (remove in production)
    console.log('Auth attempt:', {
      receivedUsername: username,
      expectedUsername: process.env.ADMIN_ID,
      usernameMatch: username === process.env.ADMIN_ID,
      receivedPassword: '***' + password.slice(-4),
      expectedPassword: '***' + process.env.ADMIN_PASSWORD?.slice(-4),
      passwordMatch: password === process.env.ADMIN_PASSWORD,
      envVarsPresent: {
        ADMIN_ID: !!process.env.ADMIN_ID,
        ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD
      }
    })

    // Strict comparison
    const isValidUsername = username === process.env.ADMIN_ID
    const isValidPassword = password === process.env.ADMIN_PASSWORD

    if (isValidUsername && isValidPassword) {
      cookies().set('is_admin', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24,
      })
      
      return NextResponse.json({ success: true })
    }
    
    // More specific error message
    return new NextResponse(
      JSON.stringify({ 
        error: 'Invalid credentials',
        debug: {
          usernameValid: isValidUsername,
          passwordValid: isValidPassword
        }
      }), 
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