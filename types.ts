export interface MystatUserData {
  username: string;
  password: string;
}

export interface MystatResponse {
  success: boolean;
  error?: string | null;
  data: any;
}

export enum MystatHomeworkType {
  Homework,
  Lab,
}

export enum MystatHomeworkStatus {
  Overdue,
  Checked,
  Uploaded,
  Active,
  Deleted = 5,
}
