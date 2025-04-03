import axios from "axios";
import { Course, User, Content } from "@/types";

// Determine the base URL for API requests
const getBaseUrl = () => {
  // Always use the API URL from environment variables
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// Function to get stored token
const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token") || null;
};

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Log request details for debugging
    console.log(`API Request to: ${config.baseURL}${config.url}`, {
      method: config.method,
      withCredentials: config.withCredentials,
    });

    // Try to get token from local storage (as a backup)
    const token = getStoredToken();

    // If we have a token in localStorage, add it to the Authorization header
    // This is a backup mechanism in case cookies aren't working properly
    if (token) {
      console.log("Adding Authorization header with token from local storage");
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("No token found in local storage for request");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response from: ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.error(`API Error from: ${error.config?.url}`, {
      message: error.message,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

// Authentication API

export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "student" | "teacher" | "admin";
}): Promise<{ token: string; data: User }> => {
  try {
    console.log("Registering user with data:", {
      ...userData,
      password: "[REDACTED]",
    });
    const response = await api.post("/api/users/register", userData);
    console.log("Registration response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Registration error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        withCredentials: error.config?.withCredentials,
      },
    });

    if (error.message === "Network Error") {
      throw new Error(
        "Unable to connect to the server. Please check your network or try again later."
      );
    }
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

export const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<{ token: string; data: User }> => {
  try {
    console.log("Logging in with email:", credentials.email);
    // Directly calling the backend API
    const response = await api.post("/api/users/login", credentials);
    console.log("Login response:", response.data);

    if (response.data.token && typeof window !== "undefined") {
      console.log("Storing token in localStorage and setting cookie");
      localStorage.setItem("auth_token", response.data.token);

      // Set the token in a cookie as well
      document.cookie = `token=${response.data.token}; path=/; max-age=2592000; SameSite=Lax`; // 30 days
    }

    return response.data;
  } catch (error: any) {
    console.error("Login error details:", error);
    if (error.message === "Network Error") {
      throw new Error(
        "Unable to connect to the server. Please check your network or try again later."
      );
    }
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    // Call logout endpoint to clear the cookie
    await api.post("/api/users/logout");

    // Clear both localStorage and cookie
    if (typeof window !== "undefined") {
      console.log("Removing token from localStorage and cookie");
      localStorage.removeItem("auth_token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  } catch (error) {
    console.error("Logout error:", error);

    // Still clear localStorage and cookie even if API call fails
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get("/api/users/me");
    return response.data.data;
  } catch (error: any) {
    if (error.message === "Network Error") {
      throw new Error(
        "Unable to connect to the server. Please check your network or try again later."
      );
    }
    throw new Error(error.response?.data?.message || "Failed to get user data");
  }
};

export const updateUserProfile = async (
  userData: Partial<User>
): Promise<User> => {
  try {
    const response = await api.put("/api/users/profile", userData);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update profile"
    );
  }
};

// Courses API

export const getCourses = async (params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
}): Promise<{
  data: Course[];
  count: number;
  pagination: { page: number; limit: number; totalPages: number };
}> => {
  try {
    const response = await api.get("/api/courses", { params });
    return response.data;
  } catch (error: any) {
    // Handle CORS errors which might not have a response
    if (error.message === "Network Error") {
      throw new Error(
        "Unable to connect to the server. Please check your network or try again later."
      );
    }
    throw new Error(error.response?.data?.message || "Failed to fetch courses");
  }
};

export const getCourse = async (courseId: string): Promise<Course> => {
  try {
    console.log(`API Client: Getting course with ID ${courseId}`);
    const response = await api.get(`/api/courses/${courseId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("API Client: Course response received", response.status);

    // Handle the case when we get a successful response but invalid data structure
    if (!response.data) {
      console.error("API Client: Empty response data");
      throw new Error("Server returned an empty response");
    }

    // Special handling for the success flag from our API
    if (response.data.success === false) {
      console.error(
        "API Client: Server returned error response",
        response.data
      );
      throw new Error(
        response.data.message || "Server returned an error response"
      );
    }

    // Check for the expected data structure
    if (!response.data.data) {
      // First check if the data itself is directly a course object (some APIs don't wrap in data property)
      if (response.data._id) {
        console.log(
          "API Client: Response contains course directly instead of in .data property"
        );
        return response.data;
      }

      console.error(
        "API Client: Invalid course data format (missing data property)",
        response.data
      );
      throw new Error("Invalid response format from server");
    }

    return response.data.data;
  } catch (error: any) {
    console.error("API Client: Error fetching course details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
        ? {
            url: error.config.url,
            method: error.config.method,
          }
        : "No config",
    });

    // Check for authentication errors specifically
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("You are not logged in. Please log in to get access");
    }

    throw new Error(error.response?.data?.message || "Failed to fetch course");
  }
};

export const getCourseContents = async (
  courseId: string
): Promise<Content[]> => {
  try {
    console.log(`API Client: Getting contents for course ${courseId}`);

    // Check backend API status before requesting contents
    try {
      const response = await api.get(`/api/courses/${courseId}/contents`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Course contents received:", response.data);

      // Handle the case when we get a successful response but invalid data structure
      if (!response.data) {
        console.log(
          "API Client: Empty response data for contents, returning empty array"
        );
        return []; // Return empty array instead of throwing
      }

      // Special handling for the success flag from our API
      if (response.data.success === false) {
        console.log(
          "API Client: Server returned error response for contents, returning empty array"
        );
        return [];
      }

      // Check for the expected data structure
      if (!response.data.data) {
        // First check if the data itself is directly an array (some APIs don't wrap in data property)
        if (Array.isArray(response.data)) {
          console.log(
            "API Client: Response contains contents array directly instead of in .data property"
          );
          return response.data;
        }

        console.log(
          "API Client: Invalid content data format (missing data property), returning empty array"
        );
        return []; // Return empty array instead of throwing
      }

      return response.data.data;
    } catch (err: any) {
      // If we get a 404, the endpoint might not exist yet
      if (err.response?.status === 404) {
        console.log(
          "API Client: Course contents endpoint returned 404. The endpoint may not be implemented yet."
        );

        // This is a graceful fallback - return empty array if the backend API is missing this endpoint
        return [];
      }

      // Rethrow for other errors to be handled by the main catch block
      throw err;
    }
  } catch (error: any) {
    console.error("API Client: Error fetching course contents:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
        ? {
            url: error.config.url,
            method: error.config.method,
          }
        : "No config",
    });

    // Check for authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log(
        "Authentication error while fetching course contents, returning empty array"
      );
      return [];
    }

    // For all other errors, also return empty array instead of throwing
    return [];
  }
};

export const createCourse = async (courseData: {
  title: string;
  code: string;
  description: string;
  subject: string;
  grade: string;
  teacher?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  maxStudents?: number;
}): Promise<Course> => {
  try {
    // If teacher is not provided, we'll use the current user's ID
    // (assuming they're a teacher or admin)
    if (!courseData.teacher) {
      // Try to get current user to use their ID as the teacher
      try {
        const currentUser = await getCurrentUser();
        courseData.teacher = currentUser._id;
      } catch (err) {
        console.error("Failed to get current user for teacher ID:", err);
        // Will proceed without it and let the backend handle the error
      }
    }

    const response = await api.post("/api/courses", courseData);
    return response.data.data;
  } catch (error: any) {
    console.error(
      "Course creation error:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Failed to create course");
  }
};

// Special handling for file downloads
export const downloadContent = async (
  contentId: string,
  filename: string
): Promise<void> => {
  try {
    const response = await api.get(`/api/contents/${contentId}/download`, {
      responseType: "blob",
    });

    // Create download link and trigger it
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || "download");
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new Error("Failed to download file");
  }
};

// Special handling for file uploads
export const submitAssignment = async (
  assignmentId: string,
  file: File | null,
  textSubmission?: string
): Promise<void> => {
  try {
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    if (textSubmission) {
      formData.append("textSubmission", textSubmission);
    }

    await api.post(`/api/assignments/${assignmentId}/submit`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to submit assignment"
    );
  }
};

export const getAssignmentSubmissions = async (
  assignmentId: string
): Promise<any[]> => {
  try {
    const response = await api.get(
      `/api/assignments/${assignmentId}/submissions`
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch submissions"
    );
  }
};

export const downloadSubmission = async (
  submissionId: string,
  attachmentId: string,
  filename: string
): Promise<void> => {
  try {
    const response = await api.get(
      `/api/assignments/submissions/${submissionId}/download/${attachmentId}`,
      { responseType: "blob" }
    );

    // Create download link and trigger it
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || "submission");
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new Error("Failed to download submission");
  }
};

// Course Enrollment APIs

export const enrollInCourse = async (courseId: string): Promise<Course> => {
  try {
    const response = await api.post(`/api/courses/${courseId}/enroll`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to enroll in course"
    );
  }
};

export const unenrollFromCourse = async (courseId: string): Promise<Course> => {
  try {
    const response = await api.post(`/api/courses/${courseId}/unenroll`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to unenroll from course"
    );
  }
};

export const getEnrolledCourses = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{
  data: Course[];
  count: number;
  pagination: { page: number; limit: number; totalPages: number };
}> => {
  try {
    const response = await api.get("/api/courses/enrolled", { params });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch enrolled courses"
    );
  }
};

// Bulk Enrollment APIs

export const enrollClassInCourse = async (
  courseId: string,
  classId: string
): Promise<Course> => {
  try {
    const response = await api.post(`/api/courses/${courseId}/enroll-class`, {
      classId,
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to enroll class in course"
    );
  }
};

export const addStudentsToClass = async (
  classId: string,
  studentIds: string[]
): Promise<any> => {
  try {
    const response = await api.post(`/api/classes/${classId}/students`, {
      students: studentIds,
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to add students to class"
    );
  }
};
