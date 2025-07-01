import { Layout, SlideLayout } from "@/types/presentation";

export const DEFAULT_LAYOUTS: Record<string, Layout> = {
  "title-content": {
    _id: "title-content",
    name: "Title and Content",
    description: "A classic layout with a title and content area",
    type: SlideLayout.TITLE_CONTENT,
    elements: [
      {
        type: "title",
        grid: {
          columnStart: 1,
          columnEnd: 13,
          rowStart: 1,
          rowEnd: 2,
        },
        format: {},
        placeholder: "Click to add title",
        value: "",
      },
      {
        type: "content",
        grid: {
          columnStart: 1,
          columnEnd: 13,
          rowStart: 2,
          rowEnd: 7,
        },
        format: {},
        placeholder: "Click to add content",
        value: "",
      },
    ],
    isDefault: true,
    isPublic: true,
  },
  "title-content-image": {
    _id: "title-content-image",
    name: "Title, Content and Image",
    description: "A layout with title, content and an image area",
    type: SlideLayout.TITLE_CONTENT_IMAGE,
    elements: [
      {
        type: "title",

        grid: {
          columnStart: 1,
          columnEnd: 13,
          rowStart: 1,
          rowEnd: 2,
        },
        format: {},
        placeholder: "Click to add title",
        value: "",
      },
      {
        type: "content",

        grid: {
          columnStart: 1,
          columnEnd: 13,
          rowStart: 2,
          rowEnd: 5,
        },
        format: {},
        placeholder: "Click to add content",
        value: "",
      },
      {
        type: "image",

        grid: {
          columnStart: 5,
          columnEnd: 9,
          rowStart: 5,
          rowEnd: 7,
        },
        format: {},
        placeholder: "Click to add image",
        value: "",
      },
    ],
    isPublic: true,
  },
  "content-only": {
    _id: "content-only",
    name: "Content Only",
    description: "A clean layout with just content",
    type: SlideLayout.CONTENT_ONLY,
    elements: [
      {
        type: "content",

        grid: {
          columnStart: 1,
          columnEnd: 13,
          rowStart: 1,
          rowEnd: 7,
        },
        format: {},
        placeholder: "Click to add content",
        value: "",
      },
    ],
    isPublic: true,
  },
  "image-left": {
    _id: "image-left",
    name: "Image Left",
    description: "Image on the left with content on the right",
    type: SlideLayout.IMAGE_LEFT,
    elements: [
      {
        type: "title",
        grid: {
          columnStart: 1,
          columnEnd: 13,
          rowStart: 1,
          rowEnd: 2,
        },
        format: {},
        placeholder: "Click to add title",
        value: "",
      },
      {
        type: "content",
        grid: {
          columnStart: 5,
          columnEnd: 13,
          rowStart: 2,
          rowEnd: 7,
        },
        format: {},
        placeholder: "Click to add content",
        value: "",
      },
      {
        type: "image",
        grid: {
          columnStart: 1,
          columnEnd: 5,
          rowStart: 2,
          rowEnd: 7,
        },
        format: {},
        placeholder: "Click to add image",
        value: "",
      },
    ],
    isPublic: true,
  },
  "image-right": {
    _id: "image-right",
    name: "Image Right",
    description: "Content on the left with image on the right",
    type: SlideLayout.IMAGE_RIGHT,
    elements: [
      {
        type: "title",
        grid: {
          columnStart: 1,
          columnEnd: 13,
          rowStart: 1,
          rowEnd: 2,
        },
        format: {},
        placeholder: "Click to add title",
        value: "",
      },
      {
        type: "content",
        grid: {
          columnStart: 1,
          columnEnd: 8,
          rowStart: 2,
          rowEnd: 7,
        },
        format: {},
        placeholder: "Click to add content",
        value: "",
      },
      {
        type: "image",
        grid: {
          columnStart: 8,
          columnEnd: 13,
          rowStart: 2,
          rowEnd: 7,
        },
        format: {},
        placeholder: "Click to add image",
        value: "",
      },
    ],
    isPublic: true,
  },
  "full-image": {
    _id: "full-image",
    name: "Full Image",
    description: "Full slide image with optional title overlay",
    type: SlideLayout.FULL_IMAGE,
    elements: [
      {
        type: "title",

        grid: {
          columnStart: 1,
          columnEnd: 13,
          rowStart: 1,
          rowEnd: 2,
        },
        format: {},
        placeholder: "Click to add title",
        value: "",
      },
      {
        type: "image",

        grid: {
          columnStart: 1,
          columnEnd: 13,
          rowStart: 2,
          rowEnd: 7,
        },
        format: {},
        placeholder: "Click to add image",
        value: "",
      },
    ],
    isPublic: true,
  },
};
