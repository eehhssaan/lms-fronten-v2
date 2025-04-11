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
  gender?: "male" | "female" | "other";
  bio?: string;
  contactNumber?: string;
  preferredLanguage?: "english" | "cantonese" | "mandarin";
  dateOfBirth?: string;
  school?: string;
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
  curriculumType: "HKDSE" | "A-levels";
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
  formLevel: "Form 4" | "Form 5" | "Form 6" | "AS" | "A2";
  academicYear: string;
  department?: string;
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
  courseId: string;
  dueDate: Date;
  totalPoints: number;
  attachments: {
    name: string;
    file: string;
    mimeType: string;
    uploadedAt: Date;
  }[];
  allowLateSubmissions: boolean;
  latePenalty: number;
  instructions: string;
  rubric: {
    criterion: string;
    points: number;
    description: string;
  }[];
  isPublished: boolean;
  moduleNumber: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentSubmission {
  _id: string;
  student:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  courseId: string;
  assignmentId: string;
  submittedAt: Date;
  status: "submitted" | "graded" | "returned" | "late";
  score?: number;
  feedback?: string;
  textResponse?: string;
  attachments: {
    name: string;
    file: string;
    mimeType: string;
    uploadedAt: Date;
  }[];
  gradedBy?: {
    _id: string;
    name: string;
  };
  gradedAt?: Date;
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
