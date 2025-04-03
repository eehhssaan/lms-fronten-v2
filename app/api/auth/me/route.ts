import { NextRequest, NextResponse } from 'next/server';

// Define the API endpoint we'll proxy to
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fictional-eureka-grg4vg9r56529w5g-8000.app.github.dev';

export async function GET(request: NextRequest) {
  try {
    // Try to get token from cookie first
    let token = request.cookies.get('token')?.value;
    
    // If no token in cookie, check if it's in the Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log('Found token in Authorization header instead of cookie');
      }
    }
    
    if (!token) {
      console.log('No authentication token found in cookie or header');
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log('Next.js API route: forwarding user info request');
    
    console.log(`Making request to: ${apiUrl}/api/users/me with token`);
    
    // Forward the request to the backend API with the auth token
    const response = await fetch(
      `${apiUrl}/api/users/me`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // Add credentials to include cookies in the cross-origin request
        credentials: 'include'
      }
    );
    
    // Get the response data and handle JSON parsing errors
    let data;
    try {
      // Log raw response data for debugging
      const text = await response.text();
      console.log('Next.js API route: received user info response raw text:', 
        text.length > 500 ? text.substring(0, 500) + '...' : text);
      
      // Try to parse the text as JSON
      data = text ? JSON.parse(text) : {};
      console.log('Next.js API route: received user info response status:', response.status);
    } catch (jsonError) {
      console.error('Error parsing JSON from user info response:', jsonError);
      return NextResponse.json(
        { success: false, message: 'The authentication server returned an invalid response. Please try again later.' },
        { status: 500 }
      );
    }
    
    // Handle token expiration specifically
    if (response.status === 401) {
      return NextResponse.json(
        { success: false, message: 'Your session has expired. Please login again.' },
        { status: 401 }
      );
    }
    
    // If response was successful but no user data was returned
    if (response.ok && !data.success) {
      return NextResponse.json(
        { success: false, message: 'User data could not be retrieved' },
        { status: 500 }
      );
    }
    
    // Return the response with the same status
    return NextResponse.json(data, { status: response.status });
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