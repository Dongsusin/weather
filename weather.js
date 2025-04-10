const API_KEY = "e6d02aec03da2632c5505afa1f2670ec"; //add your API KEY
const COORDS = "coords"; //좌표를 받을 변수

//DOM객체들
const weatherInfo = document.querySelector(".weatherInfo");
const weatherIconImg = document.querySelector(".weatherIcon");

//초기화
function init() {
  askForCoords();
}

//좌표를 물어보는 함수
function askForCoords() {
  navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
}

//좌표를 얻는데 성공했을 때 쓰이는 함수
function handleSuccess(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const coordsObj = {
    latitude,
    longitude,
  };
  getWeather(latitude, longitude); //얻은 좌표값을 바탕으로 날씨정보를 불러온다.
}
//좌표를 얻는데 실패했을 때 쓰이는 함수
function handleError() {
  console.log("can't not access to location");
}

//날씨 api를 통해 날씨에 관련된 정보들을 받아온다.
function getWeather(lat, lon) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      //온도, 위치, 날씨묘사, 날씨아이콘을 받는다.
      const temperature = json.main.temp;
      const place = json.name;
      const weatherDescription = json.weather[0].description;
      const weatherIcon = json.weather[0].icon;
      const weatherIconAdrs = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

      //받아온 정보들을 표현한다.
      weatherInfo.innerText = `${temperature} °C / @${place} / ${weatherDescription}`;
      weatherIconImg.setAttribute("src", weatherIconAdrs);
    })
    .catch((error) => console.log("error:", error));
}
function setClock() {
  var dateInfo = new Date();
  var hour = modifyNumber(dateInfo.getHours());
  var min = modifyNumber(dateInfo.getMinutes());
  var sec = modifyNumber(dateInfo.getSeconds());
  var year = dateInfo.getFullYear();
  var month = dateInfo.getMonth() + 1;
  var date = dateInfo.getDate();
  document.getElementById("time").innerHTML =
    "현재시간" + hour + ":" + min + ":" + sec;
  document.getElementById("date").innerHTML =
    year + "년 " + month + "월 " + date + "일";
}
function modifyNumber(time) {
  if (parseInt(time) < 10) {
    return "0" + time;
  } else return time;
}
window.onload = function () {
  setClock();
  setInterval(setClock, 1000);
};

init();
