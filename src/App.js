import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [dateTime, setDateTime] = useState({
    time: "",
    date: "",
  });
  const getWeatherClass = (desc) => {
    if (!desc) return "";
    if (desc.includes("맑음")) return "clear";
    if (desc.includes("구름")) return "cloudy";
    if (desc.includes("비")) return "rainy";
    if (desc.includes("눈")) return "snowy";
    if (desc.includes("안개")) return "foggy";
    return "default";
  };

  const API_KEY = "e6d02aec03da2632c5505afa1f2670ec"; // 본인 API 키

  // 시간 관련 설정
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
    };
    setClock();
    const timer = setInterval(setClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // 위치 기반 날씨 불러오기
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

  // 도시명으로 검색하는 날씨 요청
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
        });
      })
      .catch((err) => console.log("검색 실패:", err));
  };

  // 좌표로 날씨 요청
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
        });
      })
      .catch((err) => console.log("위치 기반 실패:", err));
  };

  return (
    <div className={`container ${getWeatherClass(weatherData?.desc)}`}>
      <h1>지금 날씨는</h1>

      {/* 검색 필드 */}
      <div className="search-box">
        <input
          type="text"
          value={city}
          placeholder="도시명을 입력하세요"
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={getWeatherByCity}>검색</button>
      </div>

      {/* 날씨 정보 출력 */}
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
        </>
      )}

      {/* 현재 시간 */}
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
