import React, { useEffect, useMemo, useState } from "react";
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
  Moon,
  Search,
  Home,
  Clock3,
  CalendarDays,
  MapPin,
  Settings as SettingsIcon,
  Wind,
  Droplets,
  Gauge,
  Plus,
  ArrowLeft,
  ArrowUpRight,
  Menu,
  X,
  ChevronDown,
  RefreshCw,
  Bell,
  Thermometer,
  Navigation,
  Trash2,
  Check,
  CloudFog,
} from "lucide-react";

const DEFAULT_CITIES = [
  { name: "Karachi", country: "Pakistan", lat: 24.8607, lon: 67.0011 },
  { name: "Lahore", country: "Pakistan", lat: 31.5204, lon: 74.3587 },
  { name: "Islamabad", country: "Pakistan", lat: 33.6844, lon: 73.0479 },
  { name: "Peshawar", country: "Pakistan", lat: 34.0151, lon: 71.5249 },
  { name: "Quetta", country: "Pakistan", lat: 30.1798, lon: 66.975 },
  { name: "Multan", country: "Pakistan", lat: 30.1575, lon: 71.5249 },
];
const nav = [
  ["Home", Home],
  ["Hourly", Clock3],
  ["7 Days", CalendarDays],
  ["Locations", MapPin],
  ["Settings", SettingsIcon],
];
const weatherIcon = (code, size = 22) => {
  if (code === 0) return <Sun size={size} className="sun" />;
  if ([1, 2].includes(code)) return <CloudSun size={size} className="sun" />;
  if (code === 3) return <Cloud size={size} />;
  if ([45, 48].includes(code)) return <CloudFog size={size} />;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
    return <CloudRain size={size} />;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <Snowflake size={size} />;
  if ([95, 96, 99].includes(code)) return <CloudLightning size={size} />;
  return <CloudDrizzle size={size} />;
};
const describe = (c) =>
  ({
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Heavy Drizzle",
    61: "Light Rain",
    63: "Rainy",
    65: "Heavy Rain",
    71: "Light Snow",
    73: "Snowy",
    75: "Heavy Snow",
    80: "Rain Showers",
    81: "Rain Showers",
    82: "Heavy Showers",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Thunderstorm",
  })[c] || "Partly Cloudy";
