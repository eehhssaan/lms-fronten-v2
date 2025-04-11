import axios from "axios";
import { Course, User, Content, Class } from "@/types";

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
    // Don't log errors for logout endpoint since we expect it might not exist
    if (!error.config?.url?.includes("/api/users/logout")) {
      console.error(`API Error from: ${error.config?.url}`, {
        message: error.message,
        status: error.response?.status,
      });
    }
    return Promise.reject(error);
  }
);

// Authentication API

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<{ token: string; data: User }> => {
  try {
    console.log("Registering user with data:", {
      ...userData,
      password: "[REDACTED]",
    });
    const response = await api.post("/api/users/register", userData);
    console.log("Registration response:", response.data);

    // Store token if it exists
    if (response.data.token && typeof window !== "undefined") {
      localStorage.setItem("auth_token", response.data.token);
      document.cookie = `token=${response.data.token}; path=/; max-age=2592000; SameSite=Lax`; // 30 days
    }

    // Handle different response formats
    let userResponseData: User;

    // Case 1: Standard API format with 'data' property
    if (response.data.data) {
      userResponseData = response.data.data;
    }
    // Case 2: API responds with 'user' property instead
    else if (response.data.user) {
      userResponseData = {
        // Map _id to id if needed
        id: response.data.user._id || response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
        profilePicture: response.data.user.profilePicture,
        isActive: response.data.user.active,
        school: response.data.user.school,
        grade: response.data.user.grade,
        gender: response.data.user.gender,
        bio: response.data.user.bio,
        contactNumber: response.data.user.contactNumber,
        preferredLanguage: response.data.user.preferredLanguage,
        dateOfBirth: response.data.user.dateOfBirth,
        createdAt: response.data.user.createdAt,
        // Include original fields for compatibility
        _id: response.data.user._id,
        active: response.data.user.active,
        __v: response.data.user.__v,
      };
    }
    // Case 3: No user data found
    else {
      console.error("Unexpected API response format:", response.data);
      throw new Error("Invalid registration response format from server");
    }

    return {
      token: response.data.token,
      data: userResponseData,
    };
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

    // Enhanced error reporting
    if (error.message === "Invalid registration response format from server") {
      throw error;
    } else if (error.message === "Network Error") {
      throw new Error(
        "Unable to connect to the server. Please check your network or try again later."
      );
    } else if (error.response?.status === 409) {
      throw new Error(
        "Email already in use. Please use a different email address."
      );
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Registration failed. Please try again.");
    }
  }
};

export const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<{ token: string; data: User }> => {
  try {
    console.log("Logging in with email:", credentials.email);
    const response = await api.post("/api/users/login", credentials);
    console.log("Login response:", response.data);

    // Store token if it exists
    if (response.data.token && typeof window !== "undefined") {
      console.log("Storing token in localStorage and setting cookie");
      localStorage.setItem("auth_token", response.data.token);
      document.cookie = `token=${response.data.token}; path=/; max-age=2592000; SameSite=Lax`; // 30 days
    }

    // Handle different response formats
    let userData: User;

    // Case 1: Standard API format with 'data' property
    if (response.data.data) {
      userData = response.data.data;
    }
    // Case 2: API responds with 'user' property instead
    else if (response.data.user) {
      userData = {
        // Map _id to id if needed
        id: response.data.user._id || response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
        profilePicture: response.data.user.profilePicture,
        isActive: response.data.user.active,
        school: response.data.user.school,
        grade: response.data.user.grade,
        gender: response.data.user.gender,
        bio: response.data.user.bio,
        contactNumber: response.data.user.contactNumber,
        preferredLanguage: response.data.user.preferredLanguage,
        dateOfBirth: response.data.user.dateOfBirth,
        createdAt: response.data.user.createdAt,
        // Include original fields for compatibility
        _id: response.data.user._id,
        active: response.data.user.active,
        __v: response.data.user.__v,
      };
    }
    // Case 3: No user data found
    else {
      console.error("Unexpected API response format:", response.data);
      throw new Error("Invalid login response format from server");
    }

    return {
      token: response.data.token,
      data: userData,
    };
  } catch (error: any) {
    console.error("Login error details:", error);

    // Enhanced error reporting
    if (error.message === "Invalid login response format from server") {
      throw error;
    } else if (error.message === "Network Error") {
      throw new Error(
        "Unable to connect to the server. Please check your network or try again later."
      );
    } else if (error.response?.status === 401) {
      throw new Error("Invalid email or password");
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Login failed. Please try again.");
    }
  }
};

export const forgotPassword = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post("/api/users/forgot-password", { email });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to process password reset request"
    );
  }
};

