import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [dateTime, setDateTime] = useState({
    time: "",
    date: "",
  });
  const [isDaytime, setIsDaytime] = useState(true);
  const API_KEY = "e6d02aec03da2632c5505afa1f2670ec";
  useEffect(() => {
    const setClock = () => {
      const dateInfo = new Date();
      const modify = (num) => (num < 10 ? "0" + num : num);
      setDateTime({
        time:
          "현재시간 " +
          modify(dateInfo.getHours()) +
          ":" +
          modify(dateInfo.getMinutes()) +
          ":" +
          modify(dateInfo.getSeconds()),
        date:
          dateInfo.getFullYear() +
          "년 " +
          (dateInfo.getMonth() + 1) +
          "월 " +
          dateInfo.getDate() +
          "일",
      });
      const hour = dateInfo.getHours();
      if (hour >= 6 && hour < 18) {
        setIsDaytime(true);
      } else {
        setIsDaytime(false);
      }
    };

    setClock();
    const timer = setInterval(setClock, 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);

    function handleSuccess(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeatherByCoords(lat, lon);
    }

    function handleError() {
      console.log("위치 접근 실패");
    }
  }, []);
  const getWeatherByCity = () => {
    if (!city.trim()) return;

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=kr`
    )
      .then((res) => res.json())
      .then((json) => {
        setWeatherData({
          temp: json.main.temp,
          place: json.name,
          desc: json.weather[0].description,
          icon: `http://openweathermap.org/img/wn/${json.weather[0].icon}@2x.png`,
          humidity: json.main.humidity,
          windSpeed: json.wind.speed,
        });
      })
      .catch((err) => console.log("검색 실패:", err));
  };
  const getWeatherByCoords = (lat, lon) => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
    )
      .then((res) => res.json())
      .then((json) => {
        setWeatherData({
          temp: json.main.temp,
          place: json.name,
          desc: json.weather[0].description,
          icon: `http://openweathermap.org/img/wn/${json.weather[0].icon}@2x.png`,
          humidity: json.main.humidity,
          windSpeed: json.wind.speed,
        });
      })
      .catch((err) => console.log("위치 기반 실패:", err));
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      getWeatherByCity();
    }
  };

  return (
    <div className={`container ${isDaytime ? "daytime" : "nighttime"}`}>
      <h1>지금 날씨는</h1>
      <div className="search-box">
        <input
          type="text"
          value={city}
          placeholder="도시명을 입력하세요"
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {weatherData && (
        <>
          <span className="weatherInfo">
            온도: {weatherData.temp} °C / 위치: {weatherData.place} / 날씨:{" "}
            {weatherData.desc}
          </span>
          <img
            className="weatherIcon"
            src={weatherData.icon}
            alt="날씨 아이콘"
          />
          <div className="additional-info">
            <p>습도: {weatherData.humidity}%</p>
            <p>바람 속도: {weatherData.windSpeed} m/s</p>
          </div>
        </>
      )}
      <div id="time" className="time">
        {dateTime.time}
      </div>
      <div id="date" className="date">
        {dateTime.date}
      </div>
    </div>
  );
}

export default App;
