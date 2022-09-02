import {
  MystatHomeworkStatus,
  MystatHomeworkType,
  MystatResponse,
  MystatUserData,
} from "./types.js";
import { fetch } from "cross-fetch";

const createSuccessResult = (data: unknown): MystatResponse => {
  return { data, error: null, success: true };
};

const createErrorResult = (errorMessage?: string | null): MystatResponse => {
  return {
    data: [],
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
    this.baseLanguage = language || "ru_RU";
  }

  setUserData(userData: MystatUserData) {
    this.userData = userData;
  }

  setLanguage(language: string) {
    this.baseLanguage = language;
  }

  async _updateAccessToken() {
    const updateTokenResult = await this.getAccessToken();

    const accessToken =
      typeof updateTokenResult == "string" ? updateTokenResult : "ERROR";

    this.accessToken = accessToken;
  }

  async _createConfig() {
    if (!this.accessToken) {
      await this._updateAccessToken();
    }

    return {
      "accept-language": this.baseLanguage,
      authorization: `Bearer ${this.accessToken}`,
    };
  }

  async postRequest(
    link: string,
    body?: unknown,
    retryOnUnauthorized = true
  ): Promise<MystatResponse> {
    let data: MystatResponse | null = null;
    const reqConfig = await this._createConfig();
    const isFormData = body instanceof URLSearchParams;
    const reqBody = body ? (isFormData ? body : JSON.stringify(body)) : null;

    const response = await fetch(this._baseUrl + link, {
      headers: {
        accept: "application/json",
        ...reqConfig,
      },
      body: reqBody,
      method: "POST",
    }).then((r) => r.json());

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

  async getRequest(
    link: string,
    retryOnUnauthorized = true
  ): Promise<MystatResponse> {
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

  async getAccessToken(): Promise<string | MystatResponse> {
    const response = await this.authUser(this.userData);
    let data = null;

    if (response.success) {
      data = response.data.access_token;
    } else {
      data = createErrorResult(response.error);
    }

    return data;
  }

  async authUser(userData?: MystatUserData): Promise<MystatResponse> {
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

    return this.getRequest(link);
  }

  getScheduleByDate(date = new Date()) {
    const link = `schedule/operations/get-by-date?date_filter=${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;
    return this.getRequest(link);
  }

  getReviews() {
    const link = "reviews/index/list";
    return this.getRequest(link);
  }

  getVisits() {
    const link = "progress/operations/student-visits";
    return this.getRequest(link);
  }

  getAttendance() {
    const link = "dashboard/chart/attendance";
    return this.getRequest(link);
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

    return this.getRequest(link);
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

    return this.postRequest(link, formData);
  }

  deleteHomework(homeworkId: number) {
    const link = "homework/operations/delete";
    const body = {
      id: homeworkId,
    };
    return this.postRequest(link, body);
  }

  getNews() {
    const link = "news/operations/latest-news";
    return this.getRequest(link);
  }

  getNewsDetails(newsId: number) {
    const link = `news/operations/detail-news?news_id=${newsId}`;
    return this.getRequest(link);
  }

  getExams() {
    const link = "progress/operations/student-exams";
    return this.getRequest(link);
  }

  getFutureExams() {
    const link = "dashboard/info/future-exams";
    return this.getRequest(link);
  }

  getStreamLeaders() {
    const link = "dashboard/progress/leader-stream";
    return this.getRequest(link);
  }

  getGroupLeaders() {
    const link = "dashboard/progress/leader-group";
    return this.getRequest(link);
  }

  getActivity() {
    const link = "dashboard/progress/activity";
    return this.getRequest(link);
  }

  getProfileInfo() {
    const link = "settings/user-info";
    return this.getRequest(link);
  }

  getUserSettings() {
    const link = "profile/operations/settings";
    return this.getRequest(link);
  }
}

export default MystatAPI;
