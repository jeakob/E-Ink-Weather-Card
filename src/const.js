const cardinalDirectionsIcon = [
  'arrow-down', 'arrow-bottom-left', 'arrow-left',
  'arrow-top-left', 'arrow-up', 'arrow-top-right',
  'arrow-right', 'arrow-bottom-right', 'arrow-down'
];

const weatherIcons = {
  'clear-night': 'hass:weather-night',
  'cloudy': 'hass:weather-cloudy',
  'exceptional': 'mdi:alert-circle-outline',
  'fog': 'hass:weather-fog',
  'hail': 'hass:weather-hail',
  'lightning': 'hass:weather-lightning',
  'lightning-rainy': 'hass:weather-lightning-rainy',
  'partlycloudy': 'hass:weather-partly-cloudy',
  'pouring': 'hass:weather-pouring',
  'rainy': 'hass:weather-rainy',
  'snowy': 'hass:weather-snowy',
  'snowy-rainy': 'hass:weather-snowy-rainy',
  'sunny': 'hass:weather-sunny',
  'windy': 'hass:weather-windy',
  'windy-variant': 'hass:weather-windy-variant'
};

const weatherIconsDay = {
  'clear-night': 'clear-night',
  'cloudy': 'cloudy',
  'exceptional': 'exceptional',
  'fog': 'fog',
  'hail': 'hail',
  'lightning': 'lightning',
  'lightning-rainy': 'lightning-rain',
  'partlycloudy': 'partlycloudy-day',
  'pouring': 'pouring',
  'rainy': 'rain',
  'snowy': 'snow',
  'snowy-rainy': 'sleet',
  'sunny': 'clear-day',
  'windy': 'wind',
  'windy-variant': 'wind',
};

const weatherIconsNight = {
  ...weatherIconsDay,
  'sunny': 'clear-night',
  'partlycloudy': 'partlycloudy-night',
};

// Icon name map for InkyPi icons (OpenWeatherMap code filenames, PNG format)
// https://github.com/fatihak/InkyPi
const weatherIconsInkyPiDay = {
  'clear-night':    '01n',
  'cloudy':         '04d',
  'exceptional':    '11d',
  'fog':            '48d',
  'hail':           '13d',
  'lightning':      '11d',
  'lightning-rainy':'11d',
  'partlycloudy':   '02d',
  'pouring':        '10d',
  'rainy':          '09d',
  'snowy':          '13d',
  'snowy-rainy':    '13d',
  'sunny':          '01d',
  'windy':          '04d',
  'windy-variant':  '04d',
};

const weatherIconsInkyPiNight = {
  ...weatherIconsInkyPiDay,
  'sunny':       '01n',
  'clear-night': '01n',
  'partlycloudy':'02n',
  'rainy':       '10n',
  'pouring':     '10n',
};

const WeatherEntityFeature = {
  FORECAST_DAILY: 1,
  FORECAST_HOURLY: 2,
  FORECAST_TWICE_DAILY: 4,
};

export {
  cardinalDirectionsIcon,
  weatherIcons,
  weatherIconsDay,
  weatherIconsNight,
  weatherIconsInkyPiDay,
  weatherIconsInkyPiNight,
  WeatherEntityFeature
};
