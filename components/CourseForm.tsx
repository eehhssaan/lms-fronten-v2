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
    subject: initialData?.subject || "",
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
      if (!formData.code.trim()) {
        throw new Error("Course code is required");
      }
      if (!formData.description.trim()) {
        throw new Error("Course description is required");
      }
      if (!formData.subject.trim()) {
        throw new Error("Subject is required");
      }
      if (!formData.grade.trim()) {
        throw new Error("Grade level is required");
      }
      if (!formData.curriculumType) {
        throw new Error("Curriculum type is required");
      }

      // Format data for API
      const courseData = {
        title: formData.title.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        subject: formData.subject.trim(),
        grade: formData.grade.trim(),
        curriculumType: formData.curriculumType,
        startDate: formData.startDate || new Date().toISOString(),
        endDate:
          formData.endDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default to 30 days from now
        maxStudents: formData.maxStudents,
        isActive: formData.isActive,
        language: formData.language as "english" | "cantonese" | "mandarin",
      };

      let course;
      if (initialData?._id) {
        // Update existing course
        course = await updateCourse(initialData._id, courseData);
      } else {
        // Create new course
        course = await createCourse(courseData);
      }

      setSuccess(true);

      // Call success callback if provided
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
            Course Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Course Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
            placeholder="e.g., MATH101"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
              placeholder="e.g., Mathematics, Science, English"
            />
          </div>

          <div>
            <label
              htmlFor="grade"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Grade Level <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
              placeholder="e.g., K-12, College, Professional"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
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
            min={1}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isActive"
            className="ml-2 block text-sm text-gray-700"
          >
            Active course (visible to students)
          </label>
        </div>

        <div>
          <label
            htmlFor="curriculumType"
            className="block text-sm font-medium text-gray-700"
          >
            Curriculum Type *
          </label>
          <select
            id="curriculumType"
            name="curriculumType"
            value={formData.curriculumType}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                curriculumType: e.target.value as "HKDSE" | "A-levels",
              }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="HKDSE">HKDSE</option>
            <option value="A-levels">A-levels</option>
          </select>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
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
