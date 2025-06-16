import axios from "axios";
import {
  Course,
  User,
  Content,
  Class,
  Subject,
  Assignment,
  Chapter,
  ChapterPresentation,
  Presentation,
  ChapterPresentations,
} from "@/types";

// Determine the base URL for API requests
const getBaseUrl = () => {
  // Always use the API URL from environment variables
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
};

// Create axios instance with default config
export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// Function to get stored token
export const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token") || null;
};

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Log request details for debugging

    // Try to get token from local storage (as a backup)
    const token = getStoredToken();

    // If we have a token in localStorage, add it to the Authorization header
    if (token) {
      config.headers = config.headers || {};
      // Don't override Content-Type if it's multipart/form-data
      if (config.headers["Content-Type"] !== "multipart/form-data") {
        config.headers["Content-Type"] = "application/json";
      }
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.error("No token found in local storage for request");
      // You might want to redirect to login here if no token is found
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
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
  role?: string;
  school?: string;
  grade?: string;
}): Promise<{ token: string; data: User }> => {
  try {
    console.log("Registering user with data:", {
      ...userData,
      password: "[REDACTED]",
    });
    const response = await api.post("/users/register", userData);
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
    const response = await api.post("/users/login", credentials);
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
    if (response.data.data && response.data.data.user) {
      userData = {
        // Map _id to id if needed
        id: response.data.data.user._id || response.data.data.user.id,
        name: response.data.data.user.name,
        email: response.data.data.user.email,
        role: response.data.data.user.role,
        profilePicture: response.data.data.user.profilePicture,
        isActive: response.data.data.user.isActive,
        school: response.data.data.user.school,
        grade: response.data.data.user.grade,
        gender: response.data.data.user.gender,
        bio: response.data.data.user.bio,
        contactNumber: response.data.data.user.contactNumber,
        preferredLanguage: response.data.data.user.preferredLanguage,
        dateOfBirth: response.data.data.user.dateOfBirth,
        createdAt: response.data.data.user.createdAt,
        // Include original fields for compatibility
        _id: response.data.data.user._id,
        active: response.data.data.user.active,
        __v: response.data.data.user.__v,
      };
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
    const response = await api.post("/users/forgot-password", { email });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to process request"
    );
  }
};

export const resetPassword = async (
  token: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post("/users/reset-password", {
      token,
      password,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to process request"
    );
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    // First try to hit the logout endpoint
    try {
      await api.post("/users/logout");
      console.log("Successfully logged out via API");
    } catch (e) {
      console.log(
        "Backend logout endpoint error (expected in some configs):",
        e
      );
    }

    // Always clear local storage and cookies, even if API call fails
    if (typeof window !== "undefined") {
      console.log("Clearing local auth data");
      localStorage.removeItem("auth_token");

      // Clear the token cookie by setting it to expire in the past
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Don't throw error on logout issues
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get("/users/me");

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

      const response = await api.put("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    }

    // For regular updates without file, use JSON
    const response = await api.put("/users/profile", userData);
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
    const response = await api.put("/users/change-password", passwordData);
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
  subject?: string;
  grade?: string;
  isActive?: boolean;
  search?: string;
}): Promise<{
  data: Course[];
  count: number;
  pagination: { page: number; limit: number; totalPages: number };
}> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.subject) queryParams.append("subject", params.subject);
    if (params?.grade) queryParams.append("grade", params.grade);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    const response = await api.get(`/courses${queryString}`);
    return {
      data: response.data.data.map((course: any) => ({
        id: course._id,
        _id: course._id,
        title: course.title,
        code: course.code,
        description: course.description,
        curriculumType: course.curriculumType,
        subject: course.subject,
        grade: course.grade,
        teacher: course.teacher,
        students: course.students,
        enrolledClasses: course.enrolledClasses,
        materials: course.materials,
        startDate: course.startDate,
        endDate: course.endDate,
        isActive: course.isActive,
        maxStudents: course.maxStudents,
      })),
      count: response.data.count || 0,
      pagination: {
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || params?.limit || 10,
        totalPages: response.data.pagination?.totalPages || 1,
      },
    };
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch courses");
  }
};