export const resetPassword = async (
  token: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post(`/api/users/reset-password/${token}`, {
      password,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to reset password"
    );
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    // Try to call logout endpoint, but don't throw if it fails
    try {
      await api.post("/api/users/logout");
    } catch (error) {
      console.log(
        "Backend logout endpoint not available - clearing local state only"
      );
    }

    // Always clear local storage and cookies
    if (typeof window !== "undefined") {
      console.log("Removing token from localStorage and cookie");
      localStorage.removeItem("auth_token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear localStorage and cookie even if something fails
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get("/api/users/me");
    console.log("getCurrentUser response:", response.data);

    // Handle different response formats
    let userData: User;

    // Case 1: Standard API format with 'data' property
    if (response.data.data) {
      userData = response.data.data;

      // Ensure id is present (mapped from _id if needed)
      if (!userData.id && userData._id) {
        userData.id = userData._id;
      }
    }
    // Case 2: Response has user property
    else if (response.data.user) {
      userData = {
        id: response.data.user._id || response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
        profilePicture: response.data.user.profilePicture,
        isActive: response.data.user.active,
        school: response.data.user.school,
        grade: response.data.user.grade,
        gender: response.data.user.gender,
        bio: response.data.user.bio,
        contactNumber: response.data.user.contactNumber,
        preferredLanguage: response.data.user.preferredLanguage,
        dateOfBirth: response.data.user.dateOfBirth,
        createdAt: response.data.user.createdAt,
        // Include original properties for compatibility
        _id: response.data.user._id,
        active: response.data.user.active,
        __v: response.data.user.__v,
      };
    }
    // Case 3: User data is directly in the response
    else if (response.data._id || response.data.id) {
      userData = {
        id: response.data._id || response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        profilePicture: response.data.profilePicture,
        isActive: response.data.active,
        school: response.data.school,
        grade: response.data.grade,
        gender: response.data.gender,
        bio: response.data.bio,
        contactNumber: response.data.contactNumber,
        preferredLanguage: response.data.preferredLanguage,
        dateOfBirth: response.data.dateOfBirth,
        createdAt: response.data.createdAt,
        // Include original properties for compatibility
        _id: response.data._id,
        active: response.data.active,
        __v: response.data.__v,
      };
    }
    // Case 4: No valid user data found
    else {
      console.error(
        "Invalid user data format received from server:",
        response.data
      );
      throw new Error("Invalid user data format received from server");
    }

    // Ensure all required fields are present
    if (!userData.id || !userData.name || !userData.email || !userData.role) {
      console.error("Missing required user fields:", userData);
      throw new Error("Incomplete user data received from server");
    }

    return userData;
  } catch (error: any) {
    console.error("getCurrentUser error:", error);

    // Enhanced error handling
    if (error.message === "Network Error") {
      throw new Error(
        "Unable to connect to the server. Please check your network or try again later."
      );
    } else if (error.response?.status === 401) {
      throw new Error(
        "Authentication token expired or invalid. Please log in again."
      );
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message.includes("Invalid user data")) {
      throw error; // Pass through our custom errors
    } else {
      throw new Error("Failed to get user data. Please try logging in again.");
    }
  }
};

export const updateUserProfile = async (userData: {
  name?: string;
  profilePicture?: File;
  school?: string;
  grade?: string;
  gender?: string;
  bio?: string;
  contactNumber?: string;
  preferredLanguage?: string;
  dateOfBirth?: string;
}): Promise<User> => {
  try {
    // If there's a profile picture, use FormData
    if (userData.profilePicture instanceof File) {
      const formData = new FormData();
      formData.append("profilePicture", userData.profilePicture);

      // Add other fields to FormData
      Object.entries(userData).forEach(([key, value]) => {
        if (
          key !== "profilePicture" &&
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          formData.append(key, value);
        }
      });

      const response = await api.put("/api/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    }

    // For regular updates without file, use JSON
    const response = await api.put("/api/users/profile", userData);
    return response.data.data;
  } catch (error: any) {
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error("Please log in to update your profile");
    }
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || "Invalid profile data");
    }
    throw new Error(
      error.response?.data?.message || "Failed to update profile"
    );
  }
};

export const updateUserPassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.put("/api/users/password", passwordData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update password"
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
      if (response.data.id) {
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
  courseId: string,
  params?: {
    moduleNumber?: number;
    lessonNumber?: number;
    type?: string;
  }
): Promise<Content[]> => {
  try {
    console.log(`API Client: Getting contents for course ${courseId}`);

    const queryParams = new URLSearchParams({
      courseId: courseId,
      ...(params?.moduleNumber && {
        moduleNumber: params.moduleNumber.toString(),
      }),
      ...(params?.lessonNumber && {
        lessonNumber: params.lessonNumber.toString(),
      }),
      ...(params?.type && { type: params.type }),
    });

    const response = await api.get(`/api/contents?${queryParams.toString()}`);

    if (!response.data.success) {
      console.log("API Client: Server returned error response for contents");
      throw new Error(
        response.data.message || "Failed to fetch course contents"
      );
    }

    return response.data.data || [];
  } catch (error: any) {
    console.error("API Client: Error fetching course contents:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Check for authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Authentication required. Please log in again.");
    }

    throw new Error(
      error.response?.data?.message || "Failed to fetch course contents"
    );
  }
};

export const createCourse = async (courseData: {
  title: string;
  description: string;
  code: string;
  isActive?: boolean;
  coverImage?: string;
  category?: string;
}): Promise<Course> => {
  try {
    const response = await api.post("/api/courses", courseData);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("You must be logged in to create a course");
    }
    throw new Error(error.response?.data?.message || "Failed to create course");
  }
};

