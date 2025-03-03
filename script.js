const apiKey = "d102ce6f8a7f8c61a416505fdeb98697";

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');

const url = (city) => `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

async function getWeatherByLocation(city) {
    try {
        const resp = await fetch(url(city), { origin: "cors" });
        const respData = await resp.json();

        if (resp.ok) {
            const uvResp = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${respData.coord.lat}&lon=${respData.coord.lon}&appid=${apiKey}`);
            const uvData = await uvResp.json();
            const weatherData = { ...respData, uvIndex: uvData.value };
            localStorage.setItem('weatherData', JSON.stringify(weatherData)); // Save weather data to localStorage
            addWeatherToPage(weatherData);
            localStorage.setItem('lastCity', city); // Save the city to localStorage
        } else {
            main.innerHTML = `<p>Cidade não encontrada. Por favor, tente novamente.</p>`;
        }
    } catch (error) {
        main.innerHTML = `<p>Erro ao buscar dados. Por favor, tente novamente mais tarde.</p>`;
    }
}

function addWeatherToPage(data) {
    const temp = Ktoc(data.main.temp);
    const feelsLike = Ktoc(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = (data.wind.speed * 3.6).toFixed(2);
    const windDirection = getWindDirection(data.wind.deg);
    const description = translateDescription(data.weather[0].main);
    const uvIndex = data.uvIndex;

    const weather = document.createElement('div');
    weather.classList.add('weather');

    weather.innerHTML = `
        <div class="weather-info">
            <h2 class="temperature">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" />
                ${temp}°C
            </h2>
            <p class="description">${description}</p>
            <p class="feels-like">Sensação Térmica: ${feelsLike}°C</p>
            <p class="humidity">Umidade: ${humidity}%</p>
            <p class="uv-index">Índice UV: ${uvIndex}</p>
            <p class="wind">Vento: ${windSpeed} km/h ${windDirection}</p>
        </div>
    `;

    // cleanup
    main.innerHTML = "";
    main.appendChild(weather);
}

document.addEventListener('DOMContentLoaded', () => {
    const weatherData = localStorage.getItem('weatherData');
    if (weatherData) {
        addWeatherToPage(JSON.parse(weatherData));
    } else {
        const lastCity = localStorage.getItem('lastCity');
        if (lastCity) {
            getWeatherByLocation(lastCity);
        } else {
            main.innerHTML = ""; // Ensure main is empty if no city is saved
        }
    }
});

function translateDescription(description) {
    const translations = {
        "Clear": "Céu Limpo",
        "Clouds": "Nublado",
        "Rain": "Chuva",
        "Drizzle": "Garoa",
        "Thunderstorm": "Trovoada",
        "Snow": "Neve",
        "Mist": "Névoa",
        "Smoke": "Fumaça",
        "Haze": "Neblina",
        "Dust": "Poeira",
        "Fog": "Nevoeiro",
        "Sand": "Areia",
        "Ash": "Cinzas",
        "Squall": "Rajada",
        "Tornado": "Tornado"
    };
    return translations[description] || description;
}

function getWindDirection(degree) {
    const directions = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO']; // Translated directions
    const index = Math.round(degree / 45) % 8;
    return directions[index];
}

function Ktoc(K) {
    return Math.floor(K - 273.15);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const city = search.value;

    if (city) {
        getWeatherByLocation(city);
    }
});
