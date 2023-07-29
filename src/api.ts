import {
  AttendanceEntry,
  AuthError,
  AuthResponse,
  LessonVisit,
  UserInfo,
  Review,
  ScheduleEntry,
  LoginData,
  HomeworkStatus,
  HomeworkType,
  Homework,
  NewsEntry,
  NewsDetails,
  Exam,
  StudentInfo,
  ActivityEntry,
  ActivityLog,
  UserSettings,
  GroupInfo,
  HomeworkCount,
  UploadedHomework,
} from "./types.js";

const baseUrl = "https://msapi.itstep.org/api/v2";

type CacheType = "default" | "no-store" | "reload" | "no-cache" | "force-cache";

export interface ClientConfig {
  loginData: LoginData;
  language?: string;
  cache?: CacheType;
  accessToken?: string;
  tokenExpiresAt?: number;
  groupId?: number;
  onUnauthorized?: (path: string) => void;
}

export interface ClientData {
  loginData: LoginData;
  language?: string;
  cache?: CacheType;
  accessToken: string;
  tokenExpiresAt: number;
  groupId?: number;
}

type UploadHomeworkParams =
  | {
      homeworkId: number;
      answerText: string;
      spentTimeHour?: number;
      spentTimeMin?: number;
    }
  | {
      homeworkId: number;
      file: File;
      spentTimeHour?: number;
      spentTimeMin?: number;
    }
  | {
      homeworkId: number;
      answerText: string;
      file: File;
      spentTimeHour?: number;
      spentTimeMin?: number;
    };

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export function isTokenExpired(apiClientData: ClientData) {
  return Date.now() >= apiClientData.tokenExpiresAt;
}

