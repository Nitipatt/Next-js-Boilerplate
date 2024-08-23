export type Room = {
  id: number;
  name: string;
  name_en: string;
  description: string;
  link_url: string;
  room_icon_url: string;
  is_pinned: boolean;
  order: number | null;
  pinned_time: string | null;
  slug: string;
};
