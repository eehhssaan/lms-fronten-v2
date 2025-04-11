// User types
export interface User {
  id: string; // Frontend standardized ID
  _id?: string; // Backend original ID
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  profilePicture?: string;
  isActive?: boolean;
  school?: string;
  grade?: string;
  gender?: string;
  bio?: string;
  contactNumber?: string;
  preferredLanguage?: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
  // Compatibility with backend
  active?: boolean; // Some backends use active instead of isActive
  __v?: number; // MongoDB version field
}

export interface StudentProgress {
  overall: {
    completionRate: number;
    averageScore: number;
  };
  courses: {
    courseId: string;
    title: string;
    progress: number;
    assignments: {
      completed: number;
      total: number;
      averageScore: number;
    };
    quizzes: {
      completed: number;
      total: number;
      averageScore: number;
    };
  }[];
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  code: string;
  isActive: boolean;
  coverImage?: string;
  category?: string;
  createdBy?: {
    id: string;
    name: string;
  };
  modules?: {
    moduleNumber: number;
    title: string;
    lessons: {
      lessonNumber: number;
      title: string;
      contentId: string;
    }[];
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  section?: string;
  teacher?: {
    id: string;
    name: string;
  };
  students?: {
    id: string;
    name: string;
    email: string;
  }[];
  courses?: {
    id: string;
    title: string;
    code: string;
  }[];
  studentCount?: number;
}

// Content types
export interface Content {
  id: string;
  title: string;
  description: string;
  moduleNumber: number;
  lessonNumber: number;
  order: number;
  htmlContent?: string;
  attachments?: string[];
  courseId?: {
    id: string;
    title: string;
    code: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
}

// Assignment types
export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  instructions?: string;
  attachments?: string[];
  allowLateSubmission?: boolean;
  courseId?: {
    id: string;
    title: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
}

export interface AssignmentSubmission {
  id: string;
  text?: string;
  attachments?: string[];
  submittedAt: string;
  status: "submitted" | "graded" | "returned" | "late";
  assignment?: {
    id: string;
    title: string;
  };
}

// Quiz types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  moduleNumber: number;
  lessonNumber: number;
  timeLimit?: number;
  passingScore?: number;
  questions?: QuizQuestion[];
  courseId?: {
    id: string;
    title: string;
  };
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: "multipleChoice" | "trueOrFalse" | "shortAnswer";
  options?: string[];
  correctAnswer: string | number;
  points: number;
}

export interface QuizSubmission {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeSpent: string;
  questionsCorrect: number;
  totalQuestions: number;
  submittedAt: string;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  token?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
  data: T[];
}