export const getCourse = async (courseId: string): Promise<Course> => {
  try {
    const response = await api.get(`courses/${courseId}`);
    const courseData = response.data.data;

    return {
      id: courseData._id,
      _id: courseData._id,
      title: courseData.title,
      code: courseData.code,
      description: courseData.description,
      curriculumType: courseData.curriculumType,
      subject: courseData.subject,
      grade: courseData.grade,
      teacher: courseData.teacher,
      students: courseData.students,
      enrolledClasses: courseData.enrolledClasses,
      materials: courseData.materials,
      startDate: courseData.startDate,
      endDate: courseData.endDate,
      isActive: courseData.isActive,
      maxStudents: courseData.maxStudents,
    };
  } catch (error: any) {
    console.error("Error fetching course:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch course");
  }
};

export const createCourse = async (courseData: {
  title: string;
  code: string;
  description: string;
  curriculumType: "HKDSE" | "A-levels";
  subject: string;
  grade: string;
  teacher: string;
  isClassSpecific?: boolean;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  language?: "english" | "cantonese" | "mandarin";
}): Promise<Course> => {
  try {
    const response = await api.post("/courses", courseData);
    const createdCourse = response.data.data;

    return {
      id: createdCourse._id,
      _id: createdCourse._id,
      title: createdCourse.title,
      code: createdCourse.code,
      description: createdCourse.description,
      curriculumType: createdCourse.curriculumType,
      subject: createdCourse.subject,
      grade: createdCourse.grade,
      teacher: createdCourse.teacher,
      isActive: createdCourse.isActive,
      startDate: createdCourse.startDate,
      endDate: createdCourse.endDate,
      maxStudents: createdCourse.maxStudents,
    };
  } catch (error: any) {
    console.error("Error creating course:", error);
    throw new Error(error.response?.data?.message || "Failed to create course");
  }
};

export const updateCourse = async (
  courseId: string,
  courseData: Partial<{
    title: string;
    code: string;
    description: string;
    curriculumType: "HKDSE" | "A-levels";
    subject: string;
    grade: string;
    teacher: string;
    isClassSpecific: boolean;
    startDate: string;
    endDate: string;
    isActive: boolean;
    maxStudents: number;
    language: "english" | "cantonese" | "mandarin";
  }>
): Promise<Course> => {
  try {
    const response = await api.put(`/courses/${courseId}`, courseData);
    const updatedCourse = response.data.data;

    return {
      id: updatedCourse._id,
      _id: updatedCourse._id,
      title: updatedCourse.title,
      code: updatedCourse.code,
      description: updatedCourse.description,
      curriculumType: updatedCourse.curriculumType,
      subject: updatedCourse.subject,
      grade: updatedCourse.grade,
      teacher: updatedCourse.teacher,
      students: updatedCourse.students,
      enrolledClasses: updatedCourse.enrolledClasses,
      materials: updatedCourse.materials,
      startDate: updatedCourse.startDate,
      endDate: updatedCourse.endDate,
      isActive: updatedCourse.isActive,
      maxStudents: updatedCourse.maxStudents,
    };
  } catch (error: any) {
    console.error("Error updating course:", error);
    throw new Error(error.response?.data?.message || "Failed to update course");
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
      `${getBaseUrl()}/contents/${contentId}/download`,
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
    const response = await api.delete(`contents/${contentId}`);

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
    const response = await api.post(`courses/${courseId}/enroll`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to enroll in course"
    );
  }
};