const fmtTime = (t) => new Date(t).toLocaleTimeString([], { hour: "numeric" });
const fmtDay = (t) =>
  new Date(t + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
function App() {
  const [city, setCity] = useState(DEFAULT_CITIES[0]),
    [page, setPage] = useState("Home"),
    [weather, setWeather] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [results, setResults] = useState([]),
    [saved, setSaved] = useState(DEFAULT_CITIES),
    [unit, setUnit] = useState("C"),
    [dark, setDark] = useState(false),
    [alerts, setAlerts] = useState(true),
    [daily, setDaily] = useState(true),
    [mobileNav, setMobileNav] = useState(false),
    [showSearch, setShowSearch] = useState(false),
    [cityInput, setCityInput] = useState("");
  const temp = (n) => Math.round(unit === "C" ? n : (n * 9) / 5 + 32);
  const fetchWeather = async (c) => {
    setLoading(true);
    setError("");
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=7`;
      const r = await fetch(url);
      if (!r.ok)
        throw new Error("Weather service is unavailable. Please try again.");
      setWeather(await r.json());
    } catch (e) {
      setError(e.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchWeather(city);
  }, [city]);
  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      try {
        const r = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`,
        );
        const d = await r.json();
        setResults(
          (d.results || []).map((x) => ({
            name: x.name,
            country: x.country || "",
            lat: x.latitude,
            lon: x.longitude,
            admin: x.admin1 || "",
          })),
        );
      } catch {
        setResults([]);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);
  const current = weather?.current,
    hourly = weather?.hourly,
    dailyData = weather?.daily;
  const isRainy = [
    51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99,
  ].includes(current?.weather_code);
  const nowIndex = hourly
    ? Math.max(
        0,
        hourly.time.findIndex((t) => t >= current.time),
      )
    : 0;
  const selectCity = (c) => {
    setCity(c);
    setPage("Home");
    setQuery("");
    setResults([]);
    setShowSearch(false);
    setMobileNav(false);
  };
  const addCity = (c) => {
    setSaved((s) =>
      s.some((x) => x.name === c.name && x.lat === c.lat) ? s : [...s, c],
    );
    selectCity(c);
  };
  const searchBox = (
    <div className="search-wrap">
      <Search size={16} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search city..."
      />
      {query && (
        <button
          className="icon-btn"
          onClick={() => {
            setQuery("");
            setResults([]);
          }}
        >
          <X size={15} />
        </button>
      )}
      {results.length > 0 && (
        <div className="search-results">
          {results.map((r, i) => (
            <button key={r.name + i} onClick={() => addCity(r)}>
              <MapPin size={16} />
              <span>
                <b>{r.name}</b>
                <small>
                  {r.admin ? `${r.admin}, ` : ""}
                  {r.country}
                </small>
              </span>
              <ArrowUpRight size={15} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
  const sidebar = (
    <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
      <div className="brand-mini">
        <CloudSun size={25} />
        <b>Weather</b>
        <button className="mobile-close" onClick={() => setMobileNav(false)}>
          <X />
        </button>
      </div>
      <nav>
        {nav.map(([name, Icon]) => (
          <button
            key={name}
            className={page === name ? "active" : ""}
            onClick={() => {
              setPage(name);
              setMobileNav(false);
            }}
          >
            <Icon size={17} />
            {name}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="mountain">⌁</div>
        <b>
          Better Weather
          <br />
          Better Day
        </b>
      </div>
    </aside>
  );
  const hero = (
    <section className={`hero ${isRainy ? "rainy" : ""}`}>
      <div className="hero-copy">
        <span className="eyebrow">
          <MapPin size={13} />
          {city.name}, {city.country}
        </span>
        <h2>{describe(current?.weather_code ?? 2)}</h2>
        <div className="big-temp">
          {current ? temp(current.temperature_2m) : "--"}
          <span>°{unit}</span>
        </div>
        <p>
          Feels like {current ? temp(current.apparent_temperature) : "--"}°
          {unit}
        </p>
      </div>
      <div className="hero-weather">
        {weatherIcon(current?.weather_code ?? 2, 76)}
      </div>
      <div className="hero-stats">
        <div>
          <Droplets />
          <span>
            <small>Humidity</small>
            <b>{current?.relative_humidity_2m ?? "--"}%</b>
          </span>
        </div>
        <div>
          <Wind />
          <span>
            <small>Wind</small>
            <b>{Math.round(current?.wind_speed_10m ?? 0)} km/h</b>
          </span>
        </div>
        <div>
          <Gauge />
          <span>
            <small>Pressure</small>
            <b>{Math.round(current?.surface_pressure ?? 0)} hPa</b>
          </span>
        </div>
      </div>
    </section>
  );
  const hourlyStrip = (count = 8) => (
    <div className="hour-strip">
      {Array.from({ length: count }, (_, i) => {
        let idx = Math.min((nowIndex || 0) + i, hourly?.time?.length - 1 || 0);
        let time = hourly?.time?.[idx];
        return (
          <div className="hour-item" key={i}>
            <small>
              {i === 0 ? "Now" : time ? fmtTime(time) : `${i + 9}:00`}
            </small>
            {weatherIcon(hourly?.weather_code?.[idx] ?? 1, 21)}
            <b>{hourly ? temp(hourly.temperature_2m[idx]) + "°" : "--"}</b>
            <span>{hourly?.precipitation_probability?.[idx] ?? 0}%</span>
          </div>
        );
      })}
    </div>
  );
  const homePage = (
    <>
      {hero}
      <section className="panel">
        <div className="section-head">
          <div>
            <h3>Today's Forecast</h3>
            <p>Weather outlook for the next hours</p>
          </div>
          <button className="text-btn" onClick={() => setPage("Hourly")}>
            See hourly <ArrowUpRight size={15} />
          </button>
        </div>
        {hourlyStrip(8)}
      </section>
      <section className="panel">
        <div className="section-head">
          <div>
            <h3>7-Day Forecast</h3>
            <p>Plan ahead with the weekly outlook</p>
          </div>
          <button className="text-btn" onClick={() => setPage("7 Days")}>
            Full forecast <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="week-mini">
          {dailyData?.time?.slice(0, 4).map((d, i) => (
            <div key={d}>
              <span>
                {i === 0
                  ? "Today"
                  : new Date(d + "T12:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
              </span>
              {weatherIcon(dailyData.weather_code[i], 23)}
              <b>{temp(dailyData.temperature_2m_max[i])}°</b>
              <small>{temp(dailyData.temperature_2m_min[i])}°</small>
            </div>
          ))}
        </div>
      </section>
    </>
  );
  const hourlyPage = (
    <>
      {hero}
      <section className="panel">
        <div className="section-head">
          <div>
            <h3>Hourly Forecast</h3>
            <p>Temperature and conditions by hour</p>
          </div>
          <span className="live-tag">Next 24 hours</span>
        </div>
        <div className="hourly-grid">
          {Array.from({ length: 24 }, (_, i) => {
            let idx = Math.min(nowIndex + i, hourly?.time?.length - 1 || 0);
            return (
              <div className="hour-card" key={i}>
                <small>
                  {i === 0
                    ? "Now"
                    : hourly?.time[idx]
                      ? fmtTime(hourly.time[idx])
                      : "--"}
                </small>
                {weatherIcon(hourly?.weather_code[idx] ?? 1, 24)}
                <b>{hourly ? temp(hourly.temperature_2m[idx]) + "°" : "--"}</b>
                <span>
                  <Droplets size={12} />
                  {hourly?.precipitation_probability[idx] ?? 0}%
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
  const sevenPage = (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>7 Days Forecast</h2>
          <p>A full week of weather in {city.name}</p>
        </div>
        {weatherIcon(current?.weather_code ?? 2, 36)}
      </div>
      <div className="forecast-table">
        <div className="forecast-row table-label">
          <span>Day</span>
          <span>Weather</span>
          <span>High / Low</span>
          <span>UV Index</span>
          <span>Sunrise</span>
        </div>
        {dailyData?.time?.map((d, i) => (
          <div className="forecast-row" key={d}>
            <b>{i === 0 ? "Today" : fmtDay(d)}</b>
            <span className="condition">
              {weatherIcon(dailyData.weather_code[i], 22)}{" "}
              {describe(dailyData.weather_code[i])}
            </span>
            <strong>
              {temp(dailyData.temperature_2m_max[i])}°{" "}
              <small>{temp(dailyData.temperature_2m_min[i])}°</small>
            </strong>
            <span>{dailyData.uv_index_max[i]}</span>
            <span>{dailyData.sunrise[i]?.slice(11, 16)}</span>
          </div>
        ))}
      </div>
    </section>
  );
  const locationsPage = (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>Your Locations</h2>
          <p>Keep an eye on weather around the world</p>
        </div>
        <button className="primary-btn" onClick={() => setPage("Add Location")}>
          <Plus size={16} /> Add Location
        </button>
      </div>
      <div className="location-grid">
        {saved.map((c, i) => (
          <article
            className={`location-card ${c.name === city.name ? "selected" : ""}`}
            key={c.name + c.lat}
          >
            <button className="location-main" onClick={() => selectCity(c)}>
              <div className="location-art">
                {weatherIcon(
                  c.name === city.name
                    ? (current?.weather_code ?? 2)
                    : [0, 2, 1, 61, 3, 0][i % 6],
                  34,
                )}
              </div>
              <div>
                <b>{c.name}</b>
                <small>{c.country}</small>
                <strong>
                  {c.name === city.name && current
                    ? temp(current.temperature_2m)
                    : [28, 27, 24, 26, 18, 32][i % 6]}
                  °{unit}
                </strong>
                <span>
                  {c.name === city.name
                    ? describe(current?.weather_code ?? 2)
                    : "View forecast"}
                </span>
              </div>
            </button>
            <button
              className="remove-city"
              title="Remove location"
              onClick={() => setSaved((s) => s.filter((x) => x !== c))}
            >
              <Trash2 size={15} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
  const settingsPage = (
    <section className="panel settings-panel">
      <h2>Settings</h2>
      <p>Make Weather work the way you like.</p>
      <div className="setting-group">
        <h3>Appearance</h3>
        <div className="choice-row">
          <button
            className={!dark ? "chosen" : ""}
            onClick={() => setDark(false)}
          >
            <Sun />
            Light Mode{!dark && <Check size={15} />}
          </button>
          <button
            className={dark ? "chosen" : ""}
            onClick={() => setDark(true)}
          >
            <Moon />
            Dark Mode{dark && <Check size={15} />}
          </button>
        </div>
      </div>
      <div className="setting-group">
        <h3>Temperature Unit</h3>
        <div className="choice-row">
          <button
            className={unit === "C" ? "chosen" : ""}
            onClick={() => setUnit("C")}
          >
            <Thermometer />
            Celsius (°C){unit === "C" && <Check size={15} />}
          </button>
          <button
            className={unit === "F" ? "chosen" : ""}
            onClick={() => setUnit("F")}
          >
            <Thermometer />
            Fahrenheit (°F){unit === "F" && <Check size={15} />}
          </button>
        </div>
      </div>
      <div className="setting-group">
        <h3>Notifications</h3>
        <div className="toggle-row">
          <span>
            <Bell />
            Weather Alerts<small>Severe weather notifications</small>
          </span>
          <button
            className={`toggle ${alerts ? "on" : ""}`}
            onClick={() => setAlerts(!alerts)}
            aria-label="Toggle weather alerts"
          >
            <i />
          </button>
        </div>
        <div className="toggle-row">
          <span>
            <CalendarDays />
            Daily Forecast<small>Get a daily weather summary</small>
          </span>
          <button
            className={`toggle ${daily ? "on" : ""}`}
            onClick={() => setDaily(!daily)}
            aria-label="Toggle daily forecast"
          >
            <i />
          </button>
        </div>
      </div>
    </section>
  );
  const addPage = (
    <section className="panel add-panel">
      <div className="section-head">
        <div>
          <h2>Add a Location</h2>
          <p>Find a city to see its latest forecast.</p>
        </div>
        <MapPin size={29} />
      </div>
      <label className="field-label">Search city or country</label>
      {searchBox}
      <h3>Popular Cities</h3>
      <div className="popular">
        {DEFAULT_CITIES.map((c) => (
          <button key={c.name} onClick={() => addCity(c)}>
            {c.name}
          </button>
        ))}
      </div>
      <div className="or-divider">or enter a city name</div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(cityInput);
          setCityInput("");
        }}
      >
        <input
          value={cityInput}
          onChange={(e) => {
            setCityInput(e.target.value);
            setQuery(e.target.value);
          }}
          placeholder="e.g. Faisalabad, London"
        />
        <button className="primary-btn" type="submit">
          <Plus size={16} /> Search City
        </button>
      </form>
    </section>
  );
  const searchPage = (
    <section className="panel">
      <h2>Search Cities</h2>
      <p>Search for a city anywhere in the world.</p>
      {searchBox}
      {results.map((r, i) => (
        <button
          className="result-line"
          key={r.name + i}
          onClick={() => selectCity(r)}
        >
          {r.name}, {r.country}
          <ArrowUpRight size={16} />
        </button>
      ))}
    </section>
  );
  return (
    <div className={`app ${dark ? "dark" : ""} ${isRainy ? "rainy" : ""}`}>
      <header className="topbar">
        <button className="menu-btn" onClick={() => setMobileNav(!mobileNav)}>
          <Menu />
        </button>
        <div className="top-brand">
          <div className="logo">
            <CloudSun size={36} />
          </div>
          <div>
            <h1>Weather</h1>
            <p>Beautiful Weather, Better Days</p>
          </div>
        </div>
        <div className="top-actions">
          <span>
            <CloudSun size={17} /> Live weather
          </span>
          <button
            onClick={() => {
              fetchWeather(city);
            }}
            title="Refresh weather"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              setPage("Search");
            }}
          >
            <Search size={17} />
          </button>
        </div>
      </header>
      {showSearch && <div className="mobile-search">{searchBox}</div>}
      <div className="layout">
        {sidebar}
        <main className="main">
          <div className="page-top">
            <div>
              <span className="breadcrumb">Weather / {page}</span>
              <h1>
                {page === "Home"
                  ? "Good day, weather watcher"
                  : page === "7 Days"
                    ? "Your weekly outlook"
                    : page === "Add Location"
                      ? "Find a new city"
                      : page}
              </h1>
              <p>
                {page === "Home"
                  ? "Here’s what the sky looks like today."
                  : `Explore weather conditions for ${city.name}.`}
              </p>
            </div>
            <button
              className="city-select"
              onClick={() => setPage("Locations")}
            >
              <MapPin size={15} />
              {city.name}
              <ChevronDown size={14} />
            </button>
          </div>
          {loading && (
            <div className="loading">
              <span className="spinner" />
              <b>Getting the latest weather...</b>
              <small>Connecting to live forecast</small>
            </div>
          )}
          {error && (
            <div className="error">
              <CloudRain size={26} />
              <b>Unable to load live weather</b>
              <p>{error}</p>
              <button
                className="primary-btn"
                onClick={() => fetchWeather(city)}
              >
                <RefreshCw size={15} /> Try again
              </button>
            </div>
          )}
          {!loading && !error && (
            <div className="content">
              {page === "Home" && homePage}
              {page === "Hourly" && hourlyPage}
              {page === "7 Days" && sevenPage}
              {page === "Locations" && locationsPage}
              {page === "Settings" && settingsPage}
              {page === "Add Location" && addPage}
              {page === "Search" && searchPage}
              {!nav.some((n) => n[0] === page) &&
                !["Add Location", "Search"].includes(page) && (
                  <section className="panel not-found">
                    <CloudRain size={54} />
                    <h2>City Not Found</h2>
                    <p>We couldn't find that page or city.</p>
                    <button
                      className="primary-btn"
                      onClick={() => setPage("Home")}
                    >
                      <Home size={15} /> Go Back Home
                    </button>
                  </section>
                )}
            </div>
          )}
          <footer>
            Weather data by Open-Meteo <span>•</span> Made for better days{" "}
            <button onClick={() => fetchWeather(city)}>
              <RefreshCw size={13} /> Update
            </button>
          </footer>
        </main>
      </div>
      {mobileNav && (
        <button
          className="scrim"
          onClick={() => setMobileNav(false)}
          aria-label="Close menu"
        />
      )}
    </div>
  );
}
export default App;
