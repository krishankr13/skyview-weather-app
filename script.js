let currentCity = "";

// Auto location on app open
window.onload = () => {
  getWeatherByGPS();
};

// Enter key search
function handleEnter(e) {
  if (e.key === "Enter") getWeatherByCity();
}

// Dark / Light mode
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// Search by city
async function getWeatherByCity() {

  const city = cityInput.value.trim();

  if (!city) return;

  error.textContent = "Loading...";

  const geo = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
  ).then(res => res.json());

  if (!geo.results) {

    error.textContent = "City not found";

    return;
  }

  const { latitude, longitude, name, country } = geo.results[0];

  fetchWeather(latitude, longitude, name, country);
}

// GPS location
function getWeatherByGPS() {

  error.textContent = "Getting location...";

  navigator.geolocation.getCurrentPosition(pos => {

    fetchWeather(
      pos.coords.latitude,
      pos.coords.longitude,
      "Your Location",
      ""
    );

  });
}

// Fetch weather
async function fetchWeather(lat, lon, name, countryName) {

  currentCity = name;

  error.textContent = "Loading weather...";

  const res = await fetch(

`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`

  );

  const data = await res.json();

  const c = data.current;

  city.textContent = name;

  country.textContent = countryName;

  temp.textContent = Math.round(c.temperature_2m);

  wind.textContent = c.wind_speed_10m;

  humidity.textContent = c.relative_humidity_2m;

  feels.textContent = Math.round(c.apparent_temperature);

  const info = weatherInfo(c.weather_code);

  icon.textContent = info.icon;

  condition.textContent = info.text;

  // Dynamic Background
  changeBackground(info.text);

  weather.classList.remove("hidden");

  error.textContent = "";

  loadFavourites();

  // 7 Day Forecast
  showForecast(data.daily);

  // Sunrise
  sunrise.textContent =
    new Date(data.daily.sunrise[0])
    .toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

  // Sunset
  sunset.textContent =
    new Date(data.daily.sunset[0])
    .toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

  // Fake AQI
  const randomAQI =
    Math.floor(Math.random() * 200);

  aqi.textContent =
    `${randomAQI} ${
      randomAQI < 50
        ? "Good"
        : randomAQI < 100
        ? "Moderate"
        : "Poor"
    }`;
}

// Weather code
function weatherInfo(code) {

  if (code === 0)
    return { text: "Clear Sky", icon: "☀️" };

  if (code <= 3)
    return { text: "Partly Cloudy", icon: "⛅" };

  if (code <= 48)
    return { text: "Fog", icon: "🌫️" };

  if (code <= 67)
    return { text: "Rain", icon: "🌧️" };

  if (code <= 77)
    return { text: "Snow", icon: "❄️" };

  if (code >= 95)
    return { text: "Storm", icon: "⛈️" };

  return { text: "Unknown", icon: "🌡️" };
}

// Save favourite
function saveFavourite() {

  let fav = JSON.parse(localStorage.getItem("favs") || "[]");

  if (!fav.includes(currentCity)) {

    fav.push(currentCity);

    localStorage.setItem("favs", JSON.stringify(fav));
  }

  loadFavourites();
}

// Load favourites
function loadFavourites() {

  favs.innerHTML = "";

  const fav = JSON.parse(localStorage.getItem("favs") || "[]");

  fav.forEach(c => {

    const s = document.createElement("span");

    s.textContent = c;

    s.onclick = () => {

      cityInput.value = c;

      getWeatherByCity();
    };

    favs.appendChild(s);
  });
}

// 7 Day Forecast
function showForecast(daily) {

  forecast.innerHTML = "";

  for (let i = 0; i < 7; i++) {

    const div = document.createElement("div");

    const info = weatherInfo(daily.weather_code[i]);

    div.className = "forecast-card";

    div.innerHTML = `

      <p>
        ${new Date(daily.time[i]).toLocaleDateString("en-US", {
          weekday: "short"
        })}
      </p>

      <div style="font-size:30px">
        ${info.icon}
      </div>

      <p>
        ${Math.round(daily.temperature_2m_max[i])}°
        /
        ${Math.round(daily.temperature_2m_min[i])}°
      </p>

    `;

    forecast.appendChild(div);
  }
}

// Dynamic Background

function changeBackground(weather) {

  document.body.className = "";

  if (weather.includes("Clear")) {

    document.body.classList.add("sunny");

  } else if (weather.includes("Rain")) {

    document.body.classList.add("rainy");

  } else if (weather.includes("Cloud")) {

    document.body.classList.add("cloudy");

  } else if (weather.includes("Snow")) {

    document.body.classList.add("snowy");

  } else if (weather.includes("Storm")) {

    document.body.classList.add("stormy");
  }
}

// Voice Search

function startVoice() {

  const recognition =
    new webkitSpeechRecognition();

  recognition.lang = "en-US";

  recognition.start();

  recognition.onresult = (event) => {

    const text =
      event.results[0][0].transcript;

    cityInput.value = text;

    getWeatherByCity();
  };
}