export const unenrollFromCourse = async (courseId: string): Promise<Course> => {
  try {
    const response = await api.post(`courses/${courseId}/unenroll`);
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
    const response = await api.get("courses/enrolled", { params });
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
    const response = await api.post(`courses/${courseId}/enroll-class`, {
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
    const response = await api.post(`classes/${classId}/students`, {
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
    const response = await api.get("classes/available");
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch available classes"
    );
  }
};

// Class Management APIs
export const getClasses = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{
  data: Class[];
  count: number;
}> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    const response = await api.get(`/classes${queryString}`);
    return {
      data: response.data.data.map((classData: any) => ({
        id: classData._id,
        _id: classData._id,
        name: classData.name,
        code: classData.code,
        formLevel: classData.formLevel,
        academicYear: classData.academicYear,
        department: classData.department,
        gradeLevel: classData.gradeLevel,
        description: classData.description,
        classTeacher: classData.classTeacher,
        students: classData.students,
        courses: classData.courses,
        isActive: classData.isActive,
        createdAt: classData.createdAt,
        updatedAt: classData.updatedAt,
      })),
      count: response.data.count || 0,
    };
  } catch (error: any) {
    console.error("Error fetching classes:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch classes");
  }
};

export const getClass = async (classId: string): Promise<Class> => {
  try {
    const response = await api.get(`/classes/${classId}`);
    const classData = response.data.data;

    return {
      id: classData._id,
      _id: classData._id,
      name: classData.name,
      code: classData.code,
      formLevel: classData.formLevel,
      academicYear: classData.academicYear,
      department: classData.department,
      gradeLevel: classData.gradeLevel,
      description: classData.description,
      classTeacher: classData.classTeacher,
      students: classData.students,
      courses: classData.courses,
      isActive: classData.isActive,
      createdAt: classData.createdAt,
      updatedAt: classData.updatedAt,
    };
  } catch (error: any) {
    console.error("Error fetching class:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch class");
  }
};

export const createClass = async (classData: {
  name: string;
  code: string;
  formLevel: "Form 4" | "Form 5" | "Form 6" | "AS" | "A2";
  academicYear: string;
  department?: string;
  gradeLevel?: string;
  description?: string;
  classTeacher: string;
  students?: string[];
}): Promise<Class> => {
  try {
    const response = await api.post("/classes", classData);
    const createdClass = response.data.data;

    return {
      id: createdClass._id,
      _id: createdClass._id,
      name: createdClass.name,
      code: createdClass.code,
      formLevel: createdClass.formLevel,
      academicYear: createdClass.academicYear,
      department: createdClass.department,
      gradeLevel: createdClass.gradeLevel,
      description: createdClass.description,
      classTeacher: createdClass.classTeacher,
      students: createdClass.students,
      courses: createdClass.courses,
      isActive: createdClass.isActive,
      createdAt: createdClass.createdAt,
      updatedAt: createdClass.updatedAt,
    };
  } catch (error: any) {
    console.error("Error creating class:", error);
    throw new Error(error.response?.data?.message || "Failed to create class");
  }
};

export const updateClass = async (
  classId: string,
  classData: Partial<{
    name: string;
    code: string;
    formLevel: "Form 4" | "Form 5" | "Form 6" | "AS" | "A2";
    academicYear: string;
    department: string;
    gradeLevel: string;
    description: string;
    classTeacher: string;
    isActive: boolean;
  }>
): Promise<Class> => {
  try {
    const response = await api.put(`/classes/${classId}`, classData);
    const updatedClass = response.data.data;

    return {
      id: updatedClass._id,
      _id: updatedClass._id,
      name: updatedClass.name,
      code: updatedClass.code,
      formLevel: updatedClass.formLevel,
      academicYear: updatedClass.academicYear,
      department: updatedClass.department,
      gradeLevel: updatedClass.gradeLevel,
      description: updatedClass.description,
      classTeacher: updatedClass.classTeacher,
      students: updatedClass.students,
      courses: updatedClass.courses,
      isActive: updatedClass.isActive,
      createdAt: updatedClass.createdAt,
      updatedAt: updatedClass.updatedAt,
    };
  } catch (error: any) {
    console.error("Error updating class:", error);
    throw new Error(error.response?.data?.message || "Failed to update class");
  }
};

export const deleteClass = async (classId: string): Promise<void> => {
  try {
    await api.delete(`/classes/${classId}`);
  } catch (error: any) {
    console.error("Error deleting class:", error);
    throw new Error(error.response?.data?.message || "Failed to delete class");
  }
};

export const markClassAttendance = async (
  classId: string,
  attendanceData: {
    date: string;
    records: {
      studentId: string;
      status: "present" | "absent" | "late";
      remark?: string;
    }[];
  }
): Promise<any> => {
  try {
    const response = await api.post(
      `/classes/${classId}/attendance`,
      attendanceData
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error marking attendance:", error);
    throw new Error(
      error.response?.data?.message || "Failed to mark attendance"
    );
  }
};

export const getClassAttendanceReport = async (
  classId: string
): Promise<any> => {
  try {
    const response = await api.get(`/classes/${classId}/attendance/report`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching attendance report:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch attendance report"
    );
  }
};

// File Management APIs

export const uploadFile = async (
  file: File,
  type: "profile" | "material" | "assignment" | "submission"
): Promise<{
  fileUrl: string;
  fileName: string;
}> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error("Error uploading file:", error);
    throw new Error(error.response?.data?.message || "Failed to upload file");
  }
};

