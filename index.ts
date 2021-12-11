"use strict";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import {
  MystatHomeworkStatus,
  MystatHomeworkType,
  MystatResponse,
  MystatUserData,
} from "./types";

export class MystatAPI {
  userData: MystatUserData;
  axiosInstance: AxiosInstance;
  baseLanguage: string;

  constructor(userData: MystatUserData) {
    this.userData = userData;
    this.axiosInstance = axios.create({
      baseURL: "https://msapi.itstep.org/api/v2/",
      headers: {
        accept: "application/json, text/plain, */*",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    });
    this.baseLanguage = "ru_RU, ru";
  }

  setUserData(userData: MystatUserData) {
    this.userData = userData;
  }

  setLanguage(lang: string) {
    this.baseLanguage = lang;
  }

  async _createConfig(): Promise<AxiosRequestConfig> {
    const updateTokenResult = await this.updateAccessToken();
    const accessToken =
      typeof updateTokenResult == "string" ? updateTokenResult : "ERROR";

    return {
      headers: {
        "accept-language": this.baseLanguage,
        authorization: `Bearer ${accessToken}`,
      },
    };
  }

  createSuccessResult(data: any): MystatResponse {
    return { data, error: null, success: true };
  }

  createErrorResult(errorMessage?: string | null): MystatResponse {
    return {
      data: [],
      error: errorMessage || "Unknown error",
      success: false,
    };
  }

  async getResponse(
    link: string,
    config?: AxiosRequestConfig
  ): Promise<MystatResponse> {
    let data = null;
    const reqConfig = config || (await this._createConfig());

    try {
      const response = await this.axiosInstance.get(link, reqConfig);
      data = this.createSuccessResult(response.data);
    } catch (error) {
      data = this.createErrorResult((error as AxiosError).response?.statusText);
    }

    return data;
  }

  async updateAccessToken(): Promise<string | MystatResponse> {
    const response = await this.authUser(this.userData);
    let data = null;

    if (response.success) {
      data = response.data && response.data.access_token;
    } else {
      data = this.createErrorResult(response.error);
    }

    return data;
  }

  async authUser(userData: MystatUserData) {
    const { username, password } = userData;
    const body = {
      application_key:
        "6a56a5df2667e65aab73ce76d1dd737f7d1faef9c52e8b8c55ac75f565d8e8a6",
      id_city: null,
      password: password,
      username: username,
    };

    let data = null;

    try {
      const response = await this.axiosInstance.post("auth/login", body);
      data = this.createSuccessResult(response.data);
    } catch (error) {
      data = this.createErrorResult((error as AxiosError).response?.statusText);
    }

    return data;
  }

  async getMonthSchedule(date = new Date()) {
    const link = `schedule/operations/get-month?date_filter=${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    return await this.getResponse(link);
  }

  async getScheduleByDate(date = new Date()) {
    const link = `schedule/operations/get-by-date?date_filter=${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    return await this.getResponse(link);
  }

  async getReviews() {
    const link = "reviews/index/list";

    return await this.getResponse(link);
  }

  async getVisits() {
    const link = "progress/operations/student-visits";

    return await this.getResponse(link);
  }

  async getAttendance() {
    const link = "dashboard/chart/attendance";

    return await this.getResponse(link);
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

    return await this.getResponse(link);
  }

  async getNews() {
    const link = "news/operations/latest-news";

    return await this.getResponse(link);
  }

  async getNewsDetails(newsId: string | number) {
    const link = `news/operations/detail-news?news_id=${newsId}`;

    return await this.getResponse(link);
  }

  async getExams() {
    const link = "progress/operations/student-exams";

    return await this.getResponse(link);
  }

  async getFutureExams() {
    const link = "dashboard/info/future-exams";

    return await this.getResponse(link);
  }

  async getStreamLeaders() {
    const link = "dashboard/progress/leader-stream";

    return await this.getResponse(link);
  }

  async getGroupLeaders() {
    const link = "dashboard/progress/leader-group";

    return await this.getResponse(link);
  }

  async getActivity() {
    const link = "dashboard/progress/activity";

    return await this.getResponse(link);
  }

  async getProfileInfo() {
    const link = "settings/user-info";

    return await this.getResponse(link);
  }

  async getUserSettings() {
    const link = "profile/operations/settings";

    return await this.getResponse(link);
  }
}
