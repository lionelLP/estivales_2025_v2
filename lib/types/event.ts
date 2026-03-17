import { MediaType } from "@/lib/utils/media-utils";

export interface Event {
  id?: number;
  title: string;
  subtitle?: string;
  description?: string;
  event_date: string;
  first_date?: string;
  last_date?: string;
  event_dates?: Array<{ id: number; date_time: string }>;
  created_at?: string;
  location?: string;
  max_participants?: number;
  is_public?: boolean;
  user_id: number;
  booking_link?: string;
  brochure_path?: string;
  instructions?: string;
  images?: MediaType[];
}
