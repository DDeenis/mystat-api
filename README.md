# Mystat API

Library for [mystat](https://mystat.itstep.org) API for both node and browser

## Installation

```bash
  npm i --save mystat-api

  or

  yarn add mystat-api
```

## Usage/Examples

```javascript
import MystatAPI from "mystat-api";

const userData = {
  username: "MY_USERNAME",
  password: "MY_PASSWORD",
};
const api = new MystatAPI(userData);

api.getNews().then((result) => {
  if (result.success) {
    console.log(result.data);
  } else {
    console.log(result.error);
  }
});
```

## API Reference

- `authUser(userData?)` - login to account
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
- `getNews()` - get news
- `getNewsDetails(, newsId)` - get specific news info
  - `newsId` - news id
- `getExams()` - get exams
- `getFutureExams()` - get future exams
- `getStreamLeaders()` - get stream leaders (of current user stream)
- `getGroupLeaders()` - get group leaders (of current user group)
- `getActivity()` - get user activity
- `getProfileInfo()` - get current user profile info
- `getUserSettings()` - get current user settings
- `uploadHomework(homeworkId, answerText, spentTimeHour, spentTimeMin)` - upload file or comment for specified homework or lab

Return value:

```js
Success:
{ data: [{ ... }, ...], error: null, success: true }

Error:
{ data: [], error: "Unauthorized", success: false }
```

`success` - response success status<br>
`data` - response from server if `success` is true<br>
`error` - error if `success` is false
