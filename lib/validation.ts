// Curriculum type validation
export const validateCurriculumType = (type: string): boolean => {
  return ["HKDSE", "A-levels"].includes(type);
};

// Form level validation
export const validateFormLevel = (level: string): boolean => {
  return ["Form 4", "Form 5", "Form 6", "AS", "A2"].includes(level);
};

// Academic year validation (YYYY-YYYY format)
export const validateAcademicYear = (year: string): boolean => {
  return /^\d{4}-\d{4}$/.test(year);
};
