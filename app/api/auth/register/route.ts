import { NextRequest, NextResponse } from 'next/server';

// Define the API endpoint we'll proxy to
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fictional-eureka-grg4vg9r56529w5g-8000.app.github.dev';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    console.log('Next.js API route: forwarding registration request');
    
    // Enforce student role for all registrations regardless of what's sent
    // This aligns with backend requirements
    const modifiedUserData = {
      ...userData,
      role: 'student'
    };
    
    // Map frontend field names to backend field names
    const mappedUserData = {
      ...modifiedUserData,
      name: `${userData.firstName} ${userData.lastName}` // Create name field from firstName and lastName
    };
    
    console.log('Mapped registration data:', { ...mappedUserData, password: '[REDACTED]' });
    
    // Forward the request to the backend API
    const response = await fetch(
      `${apiUrl}/api/users/register`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedUserData),
      }
    );
    
    // Get the response data
    const data = await response.json();
    console.log('Next.js API route: received registration response:', data);
    
    // If the response is successful but we have no token, something went wrong
    if (response.ok && !data.token) {
      return NextResponse.json(
        { success: false, message: 'Registration succeeded but authentication failed' },
        { status: 500 }
      );
    }
    
    // Create a response object
    const responseData = NextResponse.json(data, { status: response.status });
    
    // Set the token as an HTTP-only cookie if registration was successful
    if (response.ok && data.token) {
      // Set the token directly on the NextResponse object
      responseData.cookies.set({
        name: 'token',
        value: data.token,
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        // 30 days expiry
        maxAge: 60 * 60 * 24 * 30
      });
    }
    
    return responseData;
  } catch (error: any) {
    console.error('API proxy error:', error);
    
    // Provide more detailed error message for network errors
    if (error.message && error.message.includes('fetch')) {
      return NextResponse.json(
        { success: false, message: 'Unable to connect to authentication service. Please try again later.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}