'use strict';

const fetch = require("node-fetch");

async function getMonthSchedule(userData, date = new Date()) {
  const link = `https://msapi.itstep.org/api/v2/schedule/operations/get-month?date_filter=${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

  const parameter = await createFetchParameter(userData);

  return await getResponse(link, parameter, userData);
}

async function getScheduleByDate(userData, date = new Date()) {
  const link = `https://msapi.itstep.org/api/v2/schedule/operations/get-by-date?date_filter=${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

  const parameter = await createFetchParameter(userData);

  return await getResponseParametrized(link, parameter, userData, 200, date);
}

async function getReviews(userData) {
  const link = "https://msapi.itstep.org/api/v2/reviews/index/list";

  const parameter = await createFetchParameter(userData);

  return await getResponse(link, parameter, userData);
}

async function getVisits(userData) {
  const link = "https://msapi.itstep.org/api/v2/progress/operations/student-visits";

  const parameter = await createFetchParameter(userData);

  return await getResponse(link, parameter, userData);
}

async function getAttendance(userData) {
  const link = "https://msapi.itstep.org/api/v2/dashboard/chart/attendance";

  const parameter = await createFetchParameter(userData);

  return await getResponse(link, parameter, userData);
}

async function getHomeworkList(userData, homeworkStatus = 3, page = 1, type = 0) {
  // Homework status:
  // 0 - overdue homeworks
  // 1 - checked homeworks
  // 2 - uploaded homeworks
  // 3 - active homeworks
  // 5 - deleted by teacher homeworks

  // Homework type:
  // 0 - homework
  // 1 - lab

  const profileInfo = await loadProfileInfo(userData);

  const link = `https://msapi.itstep.org/api/v2/homework/operations/list?page=${page}&status=${homeworkStatus}&type=${type}&group_id=${profileInfo.current_group_id}`;

  const parameter = await createFetchParameter(userData);

  return await getResponseParametrized(link, parameter, userData, 200, homeworkStatus, page);
}

async function getNews(userData) {
  const link = "https://msapi.itstep.org/api/v2/news/operations/latest-news";

  const parameter = await createFetchParameter(userData);

  return await getResponse(link, parameter, userData);
}

async function getNewsDetails(userData, newsId) {
  const link = `https://msapi.itstep.org/api/v2/news/operations/detail-news?news_id=${newsId}`;

  const parameter = await createFetchParameter(userData);

  return await getResponse(link, parameter, userData);
}

async function getExams(userData) {
  const link = "https://msapi.itstep.org/api/v2/progress/operations/student-exams";

  const parameter = await createFetchParameter(userData);

  return await getResponse(link, parameter, userData);
}

async function getFutureExams(userData) {
  const link = "https://msapi.itstep.org/api/v2/dashboard/info/future-exams";

  const parameter = await createFetchParameter(userData);

  return await getResponse(link, parameter, userData);
}

async function getStreamLeaders(userData) {
  const link = "https://msapi.itstep.org/api/v2/dashboard/progress/leader-stream";

  const parameter = await createFetchParameter(userData);

  return await getResponse(link, parameter, userData);
}

async function getGroupLeaders(userData) {
  const link = "https://msapi.itstep.org/api/v2/dashboard/progress/leader-group";

  const parameter = await createFetchParameter(userData);

  return await getResponse(link, parameter, userData);
}

async function getActivity(userData) {
  const link = "https://msapi.itstep.org/api/v2/dashboard/progress/activity";

  const parameter = await createFetchParameter(userData);

  return await getResponse(link, parameter, userData);
}

async function loadProfileInfo(userData) {
  const link = "https://msapi.itstep.org/api/v2/settings/user-info";

  const parameter = await createFetchParameter(userData);

  return await getResponse(link, parameter, userData);
}

async function getProfileInfo(userData) {
  return await loadProfileInfo(userData);
}

async function getUserSettings(userData) {
  const link = "https://msapi.itstep.org/api/v2/profile/operations/settings";

  const parameter = await createFetchParameter(userData);

  return await getResponse(link, parameter, userData);
}

async function createFetchParameter(userData, method = "GET", body = null, language = "ru_RU, ru") {
  return {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": language,
      "authorization": `Bearer ${await updateAccessToken(userData)}`,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    "body": body,
    "method": method,
    "mode": "cors"
  };
}

async function getResponse(fetchLink, fetchParameters, userData, correctStatusCode = 200) {
  const response = await fetch(fetchLink, fetchParameters);

  if (response.status !== correctStatusCode) {
    return await checkAccessToken(response, fetchLink, fetchParameters, correctStatusCode, userData, getResponse);
  }

  const responseText = await response.text();

  const toReturn = await JSON.parse(responseText);

  return toReturn;
}

async function getResponseParametrized(fetchLink, fetchParameters, userData, correctStatusCode, ...params) {
  const response = await fetch(fetchLink, fetchParameters);

  if (response.status !== correctStatusCode) {
    return await checkAccessTokenParametrized(response, fetchLink, fetchParameters, correctStatusCode, userData, getResponseParametrized, ...params);
  }

  const responseText = await response.text();

  const toReturn = await JSON.parse(responseText);

  return toReturn;
}

async function checkAccessToken(response, fetchLink, fetchParameters, correctStatusCode, userData, callback) {
  if (response.status === 401) {
    try {
      accessToken = await updateAccessToken(userData);
    } catch (error) {
      throw 'Invalid login credentials';
    }

    fetchParameters.headers.authorization = `Bearer ${await updateAccessToken(userData)}`;

    const result = await callback(fetchLink, fetchParameters, correctStatusCode);

    return result;
  }
}

async function checkAccessTokenParametrized(response, fetchLink, fetchParameters, correctStatusCode, userData, callback, ...params) {
  if (response.status === 401) {
    try {
      accessToken = await updateAccessToken(userData);
    } catch (error) {
      throw 'Invalid login credentials';
    }

    fetchParameters.headers.authorization = `Bearer ${await updateAccessToken(userData)}`;

    const result = await callback(fetchLink, fetchParameters, correctStatusCode, ...params);

    return result;
  }
}

async function updateAccessToken({ username, password }) {
  const profile = await login(username, password);

  const accessToken = profile.access_token;

  return accessToken;
}

async function login(username, password) {
  const link = "https://msapi.itstep.org/api/v2/auth/login";

  const body = `{\"application_key\":\"6a56a5df2667e65aab73ce76d1dd737f7d1faef9c52e8b8c55ac75f565d8e8a6\",\"id_city\":null,\"password\":\"${password}\",\"username\":\"${username}\"}`;

  const parameter = {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "ru_RU, ru",
      "authorization": "Bearer null",
      "content-type": "application/json",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    "body": body,
    "method": "POST",
    "mode": "cors"
  };

  return getResponse(link, parameter);
}

module.exports = {
  getActivity,
  getAttendance,
  getExams,
  getFutureExams,
  getGroupLeaders,
  getHomeworkList,
  getMonthSchedule,
  getNews,
  getNewsDetails,
  getReviews,
  getVisits,
  getScheduleByDate,
  getStreamLeaders,
  getUserSettings,
  getProfileInfo,
  loadProfileInfo
};
