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
  name: string;
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
}): Promise<{ token: string; user: User }> => {
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
    console.log("getCurrentUser response:", response.data);
    // Check if the response has a nested data property
    return response.data.data || response.data;
  } catch (error: any) {
    console.error("getCurrentUser error:", error);
    if (error.message === "Network Error") {
      throw new Error(
        "Unable to connect to the server. Please check your network or try again later."
      );
    }
    throw new Error(error.response?.data?.message || "Failed to get user data");
  }
};

export const updateUserProfile = async (userData: FormData): Promise<User> => {
  try {
    const response = await api.put("/api/users/me", userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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
  subject: string;
  grade: string;
  teacher?: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  thumbnail?: string;
  language?: "english" | "cantonese" | "mandarin";
  maxStudents?: number;
}): Promise<Course> => {
  try {
    // If teacher is not provided, we'll use the current user's ID
    // (assuming they're a teacher or admin)
    if (!courseData.teacher) {
      try {
        const currentUser = await getCurrentUser();
        courseData.teacher = currentUser._id;
      } catch (err) {
        console.error("Failed to get current user for teacher ID:", err);
        throw new Error("Teacher ID is required for course creation");
      }
    }

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "code",
      "subject",
      "grade",
      "startDate",
      "endDate",
    ] as const;
    const missingFields = requiredFields.filter((field) => !courseData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Set default values if not provided
    const finalData = {
      ...courseData,
      isActive: courseData.isActive ?? true,
      language: courseData.language || "english",
      maxStudents: courseData.maxStudents || 50,
      thumbnail: courseData.thumbnail || "",
    };

    console.log("Creating course with data:", {
      ...finalData,
      description: finalData.description.substring(0, 100) + "...", // Truncate long description in logs
    });

    const response = await api.post("/api/courses", finalData);
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

// Class APIs
export const getAvailableClasses = async (): Promise<
  { _id: string; name: string }[]
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
  academicYear: string;
  department?: string;
  gradeLevel?: string;
  description?: string;
  classTeacher?: string;
}): Promise<{
  _id: string;
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
}> => {
  try {
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
    _id: string;
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
          allCourses.find((course: Course) => course._id === courseId)
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
    Omit<Class, "_id" | "students" | "courses" | "createdAt" | "updatedAt">
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
    _id: string;
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
    _id: string;
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

export const getStudentProgress = async () => {
  try {
    const response = await api.get("/api/users/me/progress");
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch progress"
    );
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
    code: string; // admin only
    subject: string;
    grade: string;
    teacher: string; // admin only
    startDate: string;
    endDate: string;
    isActive: boolean;
    thumbnail: string;
    language: "english" | "cantonese" | "mandarin";
    maxStudents: number;
  }>
): Promise<Course> => {
  try {
    console.log("Updating course:", courseId, "with data:", courseData);

    // Get current user to check role
    const currentUser = await getCurrentUser();

    // If not admin, remove admin-only fields
    if (currentUser.role !== "admin") {
      const adminOnlyFields = ["code", "teacher"] as const;
      adminOnlyFields.forEach((field) => {
        if (courseData.hasOwnProperty(field)) {
          console.log(
            `Non-admin user attempting to update ${field}. Field will be ignored.`
          );
          delete courseData[field as keyof typeof courseData];
        }
      });
    }

    // Validate maxStudents if provided
    if (courseData.maxStudents !== undefined) {
      if (courseData.maxStudents < 0) {
        throw new Error("Maximum students cannot be negative");
      }
      if (courseData.maxStudents > 1000) {
        // reasonable upper limit
        throw new Error("Maximum students cannot exceed 1000");
      }
    }

    // Validate title length if provided
    if (courseData.title && courseData.title.length > 100) {
      throw new Error("Course title cannot be more than 100 characters");
    }

    // Validate dates if provided
    if (courseData.startDate || courseData.endDate) {
      const course = await getCourse(courseId); // Get current course data
      const startDate = new Date(courseData.startDate || course.startDate);
      const endDate = new Date(courseData.endDate || course.endDate);

      if (startDate >= endDate) {
        throw new Error("End date must be after start date");
      }
    }

    // Make the update request
    const response = await api.put(`/api/courses/${courseId}`, courseData);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update course");
    }

    console.log("Course update response:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.error(
      "Course update error:",
      error.response?.data || error.message
    );

    // Handle specific error cases
    if (error.response?.status === 403) {
      throw new Error("You are not authorized to update this course");
    }
    if (error.response?.status === 404) {
      throw new Error("Course not found");
    }

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

export const deleteAssignment = async (id: string) => {
  const response = await api.delete(`/api/assignments/${id}`);
  return response.data;
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