// Special handling for file downloads
export const downloadContent = async (
  contentId: string,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/contents/${contentId}/download`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getStoredToken()}`,
        },
      }
    );

    if (!response.ok) {
      // Handle specific error cases
      switch (response.status) {
        case 401:
          throw new Error("Please log in to download materials");
        case 403:
          throw new Error(
            "You do not have permission to download this material"
          );
        case 404:
          throw new Error("Material not found");
        default:
          throw new Error("Failed to download file");
      }
    }

    // Get total size
    const contentLength = response.headers.get("content-length");
    const total = parseInt(contentLength || "0", 10);

    // Create response reader
    const reader = response.body!.getReader();
    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    // Read the data chunks
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      chunks.push(value);
      receivedLength += value.length;

      // Report progress if callback provided
      if (onProgress && total) {
        const progress = (receivedLength / total) * 100;
        onProgress(progress);
      }
    }

    // Combine chunks into single Uint8Array
    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (let chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }

    // Create blob and download
    const blob = new Blob([chunksAll], {
      type: response.headers.get("content-type") || "application/pdf",
    });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "course-material.pdf";
    document.body.appendChild(a);
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error: any) {
    console.error("Download error:", error);
    throw error;
  }
};

export const deleteCourseContent = async (contentId: string): Promise<void> => {
  try {
    console.log(`API Client: Deleting content with ID ${contentId}`);
    const response = await api.delete(`/api/contents/${contentId}`);

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to delete course content"
      );
    }
  } catch (error: any) {
    console.error("API Client: Error deleting course content:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Handle specific error cases as per backend documentation
    switch (error.response?.status) {
      case 403:
        throw new Error(
          "You don't have permission to delete this content. Only course teachers and admins can delete content."
        );
      case 404:
        if (error.response?.data?.message?.includes("course")) {
          throw new Error("The associated course was not found");
        } else {
          throw new Error("The content you're trying to delete was not found");
        }
      default:
        throw new Error(
          error.response?.data?.message || "Failed to delete course content"
        );
    }
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
    // Handle specific curriculum-related errors
    if (error.response?.data?.code === "CLASS_ENROLLMENT_LIMIT") {
      throw new Error(
        "Course has limited capacity. Cannot enroll all students."
      );
    }
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

// Class APIs
export const getAvailableClasses = async (): Promise<
  { id: string; name: string }[]
> => {
  try {
    const response = await api.get("/api/classes/available");
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch available classes"
    );
  }
};

// Class Management APIs
export const createClass = async (classData: {
  name: string;
  code: string;
  formLevel: "Form 4" | "Form 5" | "Form 6" | "AS" | "A2";
  academicYear: string;
  department?: string;
  description?: string;
  classTeacher?: string;
}): Promise<{
  id: string;
  name: string;
  code: string;
  formLevel: "Form 4" | "Form 5" | "Form 6" | "AS" | "A2";
  academicYear: string;
  department?: string;
  description?: string;
  classTeacher: string;
  students: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}> => {
  try {
    // Validate form level
    if (
      !["Form 4", "Form 5", "Form 6", "AS", "A2"].includes(classData.formLevel)
    ) {
      throw new Error(
        "Invalid form level. Must be one of: Form 4, Form 5, Form 6, AS, A2"
      );
    }

    const response = await api.post("/api/classes", classData);
    return response.data.data; // Extract the data from the success response
  } catch (error: any) {
    // Check for specific error about duplicate class code
    if (
      error.response?.status === 400 &&
      error.response.data?.message?.includes("already exists")
    ) {
      throw new Error(
        `A class with this code already exists. Please choose a different code.`
      );
    }
    throw new Error(error.response?.data?.message || "Failed to create class");
  }
};

export const getClasses = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{
  data: {
    id: string;
    name: string;
    code: string;
    academicYear: string;
    department?: string;
    gradeLevel?: string;
    description?: string;
    classTeacher: string;
    students: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
  count: number;
  pagination: { page: number; limit: number; totalPages: number };
}> => {
  try {
    const response = await api.get("/api/classes", { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch classes");
  }
};

export async function getClass(classId: string): Promise<Class> {
  try {
    // First get the class details with populated students
    const classResponse = await api.get(
      `/api/classes/${classId}?populate=students`
    );
    const classData = classResponse.data.data;

    // If there are course IDs, fetch the full course details
    if (classData.courses && classData.courses.length > 0) {
      // Get all courses
      const coursesResponse = await api.get("/api/courses");
      const allCourses = coursesResponse.data.data;

      // Map the course IDs to full course objects
      const populatedCourses = classData.courses
        .map((courseId: string) =>
          allCourses.find((course: Course) => course.id === courseId)
        )
        .filter(Boolean); // Remove any undefined values

      // Return the class data with populated courses
      return {
        ...classData,
        courses: populatedCourses,
      };
    }

    // If no courses, return the class data as is with empty courses array
    return {
      ...classData,
      courses: [],
    };
  } catch (error: any) {
    // Check for authentication errors specifically
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("You are not logged in. Please log in to get access");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch class details"
    );
  }
}

export async function updateClass(
  classId: string,
  classData: Partial<
    Omit<Class, "id" | "students" | "courses" | "createdAt" | "updatedAt">
  >
): Promise<Class> {
  try {
    const response = await api.put(`/api/classes/${classId}`, classData);
    return response.data.data;
  } catch (error: any) {
    // Check for specific error about duplicate class code
    if (error.response?.data?.code === "DUPLICATE_CLASS_CODE") {
      throw new Error("A class with this code already exists");
    }
    // Check for authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("You are not logged in. Please log in to get access");
    }
    throw new Error(error.response?.data?.message || "Failed to update class");
  }
}

export const removeStudentFromClass = async (
  classId: string,
  studentId: string
): Promise<void> => {
  try {
    await api.delete(`/api/classes/${classId}/students/${studentId}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to remove student from class"
    );
  }
};

export const getAllUsers = async (): Promise<
  {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
  }[]
> => {
  try {
    const response = await api.get("/api/users");
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

// Update the getAvailableStudents function to use getAllUsers
export const getAvailableStudents = async (
  classId: string
): Promise<
  {
    id: string;
    name: string;
    email: string;
    role: string;
  }[]
> => {
  try {
    const allUsers = await getAllUsers();
    // Filter for students only
    return allUsers.filter((user) => user.role === "student");
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch available students"
    );
  }
};

// Update the existing addStudentsToClass function to handle single student
export const addStudentToClass = async (
  classId: string,
  studentId: string
): Promise<void> => {
  try {
    await api.post(`/api/classes/${classId}/students`, {
      students: [studentId],
    });
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to add student to class"
    );
  }
};

export const getClassCourses = async (classId: string): Promise<Course[]> => {
  try {
    const response = await api.get(`/api/classes/${classId}/courses`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch class courses"
    );
  }
};

// Update the class-course management endpoints
export const assignCourseToClass = async (
  classId: string,
  courseId: string
): Promise<void> => {
  try {
    await api.post(`/api/classes/${classId}/courses`, {
      courseId,
    });
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to assign course to class"
    );
  }
};

export const removeCourseFromClass = async (
  classId: string,
  courseId: string
): Promise<void> => {
  try {
    await api.delete(`/api/classes/${classId}/courses/${courseId}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to remove course from class"
    );
  }
};

export const createCourseContent = async (
  courseId: string,
  formData: FormData
): Promise<Content> => {
  try {
    const response = await api.post(`/api/contents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create content");
    }

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Content creation error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to create content"
    );
  }
};

export const uploadCourseFile = async (
  courseId: string,
  file: File | null,
  description?: string
): Promise<void> => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", courseId);
    if (description) {
      formData.append("description", description);
    }
    formData.append("type", "file"); // Indicate this is a file upload

    await api.post(`/api/contents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error: any) {
    console.error("File upload failed:", error);
    throw new Error(error.response?.data?.message || "Failed to upload file");
  }
};

// User Profile Management APIs
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get("/api/users/me");
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch profile");
  }
};

export const getStudentCourses = async () => {
  try {
    const response = await api.get("/api/users/me/courses");
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch courses");
  }
};

export const getTeachingCourses = async () => {
  try {
    const response = await api.get("/api/users/me/teaching");
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch teaching courses"
    );
  }
};

