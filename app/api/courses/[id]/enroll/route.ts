import { NextRequest, NextResponse } from 'next/server';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fictional-eureka-grg4vg9r56529w5g-8000.app.github.dev';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Log the request
  console.log(`Next.js API route: forwarding course enrollment request for course ${params.id}`);
  
  try {
    // Try to get token from cookie first
    let token = request.cookies.get('token')?.value;
    
    // If no token in cookie, check Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log('Using token from Authorization header for course enrollment request');
      }
    }
    
    if (!token) {
      console.log('No authentication token found in cookies or headers for course enrollment request');
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log(`Forwarding course enrollment request for course ${params.id} with token`);

    // Forward the request to the backend API
    const response = await fetch(`${apiUrl}/api/courses/${params.id}/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Get the response data
    const responseData = await response.json();
    console.log(`Next.js API route: received course enrollment response for ${params.id}:`);
    console.log('Status:', response.status, response.statusText);
    console.log('Response data:', JSON.stringify(responseData, null, 2));

    // Return the response
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}