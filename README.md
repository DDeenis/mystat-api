# Mystat API

Library for [mystat](https://mystat.itstep.org) API for both Node.js and browser\
Requires minimum Node.js 18.x (for Node.js)

## Installation

```bash
  npm i mystat-api

  yarn add mystat-api

  pnpm add mystat-api
```

## Usage/Examples

```js
import { createClient } from "mystat-api";

const api = await createClient({
  loginData: {
    username: "MY_USERNAME",
    password: "MY_PASSWORD",
  },
  language: "en",
});

const userInfo = await api.getUserInfo();
console.log(userInfo);
```

## API Reference

- `authUser(userData);` - login to account
- `getMonthSchedule(date)` - get schedule for current (or specific) month
  - `date` - specific date (`Date` object)
- `getScheduleByDate(date)` - get schedule for current (or specific) day
  - `date` - specific date (`Date` object)
- `getReviews()` - get user reviews
- `getVisits()` - get user visits
- `getAttendance()` - get user attendance
- `getHomeworkList(homeworkStatus, page, type)` - get user homework or lab
  - `homeworkStatus`
    - `0` - overdue homeworks
    - `1` - checked homeworks
    - `2` - uploaded homeworks
    - `3` - active homeworks
    - `5` - deleted by teacher homeworks
  - `page` - page number
  - `type`
    - `0` - homework
    - `1` - lab
- `getLatestNews()` - get news
- `getNewsDetails(, newsId)` - get specific news info
  - `newsId` - news id
- `getAllExams()` - get exams
- `getFutureExams()` - get future exams
- `getStreamLeaders()` - get stream leaders (of current user stream)
- `getGroupLeaders()` - get group leaders (of current user group)
- `getActivity()` - get user activity
- `getProfileInfo()` - get current user profile info
- `getUserSettings()` - get current user settings
- `uploadHomework({homeworkId, answerText, file, spentTimeHour, spentTimeMin})` - upload file or comment for specified homework or lab
- `deleteHomework(homeworkId)` - delete uploaded homework
