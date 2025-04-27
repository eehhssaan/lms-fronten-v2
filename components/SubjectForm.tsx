"use client";

import { useState } from "react";
import { Subject } from "@/types";
import { createSubject, updateSubject } from "@/lib/api";
import Button from "./Button";
import ErrorMessage from "./ErrorMessage";

interface SubjectFormProps {
  initialData?: Partial<Subject>;
  onSuccess?: (subject: Subject) => void;
}

export default function SubjectForm({
  initialData,
  onSuccess,
}: SubjectFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || "",
    grade: initialData?.grade || "",
    description: initialData?.description || "",
    headTeacher: initialData?.headTeacher?._id || "",
    iconUrl: initialData?.iconUrl || "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.code ||
      !formData.grade ||
      !formData.headTeacher
    ) {
      setError(
        "Please fill in all required fields (Name, Code, Grade Level, and Head Teacher)"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Format data for API
      const subjectData = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        grade: formData.grade.trim(),
        description: formData.description.trim(),
        headTeacher: formData.headTeacher,
        iconUrl: formData.iconUrl.trim(),
      };

      let subject;
      if (initialData?._id) {
        subject = await updateSubject(initialData._id, subjectData);
      } else {
        subject = await createSubject(subjectData);
      }

      setSuccess(true);

      if (onSuccess) {
        onSuccess(subject);
      }
    } catch (err: any) {
      setError(
        err.message ||
          `Failed to ${initialData?._id ? "update" : "create"} subject`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-medium mb-6">
        {initialData?._id ? "Edit Subject" : "Create New Subject"}
      </h2>

      {error && <ErrorMessage message={error} />}

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
          Subject successfully {initialData?._id ? "updated" : "created"}!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subject Name* (Required)
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
            maxLength={100}
            placeholder="Enter subject name"
          />
        </div>

        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subject Code* (Required)
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
            placeholder="Enter unique subject code"
          />
        </div>

        <div>
          <label
            htmlFor="grade"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Grade Level* (Required)
          </label>
          <input
            type="text"
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
            placeholder="Enter grade level"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={4}
            placeholder="Enter subject description"
          />
        </div>

        <div>
          <label
            htmlFor="headTeacher"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Head Teacher* (Required)
          </label>
          <input
            type="text"
            id="headTeacher"
            name="headTeacher"
            value={formData.headTeacher}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
            placeholder="Enter head teacher ID"
          />
        </div>

        <div>
          <label
            htmlFor="iconUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Icon URL
          </label>
          <input
            type="text"
            id="iconUrl"
            name="iconUrl"
            value={formData.iconUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Enter icon URL"
          />
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
              ? "Update Subject"
              : "Create Subject"}
          </button>
        </div>
      </form>
    </div>
  );
}
