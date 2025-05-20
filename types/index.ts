// User types
export interface User {
  id: string; // Frontend standardized ID
  _id?: string; // Backend original ID
  name: string;
  email: string;
  role: "student" | "teacher" | "head_teacher" | "admin";
  profilePicture?: string;
  isActive?: boolean;
  school?: string;
  grade?: string;
  gender?: string;
  bio?: string;
  contactNumber?: string;
  preferredLanguage?: "english" | "cantonese" | "mandarin";
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
  // Compatibility with backend
  active?: boolean; // Some backends use active instead of isActive
  __v?: number; // MongoDB version field
}

// Subject-first approach types
export interface Subject {
  id: string;
  _id?: string;
  name: string;
  code?: string;
  description?: string;
  grade?: string;
  headTeacher?: {
    _id: string;
    name: string;
    email: string;
  };
  materials?: {
    title: string;
    description: string;
    fileUrl: string;
    uploadedAt: string;
  }[];
  assignments?: string[];
  isActive?: boolean;
  curriculum?: string;
  iconUrl?: string;
  courseCount?: number;
  courses?: Course[];
}

export interface FormLevel {
  id: string;
  name: string; // e.g., "Form 5"
  grade: string;
  courseCount?: number;
  courses?: Course[];
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
  _id?: string;
  title: string;
  description: string;
  code: string;
  isActive: boolean;
  coverImage?: string;
  category?: string;
  curriculumType?: "HKDSE" | "A-levels";
  subject?: {
    _id: string;
    name: string;
  };
  grade?: string;
  teacher?: {
    _id: string;
    name: string;
    email: string;
  };
  students?: string[];
  enrolledClasses?: string[];
  isClassSpecific?: boolean;
  materials?: {
    title: string;
    description: string;
    fileUrl: string;
    uploadedAt: string;
    isInherited?: boolean;
    inheritedFrom?: string;
    originalMaterialId?: string;
  }[];
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  language?: "english" | "cantonese" | "mandarin";
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
  _id: string;
  name: string;
  code: string;
  formLevel: "Form 4" | "Form 5" | "Form 6" | "AS" | "A2";
  academicYear: string;
  department?: string;
  gradeLevel?: string;
  description?: string;
  students?: User[];
  courses?: Course[];
  classTeacher: string | User;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Content types
export interface Content {
  id: string;
  _id?: string;
  title: string;
  description: string;
  uploadedAt: string;
  isInherited?: boolean;
  inheritedFrom?: string;
  originalMaterialId?: string;
  moduleNumber?: number;
  lessonNumber?: number;
  order?: number;
  type?: "document" | "video" | "link" | "text" | "other";
  contentType?: "lecture" | "quiz" | "assignment" | "supplementary";
  link?: string;
  textContent?: string;
  fileUrl?: string;
  courseId?: {
    id: string;
    title: string;
    code: string;
  };
  chapter?: string;
  createdBy?: {
    id: string;
    name: string;
  };
}

// Assignment types
export interface Assignment {
  id: string;
  _id?: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  instructions: string;
  attachments?: {
    name: string;
    file: string;
    mimeType: string;
    uploadedAt: string;
  }[];
  allowLateSubmissions: boolean;
  latePenalty: number;
  rubric: {
    criterion: string;
    points: number;
    description: string;
  }[];
  isPublished: boolean;
  moduleNumber: number;
  courseId: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
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
  _id?: string;
  title: string;
  description: string;
  courseId?:
    | string
    | {
        id: string;
        title: string;
      };
  duration?: number;
  totalPoints?: number;
  questions?: {
    question: string;
    type: "multiple_choice" | "true_false" | "short_answer";
    options?: string[];
    correctAnswer: string | number;
    points: number;
    explanation?: string;
  }[];
  startDate?: string;
  endDate?: string;
  isPublished?: boolean;
  settings?: {
    shuffleQuestions?: boolean;
    showResults?: boolean;
    allowRetake?: boolean;
    passingScore?: number;
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

export interface Chapter {
  _id: string;
  title: string;
  description?: string;
  order: number;
  isActive: boolean;
  subject: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}