export const createClient = async (config: ClientConfig) => {
  const authUser = async (loginData: LoginData) => {
    const body = {
      application_key:
        "6a56a5df2667e65aab73ce76d1dd737f7d1faef9c52e8b8c55ac75f565d8e8a6",
      id_city: null,
      ...loginData,
    };

    const response: AuthResponse | AuthError[] = await fetch(
      `${baseUrl}/auth/login`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    ).then((r) => r.json());

    return response;
  };

  let clientData: ClientData;

  if (config.accessToken && config.tokenExpiresAt) {
    clientData = {
      loginData: config.loginData,
      language: config.language,
      cache: config.cache,
      accessToken: config.accessToken,
      tokenExpiresAt: config.tokenExpiresAt,
      groupId: config.groupId,
    };
  } else {
    const user = await authUser(config.loginData);

    if (Array.isArray(user)) throw user;

    clientData = {
      ...config,
      accessToken: user.access_token,
      tokenExpiresAt: user.expires_in_access * 1000,
    };
  }

  const updateToken = async () => {
    const user = await authUser(config.loginData);

    if (Array.isArray(user)) throw user;

    clientData.accessToken = user.access_token;
    clientData.tokenExpiresAt = user.expires_in_access * 1000;
  };

  const isTokenExpired = () => Date.now() >= clientData.tokenExpiresAt;

  const get = async <T>(path: string, retry = true): Promise<T | undefined> => {
    if (isTokenExpired()) {
      await updateToken();
    }

    const res = await fetch(`${baseUrl}/${path}`, {
      headers: {
        "x-language": config.language ?? "en",
        authorization: `Bearer ${clientData.accessToken}`,
        accept: "application/json",
      },
      cache: clientData.cache,
    });

    if (res.status === 401) {
      if (config.onUnauthorized) {
        config.onUnauthorized(path);
        return;
      }

      if (retry) {
        await updateToken();
        return get<T>(path, false);
      }

      throw "Access token is expired or invalid";
    }

    return await res.json();
  };

  const getUserInfo = () => {
    const link = "settings/user-info";
    return get<UserInfo>(link);
  };

  const getUserSettings = () => {
    const link = "profile/operations/settings";
    return get<UserSettings>(link);
  };

  const getMonthSchedule = (date = new Date()) => {
    const link = `schedule/operations/get-month?date_filter=${formatDate(
      date
    )}`;
    return get<ScheduleEntry[]>(link);
  };

  const getScheduleByDate = (date = new Date()) => {
    const link = `schedule/operations/get-by-date?date_filter=${formatDate(
      date
    )}`;
    return get<ScheduleEntry[]>(link);
  };

  const getReviews = () => {
    const link = "reviews/index/list";
    return get<Review[]>(link);
  };

  const getVisits = () => {
    const link = "progress/operations/student-visits";
    return get<LessonVisit[]>(link);
  };

  const getAttendance = () => {
    const link = "dashboard/chart/attendance";
    return get<AttendanceEntry[]>(link);
  };

  const getHomeworkList = async ({
    page = 1,
    status = HomeworkStatus.Active,
    type = HomeworkType.Homework,
  }: {
    page?: number;
    type?: HomeworkType;
    status: HomeworkStatus;
  }) => {
    if (!clientData.groupId) {
      const info = await getUserInfo();
      if (!info) throw "Unable to get user group id";
      clientData.groupId = info.current_group_id;
    }

    const link = `homework/operations/list?page=${page}&status=${status}&type=${type}&group_id=${clientData.groupId}`;

    return get<Homework[]>(link);
  };

  const getLatestNews = () => {
    const link = "news/operations/latest-news";
    return get<NewsEntry[]>(link);
  };

  const getNewsDetails = (newsId: number) => {
    const link = `news/operations/detail-news?news_id=${newsId}`;
    return get<NewsDetails>(link);
  };

  const getAllExams = () => {
    const link = "progress/operations/student-exams";
    return get<Exam[]>(link);
  };

  const getFutureExams = () => {
    const link = "dashboard/info/future-exams";
    return get<Exam[]>(link);
  };

  const getStreamLeaders = () => {
    const link = "dashboard/progress/leader-stream";
    return get<StudentInfo[]>(link);
  };

  const getGroupLeaders = () => {
    const link = "dashboard/progress/leader-group";
    return get<StudentInfo[]>(link);
  };

  const getActivity = () => {
    const link = "dashboard/progress/activity";
    return get<ActivityEntry[]>(link);
  };

  const getActivityLog = () => {
    const link = "dashboard/progress/activity-web";
    return get<ActivityLog[]>(link);
  };

  const getGroupInfo = () => {
    const link = "homework/settings/group-history";
    return get<GroupInfo[]>(link);
  };

  const getHomeworkCount = () => {
    const link = "count/homework";
    return get<HomeworkCount[]>(link);
  };

  const uploadHomework = async (params: UploadHomeworkParams) => {
    const link = baseUrl + "/homework/operations/create";
    const formData = new FormData();

    formData.set("id", params.homeworkId.toString());
    if ("answerText" in params && params.answerText)
      formData.set("answerText", params.answerText);
    if ("file" in params && params.file)
      formData.set("file", params.file, params.file.name);
    formData.set("spentTimeHour", (params.spentTimeHour ?? 99).toString());
    formData.set("spentTimeMin", (params.spentTimeMin ?? 99).toString());

    if (isTokenExpired()) {
      await updateToken();
    }

    const res = await fetch(link, {
      body: formData,
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
        "x-language": clientData.language ?? "en",
        accept: "application/json",
        authentication: `Bearer ${clientData.accessToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw data;
    }

    return data as UploadedHomework | undefined;
  };

  const deleteHomework = async (homeworkId: number | string) => {
    const link = baseUrl + "/homework/operations/delete";

    if (isTokenExpired()) {
      await updateToken();
    }

    const res = await fetch(link, {
      body: JSON.stringify({
        id: homeworkId,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-language": clientData.language ?? "en",
        accept: "application/json",
        authentication: `Bearer ${clientData.accessToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw data;
    }

    return data as boolean | undefined;
  };

  return {
    clientData,
    authUser,
    updateToken,
    getUserInfo,
    getUserSettings,
    getMonthSchedule,
    getScheduleByDate,
    getReviews,
    getVisits,
    getAttendance,
    getHomeworkList,
    getLatestNews,
    getNewsDetails,
    getAllExams,
    getFutureExams,
    getStreamLeaders,
    getGroupLeaders,
    getActivity,
    getActivityLog,
    getGroupInfo,
    getHomeworkCount,
    uploadHomework,
    deleteHomework,
    isTokenExpired,
  };
};
