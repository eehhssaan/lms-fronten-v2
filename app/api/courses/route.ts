import { NextRequest, NextResponse } from "next/server";

// Define the API endpoint we'll proxy to
const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fictional-eureka-grg4vg9r56529w5g-8000.app.github.dev";

export async function POST(request: NextRequest) {
  // Log the request
  console.log("Next.js API route: forwarding course creation request");

  try {
    // Try to get token from cookie first
    let token = request.cookies.get("token")?.value;

    // If no token in cookie, check Authorization header
    if (!token) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log(
          "Using token from Authorization header for course creation request"
        );
      }
    }

    if (!token) {
      console.log(
        "No authentication token found in cookies or headers for course creation request"
      );
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the request body
    const courseData = await request.json();
    console.log("Course creation data:", courseData);

    console.log("Forwarding course creation request with token");

    // Forward the request to the backend API
    const response = await fetch(`${apiUrl}/api/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(courseData),
    });

    // Get the response data and handle JSON parsing errors
    let responseData;
    try {
      // Log raw response data for debugging
      const text = await response.text();
      console.log(
        "Next.js API route: received course creation response raw text:",
        text.length > 500 ? text.substring(0, 500) + "..." : text
      );

      // Try to parse the text as JSON
      responseData = text ? JSON.parse(text) : {};
      console.log(
        "Next.js API route: received course creation response:",
        responseData
      );
    } catch (jsonError) {
      console.error(
        "Error parsing JSON from course creation response:",
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

    // Return the response
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create course" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Log the request
  console.log("Next.js API route: forwarding courses get request");

  try {
    // Try to get token from cookie first
    let token = request.cookies.get("token")?.value;

    // If no token in cookie, check Authorization header
    if (!token) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log(
          "Using token from Authorization header for courses request"
        );
      }
    }

    if (!token) {
      console.log(
        "No authentication token found in cookies or headers for courses request"
      );
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Build query parameters
    const url = new URL(`${apiUrl}/api/courses`);

    // Copy search params from original request to our new URL
    const originalUrl = new URL(request.url);
    originalUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    console.log("Forwarding courses request with token");

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
        "Next.js API route: received courses response raw text:",
        text.length > 500 ? text.substring(0, 500) + "..." : text
      );

      // Try to parse the text as JSON
      responseData = text ? JSON.parse(text) : {};
      console.log("Next.js API route: received courses response");
    } catch (jsonError) {
      console.error("Error parsing JSON from courses response:", jsonError);
      return NextResponse.json(
        {
          success: false,
          message:
            "The server returned an invalid response. Please try again later.",
        },
        { status: 500 }
      );
    }

    // Return the response
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
