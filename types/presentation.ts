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
  titleFormat: {
    fontSize: string;
    fontWeight: "normal" | "bold";
    color: string;
    alignment: "left" | "center" | "right";
  };
  contentFormat: {
    fontSize: string;
    fontWeight: "normal" | "bold";
    color: string;
    alignment: "left" | "center" | "right";
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
  content?: string;
  type?: string;
  layout?: string;
  backgroundColor?: string;
  elements?: Array<{
    type: string;
    value: string;
    format?: TextFormat;
  }>;
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
  CONTENT_ONLY = "content-only",
  IMAGE_LEFT = "image-left",
  IMAGE_RIGHT = "image-right",
  TWO_COLUMN = "two-column",
  FULL_IMAGE = "full-image",
}

export interface Presentation {
  id: string;
  title: string;
  description?: string;
  themeId: string;
  theme?: Theme;
  slides?: Slide[];
  createdAt?: Date;
  updatedAt?: Date;
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

export interface UpdateSlideDto {
  title?: string;
  content?: string;
  layout?: SlideLayout;
  order?: number;
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
  titleFormat: {
    fontSize: string;
    fontWeight: string;
    color?: string;
    alignment: "left" | "center" | "right";
  };
  contentFormat: {
    fontSize: string;
    fontWeight: string;
    color?: string;
    alignment: "left" | "center" | "right";
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
  titleFormat?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    alignment?: "left" | "center" | "right";
  };
  contentFormat?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    alignment?: "left" | "center" | "right";
  };
  isDefault?: boolean;
  isPublic?: boolean;
}