// Quiz Management APIs

export const getQuizzes = async (params?: {
  courseId?: string;
  status?: string;
}): Promise<{
  data: any[];
  count: number;
}> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.courseId) queryParams.append("course", params.courseId);
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    const response = await api.get(`/quizzes${queryString}`);
    return {
      data: response.data.data,
      count: response.data.count || 0,
    };
  } catch (error: any) {
    console.error("Error fetching quizzes:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch quizzes");
  }
};

export const createQuiz = async (quizData: {
  title: string;
  description: string;
  courseId: string;
  duration: number;
  totalPoints: number;
  startDate: string;
  endDate: string;
  questions: {
    question: string;
    type: "multiple_choice" | "true_false" | "short_answer";
    options?: string[];
    correctAnswer: string | number;
    points: number;
    explanation?: string;
  }[];
  settings?: {
    shuffleQuestions?: boolean;
    showResults?: boolean;
    allowRetake?: boolean;
    passingScore?: number;
  };
}): Promise<any> => {
  try {
    const response = await api.post("/quizzes", quizData);
    return response.data.data;
  } catch (error: any) {
    console.error("Error creating quiz:", error);
    throw new Error(error.response?.data?.message || "Failed to create quiz");
  }
};

export const getQuiz = async (quizId: string): Promise<any> => {
  try {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching quiz:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch quiz");
  }
};

export const updateQuiz = async (
  quizId: string,
  quizData: Partial<{
    title: string;
    description: string;
    duration: number;
    totalPoints: number;
    startDate: string;
    endDate: string;
    questions: any[];
    settings: any;
    isPublished: boolean;
  }>
): Promise<any> => {
  try {
    const response = await api.put(`/quizzes/${quizId}`, quizData);
    return response.data.data;
  } catch (error: any) {
    console.error("Error updating quiz:", error);
    throw new Error(error.response?.data?.message || "Failed to update quiz");
  }
};

export const deleteQuiz = async (quizId: string): Promise<void> => {
  try {
    await api.delete(`/quizzes/${quizId}`);
  } catch (error: any) {
    console.error("Error deleting quiz:", error);
    throw new Error(error.response?.data?.message || "Failed to delete quiz");
  }
};

