import {
  MystatHomeworkStatus,
  MystatHomeworkType,
  MystatResponse,
  MystatUserData,
} from "./types.js";
import { fetch } from "cross-fetch";

class MystatAPI {
  userData?: MystatUserData;
  baseLanguage: string;
  accessToken?: string;
  _baseUrl = "https://msapi.itstep.org/api/v2/";

  constructor(userData?: MystatUserData, language?: string) {
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
      const updateTokenResult = await this.getAccessToken();
      const accessToken =
        typeof updateTokenResult == "string" ? updateTokenResult : "ERROR";
      this.accessToken = accessToken;
    }

    return {
      "accept-language": this.baseLanguage,
      authorization: `Bearer ${this.accessToken}`,
    };
  }

  createSuccessResult(data: unknown): MystatResponse {
    return { data, error: null, success: true };
  }

  createErrorResult(errorMessage?: string | null): MystatResponse {
    return {
      data: [],
      error: errorMessage || "Unknown error",
      success: false,
    };
  }

  async makeRequest(
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
      return this.makeRequest(link, false);
    } else if (response.code !== 0) {
      data = this.createSuccessResult(response);
    } else {
      data = this.createErrorResult(response.message);
    }

    return data;
  }

  async getAccessToken(): Promise<string | MystatResponse> {
    const response = await this.authUser(this.userData);
    let data = null;

    if (response.success) {
      data = response.data.access_token;
    } else {
      data = this.createErrorResult(response.error);
    }

    return data;
  }

  async authUser(userData?: MystatUserData): Promise<MystatResponse> {
    if (!userData) throw new Error("No user was provided");

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
      data = this.createErrorResult(response.message);
    } else {
      data = this.createSuccessResult(response);
    }

    return data;
  }

  async getMonthSchedule(date = new Date()) {
    const link = `schedule/operations/get-month?date_filter=${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    return await this.makeRequest(link);
  }

  async getScheduleByDate(date = new Date()) {
    const link = `schedule/operations/get-by-date?date_filter=${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;
    return await this.makeRequest(link);
  }

  async getReviews() {
    const link = "reviews/index/list";
    return await this.makeRequest(link);
  }

  async getVisits() {
    const link = "progress/operations/student-visits";
    return await this.makeRequest(link);
  }

  async getAttendance() {
    const link = "dashboard/chart/attendance";
    return await this.makeRequest(link);
  }

  async getHomeworkList(
    homeworkStatus?: MystatHomeworkStatus,
    page?: number,
    type?: MystatHomeworkType
  ) {
    const profileInfo = (await this.getProfileInfo()).data;

    const link = `homework/operations/list?page=${page || 1}&status=${
      homeworkStatus || MystatHomeworkStatus.Active
    }&type=${type || MystatHomeworkType.Homework}&group_id=${
      profileInfo.current_group_id
    }`;

    return await this.makeRequest(link);
  }

  async getNews() {
    const link = "news/operations/latest-news";
    return await this.makeRequest(link);
  }

  async getNewsDetails(newsId: string | number) {
    const link = `news/operations/detail-news?news_id=${newsId}`;
    return await this.makeRequest(link);
  }

  async getExams() {
    const link = "progress/operations/student-exams";
    return await this.makeRequest(link);
  }

  async getFutureExams() {
    const link = "dashboard/info/future-exams";
    return await this.makeRequest(link);
  }

  async getStreamLeaders() {
    const link = "dashboard/progress/leader-stream";
    return await this.makeRequest(link);
  }

  async getGroupLeaders() {
    const link = "dashboard/progress/leader-group";
    return await this.makeRequest(link);
  }

  async getActivity() {
    const link = "dashboard/progress/activity";
    return await this.makeRequest(link);
  }

  async getProfileInfo() {
    const link = "settings/user-info";
    return await this.makeRequest(link);
  }

  async getUserSettings() {
    const link = "profile/operations/settings";
    return await this.makeRequest(link);
  }
}

export default MystatAPI;
