
# Mystat API

Library for [mystat](https://mystat.itstep.org) API for both node and browser


## Installation 

Install my-project with npm

```bash 
  npm i --save mystat-api
  
  or

  yarn add mystat-api
```
    
## Usage/Examples

```javascript
import { getNews } from 'mystat-api'

const userData = {
    username: 'MY_USERNAME',
    password: 'MY_PASSWORD'
}

getNews(userData).then((result) => {
    if(result.success) {
        console.log(result.data);
    } else {
        console.log(result.error);
    }
});
```

  
## API Reference

- `authUser(username, password)` - login to account
- `getMonthSchedule(userData, date)` - get schedule for current (or specific) month
    - `date` - specific date (`Date` object)
- `getScheduleByDate(userData, date)` -  get schedule for current (or specific) day
    - `date` - specific date (`Date` object)
- `getReviews(userData)` - get user reviews
- `getVisits(userData)` - get user visits
- `getAttendance(userData)` - get user attendance
- `getHomeworkList(userData, homeworkStatus, page, type)` - get user homework or lab
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
- `getNews(userData)` - get news 
- `getNewsDetails(userData, newsId)` - get specific news info
    - `newsId` - news id
- `getExams(userData)` - get exams 
- `getFutureExams(userData)` - get future exams 
- `getStreamLeaders(userData)` - get stream leaders (of current user stream)
- `getGroupLeaders(userData)` - get group leaders (of current user group)
- `getActivity(userData)` - get user activity
- `getProfileInfo(userData)` - get current user profile info
- `getUserSettings(userData)` - get current user settings

All methods accept object as the first argument:
```js
{ username: 'myUsername', password: 'myPassword' }
```
`username` - your mystat username<br>
`password` - your mystat password


Return value: 
```js
Success:
{ data: [{ id: 1 }], error: null, success: true }

Error:
{ data: [], error: "Unauthorized", success: false }
```

`success` - response success status<br>
`data` - response from server if `success` is true<br>
`error` - error if `success` is false

  