export const getQuizResults = async (quizId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/quizzes/${quizId}/results`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching quiz results:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch quiz results"
    );
  }
};

export const getStudentQuizResult = async (
  quizId: string,
  studentId: string
): Promise<any> => {
  try {
    const response = await api.get(`/quizzes/${quizId}/results/${studentId}`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching student quiz result:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch student quiz result"
    );
  }
};

// Communication APIs

export const getAnnouncements = async (): Promise<any[]> => {
  try {
    const response = await api.get("/announcements");
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching announcements:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch announcements"
    );
  }
};

export const createAnnouncement = async (announcementData: {
  title: string;
  content: string;
  targetAudience: {
    roles?: string[];
    grades?: string[];
    classes?: string[];
  };
  attachments?: {
    fileUrl: string;
    fileName: string;
  }[];
}): Promise<any> => {
  try {
    const response = await api.post("/announcements", announcementData);
    return response.data.data;
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create announcement"
    );
  }
};

export const getNotifications = async (): Promise<any[]> => {
  try {
    const response = await api.get("/notifications");
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch notifications"
    );
  }
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  try {
    await api.put(`/notifications/${notificationId}/read`);
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    throw new Error(
      error.response?.data?.message || "Failed to mark notification as read"
    );
  }
};

// Subject API functions
export const getSubjects = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{
  data: Subject[];
  count: number;
}> => {
  try {
    const response = await api.get("/subjects", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
};

export const createSubject = async (subjectData: {
  name: string;
  code: string;
  grade: string;
  description?: string;
  headTeacher: string;
  iconUrl?: string;
}): Promise<Subject> => {
  try {
    const response = await api.post("/subjects", subjectData);
    const createdSubject = response.data.data;

    return {
      id: createdSubject._id,
      _id: createdSubject._id,
      name: createdSubject.name,
      code: createdSubject.code,
      description: createdSubject.description,
      headTeacher: createdSubject.headTeacher,
      courseCount: 0, // New subject has no courses
      iconUrl: createdSubject.iconUrl,
    };
  } catch (error: any) {
    console.error("Error creating subject:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create subject"
    );
  }
};

export const getSubjectById = async (subjectId: string): Promise<Subject> => {
  try {
    const response = await api.get(`/subjects/${subjectId}`);
    const subjectData = response.data.data;

    return {
      id: subjectData._id,
      _id: subjectData._id,
      name: subjectData.name,
      code: subjectData.code,
      description: subjectData.description,
      headTeacher: subjectData.headTeacher,
      grade: subjectData.grade,
      courseCount: subjectData.courseCount || 0,
      iconUrl: subjectData.iconUrl,
    };
  } catch (error: any) {
    console.error("Error fetching subject:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch subject");
  }
};

export const getCoursesBySubject = async (
  subjectId: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<{
  data: Course[];
  count: number;
  pagination: { page: number; limit: number; totalPages: number };
}> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    const response = await api.get(
      `/subjects/${subjectId}/courses${queryString}`
    );

    return {
      data: response.data.data.map((course: any) => ({
        id: course._id,
        _id: course._id,
        title: course.title,
        code: course.code,
        description: course.description,
        curriculumType: course.curriculumType,
        subject: course.subject,
        grade: course.grade,
        teacher: course.teacher,
        students: course.students,
        enrolledClasses: course.enrolledClasses,
        materials: course.materials,
        startDate: course.startDate,
        endDate: course.endDate,
        isActive: course.isActive,
        maxStudents: course.maxStudents,
      })),
      count: response.data.count || 0,
      pagination: {
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || params?.limit || 10,
        totalPages: response.data.pagination?.totalPages || 1,
      },
    };
  } catch (error: any) {
    console.error("Error fetching courses by subject:", error);
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch courses for this subject"
    );
  }
};

// Add dummy implementation for the functions currently used in the UI
export const getFormLevelsBySubject = async (
  subjectId: string
): Promise<{
  data: any[];
}> => {
  try {
    // This is a temporary function to prevent errors
    // In the future, this should be implemented properly
    return { data: [] };
  } catch (error: any) {
    console.error("Error fetching form levels:", error);
    throw new Error("Failed to fetch form levels");
  }
};

export const getClassesBySubjectAndFormLevel = async (
  subjectId: string,
  formLevelId: string
): Promise<{
  data: any[];
}> => {
  try {
    const response = await api.get(
      `/subjects/${subjectId}/form-levels/${formLevelId}/classes`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch classes");
  }
};

export const getSubjectContents = async (
  subjectId: string
): Promise<Content[]> => {
  try {
    const response = await api.get(`/subjects/${subjectId}`);
    return response.data.data.materials || [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch subject contents"
    );
  }
};

export const createSubjectContent = async (
  subjectId: string,
  formData: FormData
): Promise<Content> => {
  try {
    // First get the subject details to get the grade
    const subject = await getSubjectById(subjectId);

    // Add grade to formData if available
    if (subject.grade) formData.append("grade", subject.grade.toString());

    console.log("createSubjectContent", formData);

    const response = await api.post(
      `/subjects/${subjectId}/materials`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      id: response.data._id,
      _id: response.data._id,
      title: response.data.title,
      description: response.data.description,
      moduleNumber: response.data.moduleNumber,
      lessonNumber: response.data.lessonNumber,
      order: response.data.order,
      fileUrl: response.data.fileUrl,
      uploadedAt: response.data.uploadedAt,
      isInherited: response.data.isInherited,
      inheritedFrom: response.data.inheritedFrom,
      originalMaterialId: response.data.originalMaterialId,
    };
  } catch (error: any) {
    console.error("Error creating subject content:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create subject content"
    );
  }
};

export const deleteSubjectContent = async (
  subjectId: string,
  materialId: string
): Promise<void> => {
  try {
    console.log(subjectId, materialId);
    await api.delete(`/subjects/${subjectId}/materials/${materialId}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete subject content"
    );
  }
};

