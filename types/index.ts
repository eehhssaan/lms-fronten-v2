// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  profilePicture?: string;
  isActive?: boolean;
  studentId?: string; // For students
  grade?: string; // For students
  subject?: string; // For teachers
  enrolledCourses?: {
    // For students
    _id: string;
    title: string;
    code: string;
    teacher: {
      name: string;
    };
    progress: number;
    assignments: {
      total: number;
      completed: number;
    };
    quizzes: {
      total: number;
      completed: number;
    };
  }[];
  teachingCourses?: {
    // For teachers
    _id: string;
    title: string;
    code: string;
    studentCount: number;
    pendingAssignments: number;
    pendingQuizzes: number;
  }[];
  createdAt?: string;
  updatedAt?: string;
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
  _id: string;
  title: string;
  description: string;
  code: string;
  subject: string;
  grade: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  students: User[];
  enrolledClasses: {
    _id: string;
    name: string;
  }[];
  individualEnrollments: User[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  thumbnail: string;
  language: "english" | "cantonese" | "mandarin";
  maxStudents: number;
  createdAt: string;
  updatedAt: string;
  contents?: Content[];
  assignments?: Assignment[];
  quizzes?: Quiz[];
}

export interface Class {
  _id: string;
  name: string;
  code: string;
  academicYear: string;
  department?: string;
  gradeLevel?: string;
  description?: string;
  classTeacher: {
    _id: string;
    name: string;
    email: string;
  };
  students: User[];
  courses: Course[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Content types
export interface Content {
  _id: string;
  title: string;
  description: string;
  type: "document" | "video" | "link" | "text" | "other";
  moduleNumber: number;
  lessonNumber: number;
  courseId: string;
  file: string;
  link: string;
  textContent: string;
  duration: number;
  order: number;
  isPublished: boolean;
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