export const updateCourse = async (
  courseId: string,
  courseData: Partial<{
    title: string;
    description: string;
    code: string;
    isActive: boolean;
    coverImage: string;
    category: string;
  }>
): Promise<Course> => {
  try {
    const response = await api.put(`/api/courses/${courseId}`, courseData);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update course");
  }
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  try {
    console.log("Attempting to delete course:", courseId);
    const response = await api.delete(`/api/courses/${courseId}`);

    // Check if the deletion was successful
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete course");
    }

    console.log("Course deleted successfully");
  } catch (error: any) {
    console.error(
      "Course deletion error:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Failed to delete course");
  }
};

// Assignment APIs
export const createAssignment = async (formData: FormData) => {
  const response = await api.post("/api/assignments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getAssignments = async (
  courseId: string,
  moduleNumber?: number,
  isPublished?: boolean
) => {
  const params = new URLSearchParams();
  params.append("courseId", courseId);
  if (moduleNumber !== undefined)
    params.append("moduleNumber", moduleNumber.toString());
  if (isPublished !== undefined)
    params.append("isPublished", isPublished.toString());

  const response = await api.get(`/api/assignments?${params.toString()}`);
  return response.data;
};

export const getAssignment = async (id: string) => {
  const response = await api.get(`/api/assignments/${id}`);
  return response.data;
};

export const updateAssignment = async (id: string, formData: FormData) => {
  const response = await api.put(`/api/assignments/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteAssignment = async (id: string): Promise<void> => {
  try {
    console.log(`API Client: Deleting assignment with ID ${id}`);
    const response = await api.delete(`/api/assignments/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete assignment");
    }
  } catch (error: any) {
    console.error("API Client: Error deleting assignment:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Handle specific error cases
    switch (error.response?.status) {
      case 401:
        throw new Error("Please log in to delete assignments");
      case 403:
        throw new Error("You don't have permission to delete this assignment");
      case 404:
        throw new Error("Assignment not found");
      default:
        throw new Error(
          error.response?.data?.message || "Failed to delete assignment"
        );
    }
  }
};

// Assignment Submission APIs
export const submitAssignmentWithFiles = async (
  assignmentId: string,
  formData: FormData
) => {
  const response = await api.post(
    `/api/assignments/${assignmentId}/submit`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getMyAssignmentSubmission = async (assignmentId: string) => {
  const response = await api.get(
    `/api/assignments/${assignmentId}/my-submission`
  );
  return response.data;
};

export const getAllAssignmentSubmissions = async (assignmentId: string) => {
  const response = await api.get(
    `/api/assignments/${assignmentId}/submissions`
  );
  return response.data;
};

export const gradeAssignmentSubmission = async (
  submissionId: string,
  data: { score: number; feedback?: string }
) => {
  const response = await api.put(
    `/api/assignments/submissions/${submissionId}`,
    data
  );
  return response.data;
};

export const downloadAssignmentAttachment = async (
  submissionId: string,
  attachmentId: string
) => {
  const response = await api.get(
    `/api/assignments/submissions/${submissionId}/download/${attachmentId}`,
    { responseType: "blob" }
  );
  return response.data;
};

export const updateCourseContent = async (
  contentId: string,
  data:
    | FormData
    | {
        title?: string;
        description?: string;
        type?: "document" | "video" | "link" | "text";
        moduleNumber?: number;
        lessonNumber?: number;
        order?: number;
        link?: string;
        textContent?: string;
      }
): Promise<Content> => {
  try {
    console.log(`API Client: Updating content with ID ${contentId}`);

    let response;
    if (data instanceof FormData) {
      response = await api.put(`/api/contents/${contentId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      response = await api.put(`/api/contents/${contentId}`, data);
    }

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update content");
    }

    return response.data.data;
  } catch (error: any) {
    console.error("API Client: Error updating course content:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Handle specific error cases
    switch (error.response?.status) {
      case 401:
        throw new Error("Please log in to update content");
      case 403:
        throw new Error(
          "You don't have permission to update this content. Only course teachers and admins can update content."
        );
      case 404:
        throw new Error("The content you're trying to update was not found");
      case 400:
        throw new Error(
          error.response?.data?.message || "Invalid update data provided"
        );
      default:
        throw new Error(
          error.response?.data?.message || "Failed to update content"
        );
    }
  }
};
