import type {
  MystatActivityLog,
  MystatActivityEntry,
  MystatAttendanceEntry,
  MystatAuthError,
  MystatAuthSuccess,
  MystatExam,
  MystatGroupInfo,
  MystatHomework,
  MystatHomeworkCount,
  MystatLessonVisit,
  MystatNewsDetails,
  MystatNewsEntry,
  MystatProfileInfo,
  MystatProfileSettings,
  MystatResponse,
  MystatReview,
  MystatScheduleEntry,
  MystatStudentInfo,
  MystatUploadedHomework,
  MystatUserData,
} from "./types.js";
import { MystatHomeworkType, MystatHomeworkStatus } from "./types.js";
import { fetch } from "cross-fetch";

const createSuccessResult = <T>(data: T): MystatResponse<T> => {
  return { data, error: null, success: true };
};

const createErrorResult = (
  errorMessage?: string | null
): MystatResponse<null> => {
  return {
    data: null,
    error: errorMessage || "Unknown error",
    success: false,
  };
};

class MystatAPI {
  userData: MystatUserData;
  baseLanguage: string;
  accessToken?: string;
  _baseUrl = "https://msapi.itstep.org/api/v2/";

  constructor(userData: MystatUserData, language?: string) {
    this.userData = userData;
    this.baseLanguage = language || "ru";
  }

  setUserData(userData: MystatUserData) {
    this.userData = userData;
  }

  setLanguage(language: string) {
    this.baseLanguage = language;
  }

  async _updateAccessToken() {
    const updateTokenResult = await this.getAccessToken();

    const accessToken = updateTokenResult.success
      ? (updateTokenResult.data as string)
      : "ERROR";

    this.accessToken = accessToken;
  }

  async _createConfig() {
    if (!this.accessToken) {
      await this._updateAccessToken();
    }

    return {
      "x-language": this.baseLanguage,
      authorization: `Bearer ${this.accessToken}`,
    };
  }

  async postRequest<T>(
    link: string,
    body?: FormData | string,
    retryOnUnauthorized = true
  ): Promise<MystatResponse<T> | MystatResponse<null>> {
    let data: MystatResponse<T> | MystatResponse<null> = createErrorResult();
    const reqConfig = await this._createConfig();
    const isJson = typeof body === "string";

    const headers: HeadersInit = { accept: "application/json", ...reqConfig };

    if (isJson) {
      headers["content-type"] = "application/json";
    }

    const response = await fetch(this._baseUrl + link, {
      headers,
      body,
      method: "POST",
    })
      .then((r) => r.text())
      .then((r) => (r ? JSON.parse(r) : { status: 204, code: 1 }));

    if (response.status === 401 && retryOnUnauthorized) {
      await this._updateAccessToken();
      return this.postRequest(link, body, false);
    } else if (response.code !== 0) {
      data = createSuccessResult(response);
    } else {
      data = createErrorResult(response.message);
    }

    return data;
  }

  async getRequest<T>(
    link: string,
    retryOnUnauthorized = true
  ): Promise<MystatResponse<T>> {
    let data = null;
    const reqConfig = await this._createConfig();

    const response = await fetch(this._baseUrl + link, {
      headers: {
        accept: "application/json",
        ...reqConfig,
      },
    }).then((r) => r.json());

    if (response.status === 401 && retryOnUnauthorized) {
      await this._updateAccessToken();
      return this.getRequest(link, false);
    } else if (response.code !== 0) {
      data = createSuccessResult(response);
    } else {
      data = createErrorResult(response.message);
    }

    return data;
  }

  async getAccessToken(): Promise<
    MystatResponse<string> | MystatResponse<null>
  > {
    const response = await this.authUser(this.userData);
    let data = null;

    if (response.success && "access_token" in response.data) {
      data = createSuccessResult(response.data.access_token);
    } else {
      data = createErrorResult(response.error);
    }

    return data;
  }

