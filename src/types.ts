export interface LoginData {
  username: string;
  password: string;
}

export enum HomeworkType {
  Homework,
  Lab,
}

export enum HomeworkStatus {
  Checked = 1,
  Uploaded = 2,
  Active = 3,
  Deleted = 5,
  Overdue = 6,
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in_access: number;
  expires_in_refresh: number;
  user_type: number;
  city_data: {
    country_code: string;
    name: string;
    prefix: string;
    timezone_name: string;
    translate_key: string;
    id_city: number;
    market_status: number;
  };
}

export interface AuthError {
  field: string;
  message: string;
}

export interface ScheduleEntry {
  date: string;
  started_at: string;
  finished_at: string;
  room_name: string;
  subject_name: string;
  teacher_name: string;
  lesson: number;
}

export interface UserInfo {
  student_id: number;
  current_group_id: number;
  current_group_status: number;
  stream_id: number;
  level: number;
  achieves_count: number;
  full_name: string;
  group_name: string;
  photo: string;
  stream_name: string;
  groups: Group;
  visibility: {
    is_birthday: boolean;
    is_debtor: boolean;
    is_design: boolean;
    is_dz_group_issue: boolean;
    is_email_verified: boolean;
    is_news_popup: boolean;
    is_only_profile: boolean;
    is_phone_verified: boolean;
    is_promo: boolean;
    is_quizzes_expired: boolean;
    is_referral_program: boolean;
    is_school: boolean;
    is_signal: boolean;
    is_tehnotable_news: boolean;
    is_test: boolean;
    is_vacancy: boolean;
  };
  gaming_points: [GamingPoint, GamingPoint];
}

interface GamingPoint {
  new_gaming_point_types__id: GamingPointTypes;
  points: number;
}

export enum GamingPointTypes {
  Gems = 1,
  Coins,
}

export interface Group {
  id: number;
  group_status: number;
  name: string;
  is_primary: boolean;
}

export interface GroupInfo {
  id: number;
  specs: GroupSpec[];
}

interface GroupSpec {
  id: number;
  name: string;
  short_name: string;
}

export interface Review {
  date: string;
  full_spec: string;
  message: string;
  spec: string;
  teacher: string;
}

export interface LessonVisit {
  spec_id: number;
  lesson_number: number;
  status_was: number;
  class_work_mark?: number;
  control_work_mark?: number;
  home_work_mark?: number;
  lab_work_mark?: number;
  date_visit: string;
  spec_name: string;
  lesson_theme: string;
  teacher_name: string;
}

export interface AttendanceEntry {
  date: string;
  has_rasp: boolean;
  points?: number;
  previous_points?: number;
}

export interface Homework {
  id: number;
  id_group: number;
  id_spec: number;
  id_teach: number;
  name_spec: string;
  theme: string;
  comment: string;
  creation_time: string;
  completion_time: string;
  overdue_time: string;
  cover_image: string;
  file_path: string;
  filename?: string;
  fio_teach: string;
  homework_comment: {
    text_comment?: string;
    attachment?: string;
    attachment_path?: string;
    date_updated: string;
  };
  homework_stud: UploadedHomework;
  status: HomeworkStatus;
}

export interface HomeworkDTO {
  data: Homework[];
  _meta: HomeworkMetadata;
}

export interface HomeworkDTOWithStatus {
  status: HomeworkStatus;
  data: Homework[];
  _meta: HomeworkMetadata;
}

export interface HomeworkMetadata {
  currentPage: number;
  totalPages: number;
}

export interface UploadedHomework {
  id: number;
  mark?: number;
  creation_time: string;
  file_path?: string;
  filename?: string;
  stud_answer?: string;
  tmp_file?: string;
  auto_mark: boolean;
}

export interface HomeworkCount {
  counter_type: HomeworkStatus;
  counter: number;
}

export interface NewsEntry {
  id_bbs: number;
  theme: string;
  time: string;
}

export interface NewsDetails {
  id_bbs: number;
  is_viewed: boolean;
  text_bbs: string;
  theme: string;
  time: string;
}

export interface Exam {
  exam_id: number;
  id_file: number;
  mark: number;
  mark_type: number;
  need_access: number;
  date: string;
  spec: string;
  teacher: string;
  comment_delete_file?: string;
  comment_teach?: string;
  ex_file_name?: string;
  file_path?: string;
  need_access_stud?: boolean;
}

export interface StudentInfo {
  id: number;
  position: number;
  amount: number;
  full_name: string;
  photo_path: string;
}

export interface ActivityLog {
  activity_log: ActivityEntry[];
  date: string;
}

export interface ActivityEntry {
  achievements_id: number;
  achievements_type: number;
  action: number;
  badge: number;
  current_point: number;
  point_types_id: number;
  subject_mark?: number;
  date: string;
  achievements_name: AchievementNames;
  point_types_name: PointTypesNames;
  subject_name?: string;
  old_competition: boolean;
}

export enum AchievementNames {
  LessonRate = "EVALUATION_LESSON_MARK",
  PairVisit = "PAIR_VISIT",
  Assesment = "ASSESMENT",
  HomeworkCompleted = "HOMETASK_INTIME",
}

export enum PointTypesNames {
  Diamond = "DIAMOND",
  Coin = "COIN",
}

export interface UserSettings {
  id: number;
  fill_percentage: number;
  form_type: number;
  last_approving_status: number;
  address: string;
  azure_login: string;
  date_birth: string;
  email: string;
  ful_name: string;
  photo_path: string;
  study: string;
  decline_comment?: string;
  has_not_approved_data: boolean;
  has_not_approved_photo: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  azure: {
    has_azure: boolean;
    has_office: boolean;
    login: string;
  };
  links: {
    id: number;
    required_type: number;
    name: string;
    reg: string;
    is_required: boolean;
    show_link: boolean;
    valid: boolean;
  }[];
  phones: {
    phone_type: number;
    phone_number: string;
  }[];
}
