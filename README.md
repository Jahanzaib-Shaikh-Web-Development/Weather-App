# Weather App

A modern weather dashboard built with React and Vite, designed to provide a clean, responsive forecast experience for multiple cities. The app fetches live weather data from Open-Meteo and includes daily, hourly, and multi-location forecasting.

## Features

- Live weather data for selected cities
- Current temperature, humidity, wind speed, and pressure
- Hourly forecast for the next 24 hours
- 7-day forecast overview
- Saved locations with quick switching
- City search with geocoding support
- Light and dark mode toggle
- Celsius/Fahrenheit unit switching
- Responsive layout for desktop and mobile

## Tech Stack

- React
- Vite
- JavaScript
- Open-Meteo API
- Lucide React icons
- CSS for styling and animations

## Project Structure

```text
Weather-App/
├── index.html
├── package.json
├── package-lock.json
├── src/
│   ├── App.jsx
│   ├── animations.css
│   ├── main.jsx
│   └── styles.css
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm

### Installation

```bash
npm install
```

### Run the app locally

```bash
npm run dev
```

Then open the local URL shown in the terminal (typically `http://localhost:5173`).

### Production build

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Weather Data

This project uses the Open-Meteo API for:

- Current weather conditions
- Daily and hourly forecasts
- Geocoding city search

## Usage

1. Open the app in your browser.
2. Select a default city or search for another city.
3. View current conditions, hourly weather, and 7-day forecast.
4. Add or remove saved locations from the locations panel.
5. Switch themes and temperature units in Settings.

## Notes

- The app includes default cities in Pakistan for quick testing.
- Weather data is loaded dynamically and refreshes based on the selected city.
- The interface is intentionally polished and dashboard-style for a modern weather app experience.

## License

This project is for educational and personal use.
