import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/auth";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fictional-eureka-grg4vg9r56529w5g-8000.app.github.dev";

// Helper function to check if user can modify course
async function canModifyCourse(userId: string, courseId: string, role: string) {
  try {
    const response = await fetch(`${apiUrl}/api/courses/${courseId}`);
    const course = await response.json();

    return (
      role === "admin" ||
      (role === "teacher" && course.data.teacher._id === userId)
    );
  } catch (error) {
    console.error("Error checking course permissions:", error);
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Skip if the ID is 'enrolled' as that's handled by a different route
  if (params.id === "enrolled") {
    return NextResponse.json(
      { success: false, message: "Invalid course ID" },
      { status: 400 }
    );
  }

  // Log the request
  console.log(
    `Next.js API route: forwarding course detail request for course ${params.id}`
  );

  try {
    // Try to get token from cookie first
    let token = request.cookies.get("token")?.value;

    // If no token in cookie, check Authorization header
    if (!token) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log(
          "Using token from Authorization header for course detail request"
        );
      }
    }

    // Log detailed token information for debugging
    console.log(
      "Course details API: Cookies available:",
      request.cookies.getAll().map((c) => c.name)
    );
    console.log(
      "Course details API: Auth header present:",
      !!request.headers.get("Authorization")
    );

    if (token) {
      console.log("Course details API: Token found, length:", token.length);
      console.log(
        "Course details API: Token first 10 chars:",
        token.substring(0, 10) + "..."
      );
    } else {
      console.log(
        "⚠️ Course details API: No token found in cookies or Authorization header"
      );
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(
      `Course details API: Forwarding request for course ${params.id} with token`
    );

    // Forward the request to the backend API with token
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    console.log(
      `Making request to: ${apiUrl}/api/courses/${params.id} with token`
    );

    // Make the request with the token in the Authorization header
    const response = await fetch(`${apiUrl}/api/courses/${params.id}`, {
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
        `Next.js API route: received course detail response for ${params.id} raw text:`,
        text.length > 500 ? text.substring(0, 500) + "..." : text
      );

      // Try to parse the text as JSON
      responseData = text ? JSON.parse(text) : {};
      console.log(
        `Next.js API route: received course detail response for ${params.id}:`
      );
      console.log("Status:", response.status, response.statusText);
      console.log("Response data:", JSON.stringify(responseData, null, 2));
    } catch (jsonError) {
      console.error(
        "Error parsing JSON from course detail response:",
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
        `Error response from backend for course ${params.id}:`,
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
            "Failed to fetch course details from the server",
        },
        { status: response.status }
      );
    }

    // If response data has unexpected format, handle gracefully
    if (!responseData.data && !responseData.success) {
      console.error("Unexpected response format:", responseData);
      return NextResponse.json(
        {
          success: false,
          message: "Received unexpected data format from the server",
        },
        { status: 500 }
      );
    }

    // Return the successful response
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch course details" },
      { status: 500 }
    );
  }
}

// UPDATE course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Not authorized to access this route" },
        { status: 401 }
      );
    }

    // Verify token and get user info
    const token = authHeader.split(" ")[1];
    const decoded = await verifyJwtToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user can modify the course
    const hasPermission = await canModifyCourse(
      decoded.userId,
      params.id,
      decoded.role
    );
    if (!hasPermission) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to update this course",
        },
        { status: 403 }
      );
    }

    // Get update data from request body
    const updateData = await request.json();

    // Forward the request to the backend API
    const response = await fetch(`${apiUrl}/api/courses/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    // Handle different response scenarios
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: "Course not found" },
          { status: 404 }
        );
      }
      if (response.status === 400) {
        return NextResponse.json(data, { status: 400 });
      }
      throw new Error("Failed to update course");
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

// DELETE course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Not authorized to access this route" },
        { status: 401 }
      );
    }

    // Verify token and get user info
    const token = authHeader.split(" ")[1];
    const decoded = await verifyJwtToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user can modify the course
    const hasPermission = await canModifyCourse(
      decoded.userId,
      params.id,
      decoded.role
    );
    if (!hasPermission) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to delete this course",
        },
        { status: 403 }
      );
    }

    // Forward the delete request to the backend API
    const response = await fetch(`${apiUrl}/api/courses/${params.id}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: "Course not found" },
          { status: 404 }
        );
      }
      throw new Error("Failed to delete course");
    }

    return NextResponse.json(
      { success: true, message: "Course deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
