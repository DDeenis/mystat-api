'use strict';

import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: 'https://msapi.itstep.org/api/v2/'
});

const createConfig = async (userData, body = null, language = "ru_RU, ru") => {
  return {
    headers: {
      "accept": "application/json, text/plain, */*",
      "accept-language": language,
      "authorization": `Bearer ${await updateAccessToken(userData)}`,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    body: body,
    mode: "cors"
  };
}

const getResponse = async (link, config) => (await axiosInstance.get(link, config)).data;

const updateAccessToken = async ({ username, password }) => (await authUser(username, password)).access_token;

const authUser = async (username, password) => {
  const body = {
    application_key: "6a56a5df2667e65aab73ce76d1dd737f7d1faef9c52e8b8c55ac75f565d8e8a6",
    id_city: null,
    password: password,
    username: username
  };

  return (await axiosInstance.post('auth/login', body)).data;
}

export async function getMonthSchedule(userData, date = new Date()) {
  const link = `schedule/operations/get-month?date_filter=${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const config = await createConfig(userData);

  return await getResponse(link, config);
}

export async function getScheduleByDate(userData, date = new Date()) {
  const link = `schedule/operations/get-by-date?date_filter=${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const config = await createConfig(userData);

  return await getResponse(link, config);
}

export async function getReviews(userData) {
  const link = "reviews/index/list";
  const config = await createConfig(userData);

  return await getResponse(link, config);
}

export async function getVisits(userData) {
  const link = "progress/operations/student-visits";
  const config = await createConfig(userData);

  return await getResponse(link, config);
}

export async function getAttendance(userData) {
  const link = "dashboard/chart/attendance";
  const config = await createConfig(userData);

  return await getResponse(link, config);
}

export async function getHomeworkList(userData, homeworkStatus = 3, page = 1, type = 0) {
  // Homework status:
  // 0 - overdue homeworks
  // 1 - checked homeworks
  // 2 - uploaded homeworks
  // 3 - active homeworks
  // 5 - deleted by teacher homeworks

  // Homework type:
  // 0 - homework
  // 1 - lab

  const profileInfo = await getProfileInfo(userData);

  const link = `homework/operations/list?page=${page}&status=${homeworkStatus}&type=${type}&group_id=${profileInfo.current_group_id}`;
  const config = await createConfig(userData);

  return await getResponse(link, config);
}

export async function getNews(userData) {
  const link = "https://msapi.itstep.org/api/v2/news/operations/latest-news";
  const config = await createConfig(userData);

  return await getResponse(link, config);
}

export async function getNewsDetails(userData, newsId) {
  const link = `https://msapi.itstep.org/api/v2/news/operations/detail-news?news_id=${newsId}`;
  const config = await createConfig(userData);

  return await getResponse(link, config);
}

export async function getExams(userData) {
  const link = "https://msapi.itstep.org/api/v2/progress/operations/student-exams";
  const config = await createConfig(userData);

  return await getResponse(link, config);
}

export async function getFutureExams(userData) {
  const link = "https://msapi.itstep.org/api/v2/dashboard/info/future-exams";
  const config = await createConfig(userData);

  return await getResponse(link, config);
}

export async function getStreamLeaders(userData) {
  const link = "https://msapi.itstep.org/api/v2/dashboard/progress/leader-stream";
  const config = await createConfig(userData);

  return await getResponse(link, config);
}

export async function getGroupLeaders(userData) {
  const link = "https://msapi.itstep.org/api/v2/dashboard/progress/leader-group";
  const config = await createConfig(userData);

  return await getResponse(link, config);
}

export async function getActivity(userData) {
  const link = "https://msapi.itstep.org/api/v2/dashboard/progress/activity";
  const config = await createConfig(userData);

  return await getResponse(link, config);
}

export async function getProfileInfo(userData) {
  const link = "settings/user-info";
  const config = await createConfig(userData);

  return await getResponse(link, config);
}

export async function getUserSettings(userData) {
  const link = "https://msapi.itstep.org/api/v2/profile/operations/settings";
  const config = await createConfig(userData);

  return await getResponse(link, config);
}
