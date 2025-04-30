import "./App.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 기본 마커 아이콘 설정 (마커 안 보일 때 해결용)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [dateTime, setDateTime] = useState({ time: "", date: "" });
  const [isDaytime, setIsDaytime] = useState(true);
  const [coords, setCoords] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false); // 카드 flip 상태

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
      setIsDaytime(hour >= 6 && hour < 18);
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
      setCoords({ lat, lon });
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

  const handleCardFlip = () => {
    setIsFlipped((prevState) => !prevState); // 카드 flip 상태 변경
  };

  return (
    <div className={`container ${isDaytime ? "daytime" : "nighttime"}`}>
      <div className={`card ${isFlipped ? "flipped" : ""}`}>
        {/* 날씨 정보 (앞면) */}
        {!isFlipped && (
          <div className="card-front">
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
                  온도: {weatherData.temp} °C / 위치: {weatherData.place} /
                  날씨: {weatherData.desc}
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
            {/* 버튼: 뒤집기 */}
            <button className="flip-button" onClick={handleCardFlip}>
              위치 보기
            </button>
          </div>
        )}

        {/* 위치 정보 (뒷면) */}
        {isFlipped && (
          <div className="card-back">
            {coords && (
              <div className="map-section">
                <h2>내 위치</h2>
                <div className="map-container">
                  <MapContainer
                    center={[coords.lat, coords.lon]}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: "300px", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[coords.lat, coords.lon]}>
                      <Popup>현재 위치</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
            {/* 버튼: 뒤집기 */}
            <button className="flip-button" onClick={handleCardFlip}>
              날씨 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
