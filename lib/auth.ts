import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  userId: string;
  role: string;
}

// Since we're now using HTTP-only cookies managed by the server
// and verified by middleware, these client-side functions primarily
// provide utility to check roles and user info from any token available

export const isAuthenticated = (): boolean => {
  // With HTTP-only cookies, we can't directly access the token
  // Instead, we'll rely on AuthContext which makes an API call to /api/auth/me
  // For immediate checks, we'll just check if we're not on the login page
  // which means middleware didn't redirect us
  if (typeof window !== "undefined") {
    // If we're not on the auth page, we're likely authenticated
    // since middleware would redirect us otherwise
    return !window.location.pathname.includes("/auth");
  }
  return false;
};

// Verify JWT token and return decoded data
export const verifyJwtToken = async (
  token: string
): Promise<DecodedToken | null> => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);

    // Check if token is expired
    if (decoded.exp < Date.now() / 1000) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Error verifying JWT token:", error);
    return null;
  }
};

export const getDecodedToken = (): DecodedToken | null => {
  try {
    // If we need token data on client, we need to look at an API response
    // that has the user data since HTTP-only cookies aren't accessible via JS
    // This function should be paired with a getCurrentUser call in most cases
    const userDataElement = document.getElementById("__NEXT_DATA__");
    if (userDataElement && userDataElement.textContent) {
      const nextData = JSON.parse(userDataElement.textContent);
      if (nextData?.props?.pageProps?.user) {
        return {
          userId: nextData.props.pageProps.user._id,
          role: nextData.props.pageProps.user.role,
          exp: Date.now() / 1000 + 86400, // Assume token valid for at least a day
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error accessing user data:", error);
    return null;
  }
};

export const hasRole = (role: string | string[]): boolean => {
  const decoded = getDecodedToken();
  if (!decoded) return false;

  if (Array.isArray(role)) {
    return role.includes(decoded.role);
  }

  return decoded.role === role;
};

export const isTeacher = (): boolean => {
  return hasRole("teacher");
};

export const isHeadTeacherisHeadTeacher = (): boolean => {
  return hasRole("head_teacher");
};

export const isAdmin = (): boolean => {
  return hasRole("admin");
};

export const isStudent = (): boolean => {
  return hasRole("student");
};

export const getUserId = (): string | null => {
  const decoded = getDecodedToken();
  return decoded ? decoded.userId : null;
};
