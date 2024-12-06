export interface Event {
  id?: number;
  title: string;
  subtitle?: string;
  description?: string;
  event_date: string;
  created_at?: string;
  location?: string;
  max_participants?: number;
  is_public?: boolean;
  user_id: number;
  booking_link?: string;
  brochure_path?: string;
}
