import { NextRequest, NextResponse } from "next/server";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fictional-eureka-grg4vg9r56529w5g-8000.app.github.dev";

export async function GET(request: NextRequest) {
  // Log the request
  console.log("Next.js API route: forwarding classes get request");

  try {
    // Try to get token from cookie first
    let token = request.cookies.get("token")?.value;

    // If no token in cookie, check Authorization header
    if (!token) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log(
          "Using token from Authorization header for classes request"
        );
      }
    }

    if (!token) {
      console.log(
        "No authentication token found in cookies or headers for classes request"
      );
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Build query parameters
    const url = new URL(`${apiUrl}/api/classes`);

    // Copy search params from original request to our new URL
    const originalUrl = new URL(request.url);
    originalUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    console.log("Forwarding classes request with token");

    // Forward the request to the backend API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Get the response data
    const responseData = await response.json();
    console.log("Next.js API route: received classes response:");
    console.log("Status:", response.status, response.statusText);
    console.log("Response data:", JSON.stringify(responseData, null, 2));

    // Return the response
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Log the request
  console.log("Next.js API route: forwarding class creation request");

  try {
    // Try to get token from cookie first
    let token = request.cookies.get("token")?.value;

    // If no token in cookie, check Authorization header
    if (!token) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log(
          "Using token from Authorization header for class creation request"
        );
      }
    }

    if (!token) {
      console.log(
        "No authentication token found in cookies or headers for class creation request"
      );
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();

    console.log("Forwarding class creation request with token");

    // Forward the request to the backend API
    const response = await fetch(`${apiUrl}/api/classes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    // Get the response data
    const responseData = await response.json();
    console.log("Next.js API route: received class creation response:");
    console.log("Status:", response.status, response.statusText);
    console.log("Response data:", JSON.stringify(responseData, null, 2));

    // Return the response
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create class" },
      { status: 500 }
    );
  }
}
