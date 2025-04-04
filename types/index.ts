// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "student" | "teacher" | "admin";
  profilePicture?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Course types
export interface Course {
  _id: string;
  title: string;
  code: string;
  description: string;
  subject: string;
  grade: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxStudents: number;
  teacher?: User;
  students?: User[];
  createdAt: string;
  updatedAt: string;
}

// Content types
export interface Content {
  _id: string;
  title: string;
  description?: string;
  type: "lecture" | "resource" | "assignment" | "quiz";
  order: number;
  fileUrl?: string;
  text?: string;
  course: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Assignment types
export interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  course: string;
  submissions?: AssignmentSubmission[];
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  _id: string;
  assignment: string;
  student: User;
  textSubmission?: string;
  attachments?: {
    _id: string;
    filename: string;
    path: string;
  }[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
  isLate: boolean;
}

// Quiz types
export interface Quiz {
  _id: string;
  title: string;
  description: string;
  timeLimit?: number;
  dueDate: string;
  points: number;
  course: string;
  questions: QuizQuestion[];
  attempts?: QuizAttempt[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  _id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

export interface QuizAttempt {
  _id: string;
  quiz: string;
  student: User;
  answers: {
    question: string;
    answer: string | string[];
  }[];
  score: number;
  submittedAt: string;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
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
