"use client";

import { useState } from "react";
import { Course } from "@/types";
import { createCourse, updateCourse } from "@/lib/api";
import Button from "./Button";
import ErrorMessage from "./ErrorMessage";

interface CourseFormProps {
  initialData?: Partial<Course>;
  onSuccess?: (course: Course) => void;
}

export default function CourseForm({
  initialData,
  onSuccess,
}: CourseFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    code: initialData?.code || "",
    description: initialData?.description || "",
    subject:
      typeof initialData?.subject === "object" && initialData?.subject !== null
        ? initialData.subject._id || ""
        : initialData?.subject || "",
    grade: initialData?.grade || "",
    curriculumType: initialData?.curriculumType || "HKDSE",
    startDate: initialData?.startDate
      ? new Date(initialData.startDate).toISOString().split("T")[0]
      : "",
    endDate: initialData?.endDate
      ? new Date(initialData.endDate).toISOString().split("T")[0]
      : "",
    maxStudents: initialData?.maxStudents || 50,
    isActive: initialData?.isActive ?? true,
    language: initialData?.language || "english",
    isClassSpecific: initialData?.isClassSpecific ?? true,
    teacher:
      typeof initialData?.teacher === "object" && initialData?.teacher !== null
        ? initialData.teacher._id || ""
        : initialData?.teacher || "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Handle checkbox differently
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error("Course title is required");
      }
      if (formData.title.length > 100) {
        throw new Error("Course title cannot be more than 100 characters");
      }
      if (!formData.code.trim()) {
        throw new Error("Course code is required");
      }
      if (!formData.description.trim()) {
        throw new Error("Course description is required");
      }
      if (!formData.subject) {
        throw new Error("Subject is required");
      }
      if (!formData.grade) {
        throw new Error("Form level is required");
      }
      if (!formData.curriculumType) {
        throw new Error("Curriculum type is required");
      }
      if (!formData.teacher) {
        throw new Error("Teacher is required");
      }
      if (!formData.startDate) {
        throw new Error("Start date is required");
      }
      if (!formData.endDate) {
        throw new Error("End date is required");
      }
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        throw new Error("End date must be after start date");
      }
      if (formData.maxStudents < 1) {
        throw new Error("Maximum students must be at least 1");
      }

      // Format data for API
      const courseData = {
        title: formData.title.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        subject: formData.subject,
        grade: formData.grade,
        curriculumType: formData.curriculumType as "HKDSE" | "A-levels",
        startDate: formData.startDate,
        endDate: formData.endDate,
        maxStudents: formData.maxStudents,
        isActive: formData.isActive,
        language: formData.language as "english" | "cantonese" | "mandarin",
        isClassSpecific: formData.isClassSpecific,
        teacher: formData.teacher,
      };

      let course;
      if (initialData?._id) {
        course = await updateCourse(initialData._id, courseData);
      } else {
        course = await createCourse(courseData);
      }

      setSuccess(true);

      if (onSuccess) {
        onSuccess(course);
      }
    } catch (err: any) {
      setError(
        err.message ||
          `Failed to ${initialData?._id ? "update" : "create"} course`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-medium mb-6">
        {initialData?._id ? "Edit Course" : "Create New Course"}
      </h2>

      {error && <ErrorMessage message={error} />}

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
          Course successfully {initialData?._id ? "updated" : "created"}!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Course Title* (Required)
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
            maxLength={100}
            placeholder="Enter course title (max 100 characters)"
          />
        </div>

        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Course Code* (Required)
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
            placeholder="Enter unique course code"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description* (Required)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
            placeholder="Enter course description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="curriculumType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Curriculum Type* (Required)
            </label>
            <select
              id="curriculumType"
              name="curriculumType"
              value={formData.curriculumType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="HKDSE">HKDSE</option>
              <option value="A-levels">A-levels</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="grade"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Form Level* (Required)
            </label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="">Select Form Level</option>
              <option value="Form 1">Form 1</option>
              <option value="Form 2">Form 2</option>
              <option value="Form 3">Form 3</option>
              <option value="Form 4">Form 4</option>
              <option value="Form 5">Form 5</option>
              <option value="Form 6">Form 6</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date* (Required)
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date* (Required)
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
              min={formData.startDate}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="english">English</option>
              <option value="cantonese">Cantonese</option>
              <option value="mandarin">Mandarin</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="maxStudents"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Maximum Students
            </label>
            <input
              type="number"
              id="maxStudents"
              name="maxStudents"
              value={formData.maxStudents}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="teacher"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Teacher ID* (Required)
          </label>
          <input
            type="text"
            id="teacher"
            name="teacher"
            value={formData.teacher}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
            placeholder="Enter teacher ID"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isClassSpecific"
            name="isClassSpecific"
            checked={formData.isClassSpecific}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isClassSpecific"
            className="text-sm font-medium text-gray-700"
          >
            Class-specific course
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isActive"
            className="text-sm font-medium text-gray-700"
          >
            Active course
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : initialData?._id
              ? "Update Course"
              : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
