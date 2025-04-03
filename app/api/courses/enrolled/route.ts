import { NextRequest, NextResponse } from "next/server";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fictional-eureka-grg4vg9r56529w5g-8000.app.github.dev";

export async function GET(request: NextRequest) {
  // Log the request
  console.log("Next.js API route: forwarding enrolled courses get request");

  try {
    // Try to get token from cookie first
    let token = request.cookies.get("token")?.value;

    // If no token in cookie, check Authorization header
    if (!token) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log(
          "Using token from Authorization header for enrolled courses request"
        );
      }
    }

    if (!token) {
      console.log(
        "No authentication token found in cookies or headers for enrolled courses request"
      );
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Build query parameters
    const url = new URL(`${apiUrl}/api/courses/enrolled`);

    // Copy search params from original request to our new URL
    const originalUrl = new URL(request.url);
    originalUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    console.log("Forwarding enrolled courses request with token");

    // Forward the request to the backend API with token
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Get the response data and handle JSON parsing errors
    let responseData;
    try {
      // Log raw response data for debugging
      const text = await response.text();
      console.log(
        "Next.js API route: received enrolled courses response raw text:",
        text.length > 500 ? text.substring(0, 500) + "..." : text
      );

      // Try to parse the text as JSON
      responseData = text ? JSON.parse(text) : {};
      console.log("Next.js API route: received enrolled courses response");
    } catch (jsonError) {
      console.error(
        "Error parsing JSON from enrolled courses response:",
        jsonError
      );
      return NextResponse.json(
        {
          success: false,
          message:
            "The server returned an invalid response. Please try again later.",
        },
        { status: 500 }
      );
    }

    // Check if we received an error response from the backend
    if (!response.ok) {
      console.log(
        "Error response from backend for enrolled courses:",
        response.status
      );

      // If we got a 401/403 error even though we sent a token, there might be an issue with the token
      if (response.status === 401 || response.status === 403) {
        console.log(
          "Authentication error despite having a token. Token might be invalid or expired."
        );
        return NextResponse.json(
          {
            success: false,
            message:
              "Your session has expired or is invalid. Please log in again.",
          },
          { status: 401 }
        );
      }

      // Handle other error cases
      return NextResponse.json(
        {
          success: false,
          message:
            responseData.message ||
            "Failed to fetch enrolled courses from the server",
        },
        { status: response.status }
      );
    }

    // Return the response
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch enrolled courses" },
      { status: 500 }
    );
  }
}
