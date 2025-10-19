///
/// Types for the objects in the original ccfddl/ccf-deadlines's conference/ directory.
///

/**
 * Conference object, used for recording the conference.
 */
export interface Conference {
  title: string;
  description: string;
  sub: string;
  rank: Rank;
  dblp: string;
  confs: ConfEdition[];
  // Additional fields for this project.
  relpath: string; // relative path of the conference data file to the root data/
}

/**
 * Rank object, used for recording the rank of a conference.
 */
export interface Rank {
  ccf: string;
  core: string;
  thcpl: string;
}

/**
 * Conference edition object, used for recording the edition of a conference.
 *
 * A conference edition is a year of the conference, each conference has multiple editions.
 */
export interface ConfEdition {
  year: number;
  id: string;
  link: string;
  timeline: Timeline[];
  timezone: string;
  date: string;
  place: string;
}

/**
 * Timeline, each for one review round.
 */
export interface Timeline {
  deadline?: string;
  abstract_deadline?: string;
  comment?: string;
  // Additional fields for this project.
  notification?: string;
}

/**
 * Conference type.
 */
export interface ConferenceType {
  name: string;
  name_en: string;
  sub: string;
}

///
/// Special types for this project's types.yml file.
///

/**
 * Custom conference type, used for recording additional conference types that are not in
 * the original ccfddl/ccf-deadlines's types.yml file.
 */
export interface CustomConferenceType {
  name: string;
  name_en: string;
  sub: string;
  confs: string[];
}

///
/// Types for APIs of this project.
///

/**
 * Paginated response object, used for recording the paginated response.
 */
export interface PaginatedResponse {
  items: Conference[];
  total: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