  async authUser(
    userData?: MystatUserData
  ): Promise<
    MystatResponse<MystatAuthSuccess> | MystatResponse<MystatAuthError[]>
  > {
    const { username, password } = userData ?? this.userData;
    const body = {
      application_key:
        "6a56a5df2667e65aab73ce76d1dd737f7d1faef9c52e8b8c55ac75f565d8e8a6",
      id_city: null,
      password: password,
      username: username,
    };

    let data = null;

    const response = await fetch(this._baseUrl + "auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then((r) => r.json());

    if (response.code === 0) {
      data = createErrorResult(response.message);
    } else {
      data = createSuccessResult(response);
    }

    return data;
  }

  getMonthSchedule(date = new Date()) {
    const link = `schedule/operations/get-month?date_filter=${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    return this.getRequest<MystatScheduleEntry[]>(link);
  }

  getScheduleByDate(date = new Date()) {
    const link = `schedule/operations/get-by-date?date_filter=${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;
    return this.getRequest<MystatScheduleEntry[]>(link);
  }

  getReviews() {
    const link = "reviews/index/list";
    return this.getRequest<MystatReview[]>(link);
  }

  getVisits() {
    const link = "progress/operations/student-visits";
    return this.getRequest<MystatLessonVisit[]>(link);
  }

  getAttendance() {
    const link = "dashboard/chart/attendance";
    return this.getRequest<MystatAttendanceEntry[]>(link);
  }

  async getHomeworkList(
    homeworkStatus?: MystatHomeworkStatus,
    page?: number,
    type?: MystatHomeworkType
  ) {
    const profileInfo = (await this.getProfileInfo()).data;

    const _page = page || 1;
    const _status =
      homeworkStatus !== undefined
        ? homeworkStatus
        : MystatHomeworkStatus.Active;
    const _type = type !== undefined ? type : MystatHomeworkType.Homework;

    const link = `homework/operations/list?page=${_page}&status=${_status}&type=${_type}&group_id=${profileInfo.current_group_id}`;

    return this.getRequest<MystatHomework[]>(link);
  }

  uploadHomework(
    homeworkId: number,
    answerText: string,
    spentTimeHour = 99,
    spentTimeMin = 99
  ) {
    const link = "homework/operations/create";
    const formData = new URLSearchParams();
    formData.set("id", homeworkId.toString());
    formData.set("answerText", answerText);
    formData.set("spentTimeHour", spentTimeHour.toString());
    formData.set("spentTimeMin", spentTimeMin.toString());

    return this.postRequest<MystatUploadedHomework>(link, formData);
  }

  deleteHomework(homeworkId: number) {
    const link = "homework/operations/delete";
    const body = JSON.stringify({
      id: homeworkId,
    });
    return this.postRequest<boolean>(link, body);
  }

  getNews() {
    const link = "news/operations/latest-news";
    return this.getRequest<MystatNewsEntry[]>(link);
  }

  getNewsDetails(newsId: number) {
    const link = `news/operations/detail-news?news_id=${newsId}`;
    return this.getRequest<MystatNewsDetails>(link);
  }

  getExams() {
    const link = "progress/operations/student-exams";
    return this.getRequest<MystatExam[]>(link);
  }

  getFutureExams() {
    const link = "dashboard/info/future-exams";
    return this.getRequest<MystatExam[]>(link);
  }

  getStreamLeaders() {
    const link = "dashboard/progress/leader-stream";
    return this.getRequest<MystatStudentInfo[]>(link);
  }

  getGroupLeaders() {
    const link = "dashboard/progress/leader-group";
    return this.getRequest<MystatStudentInfo[]>(link);
  }

  getActivity() {
    const link = "dashboard/progress/activity";
    return this.getRequest<MystatActivityEntry[]>(link);
  }

  getActivityLog() {
    const link = "dashboard/progress/activity-web";
    return this.getRequest<MystatActivityLog[]>(link);
  }

  getProfileInfo() {
    const link = "settings/user-info";
    return this.getRequest<MystatProfileInfo>(link);
  }

  getUserSettings() {
    const link = "profile/operations/settings";
    return this.getRequest<MystatProfileSettings>(link);
  }

  getGroupInfo() {
    const link = "homework/settings/group-history";
    return this.getRequest<MystatGroupInfo[]>(link);
  }

  getHomeworkCount() {
    const link = "count/homework";
    return this.getRequest<MystatHomeworkCount[]>(link);
  }
}

export default MystatAPI;
