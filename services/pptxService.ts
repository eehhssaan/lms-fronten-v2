import axios from "axios";

interface PPTXPrompts {
  mainPrompt: string;
  numberOfSlides: string;
}

interface PPTXContext {
  chapter?: string;
  grade?: string;
  subject?: string;
  content?: string;
  curriculum?: string;
  language?: string;
  type?: string;
}

interface PPTXResponse {
  success: boolean;
  data?: {
    content: {
      slides: Array<{
        title: string;
        content: string;
        type: string;
      }>;
    };
    metadata: {
      title: string;
      subtitle: string;
      author: string;
    };
  };
  error?: string;
}

export const generatePPTX = async (
  prompts: PPTXPrompts,
  context: PPTXContext
): Promise<PPTXResponse> => {
  try {
    const response = await axios.post("/api/llm/generate", {
      prompts,
      context,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to generate content",
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
};
