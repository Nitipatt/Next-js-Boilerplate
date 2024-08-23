export type Highlight = {
  image_url: string[];
  message: string;
  name: string;
  post_url: string;
  weight: number;
};

export type HighlightState = {
  highlights: Highlight[];
};

export type AddHighlightAction = {
  type: string;
  payload: string;
};
