export interface Theme {
  _id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    text: string;
    accent1: string;
    accent2: string;
    accent3: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  defaults: {
    title: {
      fontSize: string;
      fontWeight: "normal" | "bold";
      color: string;
    };
    content: {
      fontSize: string;
      fontWeight: "normal" | "bold";
      color: string;
    };
  };
  isDefault?: boolean;
  isPublic?: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TextFormat {
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textAlign?: "left" | "center" | "right";
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
}

export interface Slide {
  _id?: string;
  title?: string;
  type?: string;
  layout?: string;
  backgroundColor?: string;
  imageUrl?: string;
  elements: SlideElement[];
  customStyles?: {
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    fontSize?: string;
  };
  presentationId?: string;
}

export enum SlideLayout {
  TITLE_CONTENT = "title-content",
  TITLE_CONTENT_IMAGE = "title-content-image",
  CONTENT_ONLY = "content-only",
  IMAGE_LEFT = "image-left",
  IMAGE_RIGHT = "image-right",
  TWO_COLUMN = "two-column",
  FULL_IMAGE = "full-image",
}

export interface Presentation {
  _id: string;
  title: string;
  description?: string;
  themeId: string;
  theme?: Theme;
  slides?: Slide[];
  createdAt?: Date;
  updatedAt?: Date;
  chapterId?: string;
  chapterTitle?: string;
  subjectId?: string;
}

export interface CreatePresentationDto {
  title: string;
  description?: string;
  themeId: string;
}

export interface UpdatePresentationDto {
  title?: string;
  description?: string;
  themeId?: string;
}

export interface CreateSlideDto {
  title?: string;
  content: string;
  layout: SlideLayout;
  order: number;
  imageUrl?: string;
  columnOneContent?: string;
  columnTwoContent?: string;
}

export interface CreateThemeDto {
  name: string;
  description?: string;
  colors: {
    background: string;
    text: string;
    accent1?: string;
    accent2?: string;
    accent3?: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  defaults: {
    title: {
      fontSize: string;
      fontWeight: string;
      color?: string;
    };
    content: {
      fontSize: string;
      fontWeight: string;
      color?: string;
    };
  };
  isDefault?: boolean;
  isPublic?: boolean;
}

export interface UpdateThemeDto {
  name?: string;
  description?: string;
  colors?: {
    background?: string;
    text?: string;
    accent1?: string;
    accent2?: string;
    accent3?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  defaults?: {
    title?: {
      fontSize?: string;
      fontWeight?: string;
      color?: string;
    };
    content?: {
      fontSize?: string;
      fontWeight?: string;
      color?: string;
    };
  };
  isDefault?: boolean;
  isPublic?: boolean;
}

export interface Layout {
  _id: string;
  name: string;
  description: string;
  type: SlideLayout;
  elements: SlideElement[];
  thumbnail?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SlideElementLayout {
  type: string;
  x: string | number;
  y: string | number;
  width: string | number;
  height: string | number;
  placeholder?: string;
  fontSize?: string | number;
  textAlign?: "left" | "center" | "right";
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
}

export interface SlideElementContent {
  _id?: string;
  type: string;
  value: string;
  format?: TextFormat;
}

export interface ElementPositionMetadata {
  originalX: number | string;
  originalY: number | string;
  originalWidth: number | string;
  originalHeight: number | string;
  lastPosition: "left" | "right" | "top" | "default";
}

export interface SlideElement extends SlideElementLayout {
  _id?: string;
  type: string;
  value: string;
  format?: TextFormat;
  placeholder?: string;
  position?: "left" | "right" | "top" | "default";
}

export interface LocalSlide {
  _id: string;
  title: string;
  layout?: string;
  type: string;
  elements: SlideElement[];
  customStyles?: {
    backgroundColor?: string;
  };
  order?: number;
}

export interface PresentationSettings {
  aspectRatio: "16:9" | "4:3";
  defaultTransition: "fade" | "slide" | "none";
  showSlideNumbers: boolean;
}

export interface LocalPresentation {
  _id: string;
  title: string;
  description?: string;
  theme?: Theme;
  slides: LocalSlide[];
  lastModified: number;
  isDirty: boolean;
  settings?: PresentationSettings;
}
