const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');

const forecastItemsContainer = document.querySelector('.forecast-items-container');

const apiKey = 'd56b993eb5d1591ba753d3b52285a10c';

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
    }
});

async function getFetchData(endPoint, city, apiKey) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('City not found');
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    return 'clouds.svg';
}

function getCurrentDate() {
    const currentDate = new Date();
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    return currentDate.toLocaleDateString('en-GB', options);
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city, apiKey);

    if (!weatherData || weatherData.cod != 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    const { name: country, main: { temp, humidity }, weather: [{ id, main }], wind: { speed } } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = `${Math.round(temp)}°C`;
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = `${humidity}%`;
    windValueTxt.textContent = `${speed} M/s`;
    currentDateTxt.textContent = getCurrentDate();
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    await updateForecastsInfo(city);
    showDisplaySection(weatherInfoSection);
}

async function updateForecastsInfo(city) {
    const forecastData = await getFetchData('forecast', city, apiKey);
    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];
    // doc object model
    forecastItemsContainer.innerHTML = '';
    forecastData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastItems(forecastWeather);
        }
    });
}

function updateForecastItems(weatherData) {
    const { dt_txt: date, weather: [{ id }], main: { temp } } = weatherData;
    const weatherIcon = getWeatherIcon(id);

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${date.split(' ')[0]}</h5>
            <img src="assets/weather/${weatherIcon}" class="forecast-item-img" alt="Forecast Icon">
            <h5 class="forecast-item-temp">${temp.toFixed(1)}°C</h5>
        </div>
    `;
    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(sec => sec.style.display = 'none');
    section.style.display = 'flex';
}
