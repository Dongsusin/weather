import "./App.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet 기본 마커 아이콘 경로 설정 (마커가 안 보일 때 해결용)
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
  const [isFlipped, setIsFlipped] = useState(false); // 카드 앞/뒷면 상태

  const API_KEY = "e6d02aec03da2632c5505afa1f2670ec";

  // 시계 & 낮/밤 구분
  useEffect(() => {
    const setClock = () => {
      const now = new Date();
      const pad = (num) => (num < 10 ? "0" + num : num);
      const hours = now.getHours();

      setDateTime({
        time: `현재시간 ${pad(hours)}:${pad(now.getMinutes())}:${pad(
          now.getSeconds()
        )}`,
        date: `${now.getFullYear()}년 ${
          now.getMonth() + 1
        }월 ${now.getDate()}일`,
      });

      setIsDaytime(hours >= 6 && hours < 18);
    };

    setClock();
    const interval = setInterval(setClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 현재 위치 기반 날씨
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setCoords({ lat, lon });
        getWeatherByCoords(lat, lon);
      },
      () => console.log("위치 접근 실패")
    );
  }, []);

  // 도시명으로 날씨 가져오기
  const getWeatherByCity = () => {
    if (!city.trim()) return;

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=kr`
    )
      .then((res) => res.json())
      .then((data) => {
        setWeatherData({
          temp: data.main.temp,
          place: data.name,
          desc: data.weather[0].description,
          icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
        });
      })
      .catch((err) => console.log("검색 실패:", err));
  };

  // 좌표로 날씨 가져오기
  const getWeatherByCoords = (lat, lon) => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
    )
      .then((res) => res.json())
      .then((data) => {
        setWeatherData({
          temp: data.main.temp,
          place: data.name,
          desc: data.weather[0].description,
          icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
        });
      })
      .catch((err) => console.log("위치 기반 실패:", err));
  };

  // Enter 키로 검색
  const handleKeyDown = (e) => {
    if (e.key === "Enter") getWeatherByCity();
  };

  // 카드 앞/뒷면 토글
  const handleCardFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  return (
    <div className={`container ${isDaytime ? "daytime" : "nighttime"}`}>
      <div className={`card ${isFlipped ? "flipped" : ""}`}>
        {/* 앞면: 날씨 */}
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
            <div className="time">{dateTime.time}</div>
            <div className="date">{dateTime.date}</div>
            <button className="flip-button" onClick={handleCardFlip}>
              위치 보기
            </button>
          </div>
        )}

        {/* 뒷면: 지도 */}
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
                    style={{ height: "500px", width: "100%" }}
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