export const bulkDistributeContent = async (
  subjectId: string,
  data: {
    materialIds: string[];
    courseIds: string[];
  }
): Promise<void> => {
  try {
    await api.post(`/subjects/${subjectId}/materials/bulk-distribute`, data);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to distribute content to courses"
    );
  }
};

export const updateSubjectContent = async (
  subjectId: string,
  materialId: string,
  data:
    | FormData
    | {
        title?: string;
        description?: string;
        type?: "document" | "video" | "link" | "text" | "other";
        link?: string;
        textContent?: string;
        moduleNumber?: number;
        lessonNumber?: number;
        order?: number;
      }
): Promise<Content> => {
  try {
    let response;

    if (data instanceof FormData) {
      response = await api.put(
        `/subjects/${subjectId}/materials/${materialId}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } else {
      response = await api.put(
        `/subjects/${subjectId}/materials/${materialId}`,
        data
      );
    }

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to update subject content"
      );
    }

    const updatedContent = response.data.data;
    return {
      id: updatedContent._id,
      _id: updatedContent._id,
      title: updatedContent.title,
      description: updatedContent.description,
      moduleNumber: updatedContent.moduleNumber,
      lessonNumber: updatedContent.lessonNumber,
      order: updatedContent.order,
      type: updatedContent.type,
      link: updatedContent.link,
      textContent: updatedContent.textContent,
      fileUrl: updatedContent.fileUrl,
      uploadedAt: updatedContent.uploadedAt,
      isInherited: updatedContent.isInherited,
      inheritedFrom: updatedContent.inheritedFrom,
      originalMaterialId: updatedContent.originalMaterialId,
    };
  } catch (error: any) {
    console.error("Error updating subject content:", error);

    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error("Please log in to update subject content.");
    } else if (error.response?.status === 403) {
      throw new Error("You don't have permission to update this content.");
    } else if (error.response?.status === 404) {
      throw new Error("Subject content not found.");
    } else if (error.response?.status === 413) {
      throw new Error("The file you're trying to upload is too large.");
    }

    throw new Error(
      error.response?.data?.message || "Failed to update subject content"
    );
  }
};

export const assignCourseToClass = async (
  classId: string,
  courseId: string
): Promise<Course> => {
  try {
    const response = await api.post(`/courses/${courseId}/enroll-class`, {
      classId,
    });
    return response.data.data;
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
    await api.delete(`/classes/${classId}/courses/${courseId}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to remove course from class"
    );
  }
};

export const removeStudentFromClass = async (
  classId: string,
  studentId: string
): Promise<void> => {
  try {
    await api.delete(`/classes/${classId}/students/${studentId}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to remove student from class"
    );
  }
};

export const getAvailableStudents = async (
  classId: string
): Promise<User[]> => {
  try {
    const response = await api.get(`/classes/${classId}/available-students`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch available students"
    );
  }
};

export const createCourseMaterial = async (
  courseId: string,
  formData: FormData
): Promise<Content> => {
  try {
    const response = await api.post(
      `/courses/${courseId}/materials`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      id: response.data._id,
      _id: response.data._id,
      title: response.data.title,
      description: response.data.description,
      fileUrl: response.data.fileUrl,
      uploadedAt: response.data.uploadedAt,
      isInherited: response.data.isInherited,
      inheritedFrom: response.data.inheritedFrom,
      originalMaterialId: response.data.originalMaterialId,
    };
  } catch (error: any) {
    console.error("Error creating course material:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create course material"
    );
  }
};

export const updateCourseMaterial = async (
  courseId: string,
  materialId: string,
  data:
    | FormData
    | {
        title?: string;
        description?: string;
        fileUrl?: string;
      }
): Promise<Content> => {
  try {
    console.log(
      "Updating course material with URL:",
      `/courses/${courseId}/materials/${materialId}`
    );
    const response = await api.put(
      `/courses/${courseId}/materials/${materialId}`,
      data,
      {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : { "Content-Type": "application/json" },
      }
    );

    return {
      id: response.data._id,
      _id: response.data._id,
      title: response.data.title,
      description: response.data.description,
      fileUrl: response.data.fileUrl,
      uploadedAt: response.data.uploadedAt,
      isInherited: response.data.isInherited,
      inheritedFrom: response.data.inheritedFrom,
      originalMaterialId: response.data.originalMaterialId,
    };
  } catch (error: any) {
    console.error("Error updating course material:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update course material"
    );
  }
};

export const deleteCourseMaterial = async (
  courseId: string,
  materialId: string
): Promise<void> => {
  try {
    await api.delete(`/courses/${courseId}/materials/${materialId}`);
  } catch (error: any) {
    console.error("Error deleting course material:", error);
    throw new Error(
      error.response?.data?.message || "Failed to delete course material"
    );
  }
};

export const getAssignments = async (
  courseId: string
): Promise<{
  data: Assignment[];
  count: number;
}> => {
  try {
    const response = await api.get(`/assignments?courseId=${courseId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch assignments"
    );
  }
};

export const createAssignment = async (
  formData: FormData
): Promise<Assignment> => {
  try {
    const response = await api.post("/assignments", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create assignment"
    );
  }
};

export const updateAssignment = async (
  assignmentId: string,
  formData: FormData
): Promise<Assignment> => {
  try {
    const response = await api.put(`/assignments/${assignmentId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update assignment"
    );
  }
};

export const deleteAssignment = async (assignmentId: string): Promise<void> => {
  try {
    await api.delete(`/assignments/${assignmentId}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete assignment"
    );
  }
};

// Chapter Management
export const getSubjectChapters = async (
  subjectId: string
): Promise<{
  data: Chapter[];
  count: number;
}> => {
  try {
    const response = await api.get(`/subjects/${subjectId}/chapters`);
    return {
      data: response.data.data,
      count: response.data.count,
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch chapters"
    );
  }
};

export const createChapter = async (
  subjectId: string,
  data: {
    title: string;
    description?: string;
    order: number;
    isActive?: boolean;
  }
): Promise<Chapter> => {
  try {
    const response = await api.post(`/subjects/${subjectId}/chapters`, data);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create chapter"
    );
  }
};

export const updateChapter = async (
  subjectId: string,
  chapterId: string,
  data: {
    title?: string;
    description?: string;
    order?: number;
    isActive?: boolean;
  }
): Promise<Chapter> => {
  try {
    const response = await api.put(
      `/subjects/${subjectId}/chapters/${chapterId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update chapter"
    );
  }
};

export const deleteChapter = async (
  subjectId: string,
  chapterId: string
): Promise<void> => {
  try {
    await api.delete(`/subjects/${subjectId}/chapters/${chapterId}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete chapter"
    );
  }
};

export const bulkUploadChapters = async (
  subjectId: string,
  file: File
): Promise<{
  data: Chapter[];
  count: number;
}> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(
      `/subjects/${subjectId}/chapters/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return {
      data: response.data.data,
      count: response.data.count,
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to upload chapters"
    );
  }
};

export const getChapterTemplate = async (subjectId: string): Promise<Blob> => {
  try {
    const response = await api.get(`/subjects/${subjectId}/chapters/template`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to get template");
  }
};

export const updateSubject = async (
  subjectId: string,
  subjectData: {
    name: string;
    code: string;
    grade: string;
    description?: string;
    headTeacher: string;
    iconUrl?: string;
  }
): Promise<Subject> => {
  try {
    const response = await api.put(`/subjects/${subjectId}`, subjectData);
    const updatedSubject = response.data.data;

    return {
      id: updatedSubject._id,
      _id: updatedSubject._id,
      name: updatedSubject.name,
      code: updatedSubject.code,
      description: updatedSubject.description,
      headTeacher: updatedSubject.headTeacher,
      grade: updatedSubject.grade,
      courseCount: updatedSubject.courseCount || 0,
      iconUrl: updatedSubject.iconUrl,
    };
  } catch (error: any) {
    console.error("Error updating subject:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update subject"
    );
  }
};

// User API functions
export const getTeachers = async (): Promise<User[]> => {
  try {
    const response = await api.get("/users/teachers");
    return response.data.data.map((teacher: any) => ({
      id: teacher._id,
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
      profilePicture: teacher.profilePicture,
      isActive: teacher.active,
      school: teacher.school,
      grade: teacher.grade,
      gender: teacher.gender,
      bio: teacher.bio,
      contactNumber: teacher.contactNumber,
      preferredLanguage: teacher.preferredLanguage,
      dateOfBirth: teacher.dateOfBirth,
      createdAt: teacher.createdAt,
    }));
  } catch (error: any) {
    console.error("Error fetching teachers:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch teachers"
    );
  }
};

export const generateLLMContent = async (params: {
  prompts: {
    chapter: string;
    numberOfSlides: string;
    userPrompt: string;
    draftContent: Array<{
      slideNumber: number;
      title: string;
      bulletPoints: string[];
      type: "title" | "content" | "section";
    }>;
  };
  context: Record<string, string>;
}) => {
  try {
    const isDownload = params.context.download === "true";

    // First generate and save the presentation
    const response = await api.post("/llm/generate", {
      prompts: params.prompts,
      context: params.context,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to generate content");
    }

    // If download is requested, fetch the saved presentation
    if (isDownload && response.data.data?.presentationId) {
      const downloadResponse = await api.get(
        `/v1/presentations/${response.data.data.presentationId}/download`,
        {
          responseType: "blob",
          headers: {
            Accept:
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          },
        }
      );

      // Get filename from Content-Disposition header
      const contentDisposition =
        downloadResponse.headers["content-disposition"];
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/['"]/g, "")
        : `presentation-${Date.now()}.pptx`;

      // Create blob and return
      const blob = new Blob([downloadResponse.data], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });

      return {
        data: blob,
        filename,
      };
    }

    // Return the generated content response
    return response.data;
  } catch (error) {
    console.error("Error in generateLLMContent:", error);
    throw error;
  }
};

export const updateSlideElementPosition = async (
  presentationId: string,
  slideId: string,
  elementId: string,
  position: "left" | "right" | "top" | "default"
): Promise<any> => {
  try {
    const response = await api.put(
      `/presentations/${presentationId}/slides/${slideId}/elements/${elementId}/position`,
      { position }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating element position:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update element position"
    );
  }
};

interface GenerateDraftParams {
  numSlides: number;
  language: string;
  themeId: string;
  chapter: string;
  courseId?: string;
  scope?: "course" | "subject";
}

export const generateDraft = async (params: GenerateDraftParams) => {
  try {
    const response = await api.post("/v1/presentations/drafts", params);

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to generate draft");
    }

    return response.data;
  } catch (error) {
    console.error("Error in generateDraft:", error);
    throw error;
  }
};

// Presentation API functions
export const getCoursePresentations = async (
  courseId: string
): Promise<ChapterPresentations[]> => {
  try {
    const response = await api.get(`/courses/${courseId}/presentations`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching course presentations:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch course presentations"
    );
  }
};

export const getChapterPresentation = async (
  courseId: string,
  chapterId: string
): Promise<{ success: boolean; data: Presentation[] }> => {
  try {
    const response = await api.get(
      `/courses/${courseId}/chapters/${chapterId}/presentation`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching chapter presentation:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch chapter presentation"
    );
  }
};
