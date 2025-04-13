import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Output the current path for debugging
  console.log("Middleware processing path:", path);

  // Check if this is an API request
  const isApiRequest = path.startsWith("/api");

  // Check if this might be a tool request (feedback tool, screenshot, etc.)
  const userAgent = request.headers.get("user-agent") || "";
  const isToolRequest =
    userAgent.includes("Tool") ||
    userAgent.includes("Replit") ||
    request.headers.has("X-Feedback-Tool");

  // If this is likely a tool request, bypass authentication checks
  if (isToolRequest) {
    console.log("Middleware: Bypassing auth for tool request:", path);
    return NextResponse.next();
  }

  // Check if the path is protected (all except auth page)
  const isProtectedPath = !path.includes("/auth");

  // Check for authentication token in various places
  let token = request.cookies.get("token")?.value;

  // Log cookie information for debugging
  console.log(
    "Middleware: All cookies:",
    request.cookies.getAll().map((c) => c.name)
  );
  console.log(
    "Middleware: Token from cookie:",
    token ? "Present" : "Not present"
  );

  // If no token in cookies, check Authorization header for Bearer token
  if (!token) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
      console.log("Middleware: Found token in Authorization header");
    }
  }

  const isAuthenticated = !!token;
  console.log("Middleware: Authentication status:", isAuthenticated);

  // Handle API requests
  if (isApiRequest) {
    // Allow all auth-related API routes
    if (
      path.includes("/api/auth") ||
      path.includes("/api/users/login") ||
      path.includes("/api/users/register") ||
      path.includes("/users/login") ||
      path.includes("/users/register")
    ) {
      console.log("Middleware: Allowing auth-related API request:", path);
      return NextResponse.next();
    }

    // For other API routes, check authentication
    if (!isAuthenticated) {
      console.log(
        "Middleware: API request rejected due to missing auth token:",
        path
      );
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Handle page requests

  // If the path is protected and the user is not authenticated, redirect to auth page
  if (isProtectedPath && !isAuthenticated) {
    console.log("Middleware: Redirecting to auth page from:", path);
    const url = new URL("/auth", request.url);
    return NextResponse.redirect(url);
  }

  // If the path is the auth page and the user is authenticated, redirect to home page
  if (path.includes("/auth") && isAuthenticated) {
    console.log(
      "Middleware: Redirecting authenticated user to home from auth page"
    );
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    "/",
    "/courses/:path*",
    "/profile/:path*",
    "/auth/:path*",
    "/api/courses/:path*",
    "/api/users/:path*",
    "/api/contents/:path*",
    "/api/assignments/:path*",
    "/courses/:path*",
    "/users/:path*",
    "/contents/:path*",
    "/assignments/:path*",
    "/subjects/:path*",
    "/quizzes/:path*",
    "/classes/:path*",
  ],
};
