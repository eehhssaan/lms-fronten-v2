import React, { useState } from "react";
import { generatePPTX } from "../services/pptxService";
import { generatePresentation } from "../utils/pptxGenerator";
import toast from "react-hot-toast";

const PPTXGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mainPrompt: "",
    numberOfSlides: "10",
    chapter: "",
    grade: "",
    subject: "",
    curriculum: "",
    language: "",
    type: "lesson",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { mainPrompt, numberOfSlides, ...context } = formData;
      const response = await generatePPTX(
        { mainPrompt, numberOfSlides },
        context
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate content");
      }

      const { content, metadata } = response.data;
      const base64 = await generatePresentation(content.slides, metadata);

      // Create download link
      const downloadButton = document.createElement("a");
      downloadButton.href = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${base64}`;
      downloadButton.download = "presentation.pptx";
      downloadButton.click();

      toast.success("Presentation generated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate presentation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Generate Presentation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Main Topic
          </label>
          <input
            type="text"
            name="mainPrompt"
            value={formData.mainPrompt}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Number of Slides
          </label>
          <select
            name="numberOfSlides"
            value={formData.numberOfSlides}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="5">5 Slides</option>
            <option value="10">10 Slides</option>
            <option value="20">20 Slides</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Chapter
          </label>
          <input
            type="text"
            name="chapter"
            value={formData.chapter}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Grade
          </label>
          <input
            type="text"
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Curriculum
          </label>
          <input
            type="text"
            name="curriculum"
            value={formData.curriculum}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <input
            type="text"
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="lesson">Lesson</option>
            <option value="summary">Summary</option>
            <option value="review">Review</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Presentation"}
        </button>
      </form>
    </div>
  );
};

export default PPTXGenerator;
