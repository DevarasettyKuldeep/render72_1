export interface ScheduleSummary {
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
}

export interface Schedule {
  id?: string;
  title?: string;
  description?: string;
  event_date?: string;
  date?: string;
  start_time: string;
  end_time: string;
  venue: string;
}

export interface Coordinator {
  id: string;
  name: string;
  role: string;
  contact?: string;
  email?: string;
  phone?: string;
}

export interface Organizer {
  id: string;
  name: string;
  org_type?: string;
  logo_url?: string;
}

export interface Prize {
  rank: number | string;
  title?: string;
  label?: string;
  amount?: number;
  value?: string;
  description?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface EventItem {
  id: string;
  name: string;
  blurb: string;
  description?: string;
  cover_image_url: string;
  cover_image_alt: string;
  banner_image_url?: string;
  banner_image_alt?: string;
  category: string;
  tags: string[];
  event_type: 'EVENT' | 'WORKSHOP';
  event_mode: 'ONLINE' | 'OFFLINE';
  event_status: 'ACTIVE' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';
  is_featured: boolean;
  is_technical: boolean;
  price: number;
  is_per_head: boolean;
  min_teamsize: number;
  max_teamsize: number;
  total_seats: number;
  seats_filled: number;
  registration_status: 'OPEN' | 'CLOSED' | 'SOLD_OUT';
  registration_deadline?: string;
  schedule_summary: ScheduleSummary;
  schedules?: Schedule[];
  coordinators?: Coordinator[];
  organizers?: Organizer[];
  prizes?: Prize[];
  rules?: string[];
  faqs?: FAQ[];
  gallery_images?: string[];
  highlights?: string[];
  what_to_expect?: string[];
  eligibility?: string[];
  prerequisites?: string[];
}
