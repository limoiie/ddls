export interface Timeline {
  deadline?: string;
  abstract_deadline?: string;
  comment?: string;
}

export interface ConferenceEvent {
  year: number;
  id: string;
  link: string;
  timeline: Timeline[];
  timezone: string;
  date: string;
  place: string;
}

export interface Rank {
  ccf: string;
  core: string;
  thcpl: string;
}

export interface Conference {
  title: string;
  description: string;
  sub: string;
  rank: Rank;
  dblp: string;
  confs: ConferenceEvent[];
}

export interface PaginatedResponse {
  items: Conference[];
  total: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface ConferenceType {
  name: string;
  name_en: string;
  sub: string;
}
