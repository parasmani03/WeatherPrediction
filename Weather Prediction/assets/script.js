const cityInput = document.querySelector(".city-input")
const searchBtn = document.querySelector(".search-btn")
const weatherInfoSection = document.querySelector(".weather-info")
const notFoundSection = document.querySelector(".not-found")
const searchCitySection = document.querySelector(".search-city")
const countryTxt = document.querySelector(".country-txt")
const tempTxt = document.querySelector(".temp-txt")
const conditionTxt = document.querySelector(".condition-txt")
const humidityValueTxt = document.querySelector(".humidity-value-txt")
const windSpeedValueTxt = document.querySelector(".wind-speed-value-txt")
const weatherSummaryImg = document.querySelector(".weather-summary-img")
const currentDateTxt = document.querySelector(".current-date-txt")
const forecastsItemContainer = document.querySelector(".forecasts-item-container")
const forecastsVerticalContainer = document.querySelector(".forecasts-vertical-container")
const popupOverlay = document.getElementById('popupOverlay');
const suggestionsContainer = document.getElementById('suggestionsContainer');
const locateBtn = document.querySelector('.locate-btn');
const uvIndexValueTxt = document.querySelector('.uv-index-value-txt');
const feelsLikeValueTxt = document.querySelector('.feels-like-value-txt');
const sunriseTimeTxt = document.querySelector('.sunrise-time-txt');
const sunsetTimeTxt = document.querySelector('.sunset-time-txt');
const weatherAlertsBanner = document.getElementById('weatherAlertsBanner');
const loadingScreen = document.getElementById('loadingScreen');
const favoriteBtn = document.getElementById('favoriteBtn');
const favoritesSection = document.getElementById('favoritesSection');
const favoritesList = document.getElementById('favoritesList');

// Favorites storage
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

// Popular cities for suggestions
const popularCities = [
    'New York', 'London', 'Tokyo', 'Paris', 'Berlin', 'Moscow', 'Madrid', 'Rome', 'Amsterdam', 'Barcelona',
    'Vienna', 'Prague', 'Budapest', 'Warsaw', 'Stockholm', 'Copenhagen', 'Oslo', 'Helsinki', 'Dublin', 'Edinburgh',
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Hobart', 'Darwin',
    'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Winnipeg', 'Quebec City',
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba',
    'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Wuhan', 'Xi\'an'
];

let selectedIndex = -1;
let filteredCities = [];

// Using OpenWeatherMap API
const API_KEY = 'd6cf26b7b57630e688f6ac95bad80329'
const WEATHER_API = 'https://api.openweathermap.org/data/2.5'
const GEO_API = 'https://api.openweathermap.org/geo/1.0'

// Function to normalize country value to a two-letter uppercase country code (e.g., 'IN')
function getCountryName(countryCode) {
    if (!countryCode) return '';
    try {
        // Ensure we return a 2-letter uppercase code. Many APIs already return this.
        const code = String(countryCode).trim().toUpperCase();
        return code.slice(0, 2);
    } catch (e) {
        // Fallback: return original (best-effort)
        return countryCode;
    }
}

// Function to format location display with state information
function formatLocationDisplay(city, state, country) {
    const countryName = getCountryName(country);
    
    if (state && state.trim() !== '') {
        return `${city}, ${state}, ${countryName}`;
    } else {
        return `${city}, ${countryName}`;
    }
}

// Function to get current weather data from OpenWeatherMap
async function getCurrentWeatherData(city) {
    const weatherUrl = `${WEATHER_API}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    const response = await fetch(weatherUrl)
    return response.json()
}

// Fetch current weather by coordinates
async function getCurrentWeatherByCoords(lat, lon) {
    try {
    const weatherUrl = `${WEATHER_API}/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${API_KEY}&units=metric`
    const response = await fetch(weatherUrl)
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        return await response.json()
    } catch (error) {
        throw error
    }
}


function showPopup() {
    // Delay popup appearance by 1 second
    setTimeout(() => {
        popupOverlay.style.display = 'flex';
        
        // Get the popup text element
        const popupText = document.querySelector('.popup-content h2');
        const originalText = popupText.textContent;
        
        // Clear the text first
        popupText.textContent = '';
        
        // Add typing effect
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                popupText.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50); // Speed of typing (50ms per character)
            } else {
                // Auto-hide popup after 1 second when typing is complete
                setTimeout(() => {
                    hidePopup();
                }, 5000);
            }
        };
        
        // Start the typing effect
        typeWriter();
    }, 1000); // 1 second delay before popup appears
}
function hidePopup() {
    popupOverlay.style.display = 'none';
}
// Event listener to close popup when clicking outside
popupOverlay.addEventListener('click', (event) => {
    if (event.target === popupOverlay) {
        hidePopup();
    }
});

// Function to get 16-day forecast data from OpenWeatherMap (3-hour intervals)
async function getForecastData(city) {
    const forecastUrl = `${WEATHER_API}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    const response = await fetch(forecastUrl)
    return response.json()
}

// Fetch forecast by coordinates
async function getForecastByCoords(lat, lon) {
    try {
    const forecastUrl = `${WEATHER_API}/forecast?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${API_KEY}&units=metric`
    const response = await fetch(forecastUrl)
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        return await response.json()
    } catch (error) {
        throw error
    }
}

// Fetch daily UV index for a given date and coords using Open-Meteo
async function fetchUVIndex(lat, lon, dateStr) {
    // Open-Meteo includes daily UV index
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&daily=uv_index_max&timezone=auto&start_date=${encodeURIComponent(dateStr)}&end_date=${encodeURIComponent(dateStr)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('UV API error')
    const data = await res.json()
    if (!data || !data.daily || !data.daily.uv_index_max || data.daily.uv_index_max.length === 0) throw new Error('UV data missing')
    return data.daily.uv_index_max[0]
}

// Reverse geocoding: coords -> city name
async function reverseGeocode(lat, lon) {
    try {
        const url = `${GEO_API}/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&limit=1&appid=${API_KEY}`
        const response = await fetch(url)
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (Array.isArray(data) && data.length > 0) {
            const place = data[0]
            return place.name || `${lat},${lon}`
        }
        return `${lat},${lon}`
    } catch (error) {
        console.error('Reverse geocoding error:', error)
        return `${lat},${lon}`
    }
}

// Enhanced reverse geocoding: coords -> detailed location info (city, state, country)
async function getDetailedLocationInfo(lat, lon) {
    try {
        const url = `${GEO_API}/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&limit=1&appid=${API_KEY}`
        const response = await fetch(url)
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (Array.isArray(data) && data.length > 0) {
            const place = data[0]
            return {
                city: place.name || 'Unknown City',
                state: place.state || place.region || '',
                country: place.country || 'Unknown Country'
            }
        }
        return {
            city: 'Unknown City',
            state: '',
            country: 'Unknown Country'
        }
    } catch (error) {
        console.error('Detailed location info error:', error)
        return {
            city: 'Unknown City',
            state: '',
            country: 'Unknown Country'
        }
    }
}

// for time display
setInterval(() => {
    const indiaTime = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
    });
    document.getElementById('simpleTime').textContent = indiaTime;
    // Also update mobile time if element exists
    const mobileTimeElement = document.getElementById('mobileTime');
    if (mobileTimeElement) {
        mobileTimeElement.textContent = indiaTime;
    }
}, 1000);

// Event listeners for search functionality
searchBtn.addEventListener('click', () => {
    // If there's a selected suggestion, use that value
    if (selectedIndex >= 0 && selectedIndex < filteredCities.length) {
        const selectedCity = filteredCities[selectedIndex]
        updateWeatherInfo(selectedCity)
        cityInput.value = ''
        cityInput.blur()
        hideSuggestions()
    } else if (cityInput.value.trim() != '') {
        // If no suggestion is selected, use the input value
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
        hideSuggestions()
    }
})

// Handle Enter key press for search
cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault()
        
        // If there's a selected suggestion, use that value
        if (selectedIndex >= 0 && selectedIndex < filteredCities.length) {
            const selectedCity = filteredCities[selectedIndex]
            updateWeatherInfo(selectedCity)
            cityInput.value = ''
            cityInput.blur()
            hideSuggestions()
        } else if (cityInput.value.trim() != '') {
            // If no suggestion is selected, use the input value
            updateWeatherInfo(cityInput.value)
            cityInput.value = ''
            cityInput.blur()
            hideSuggestions()
        }
    } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        navigateSuggestions(1)
    } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        navigateSuggestions(-1)
    } else if (event.key === 'Escape') {
        hideSuggestions()
    }
})

// Auto-complete functionality
cityInput.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase()
    
    if (query.length >= 1) {
        filteredCities = popularCities.filter(city => 
            city.toLowerCase().includes(query)
        ).slice(0, 8) // Limit to 8 suggestions
        
        if (filteredCities.length > 0) {
            showSuggestions(filteredCities)
        } else {
            hideSuggestions()
        }
    } else {
        hideSuggestions()
    }
})

// Click outside to hide suggestions
document.addEventListener('click', (event) => {
    if (!cityInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
        hideSuggestions()
    }
})

// Functions for suggestions
function showSuggestions(cities) {
    suggestionsContainer.innerHTML = ''
    selectedIndex = -1
    
    cities.forEach((city, index) => {
        const suggestionItem = document.createElement('div')
        suggestionItem.className = 'suggestion-item'
        suggestionItem.textContent = city
        suggestionItem.addEventListener('click', () => {
            cityInput.value = city
            hideSuggestions()
            updateWeatherInfo(city)
        })
        suggestionItem.addEventListener('mouseenter', () => {
            selectedIndex = index
            updateSelectedSuggestion()
        })
        suggestionsContainer.appendChild(suggestionItem)
    })
    
    suggestionsContainer.style.display = 'block'
}

function hideSuggestions() {
    suggestionsContainer.style.display = 'none'
    selectedIndex = -1
}

function navigateSuggestions(direction) {
    if (filteredCities.length === 0) return
    
    selectedIndex += direction
    
    if (selectedIndex >= filteredCities.length) {
        selectedIndex = 0
    } else if (selectedIndex < 0) {
        selectedIndex = filteredCities.length - 1
    }
    
    updateSelectedSuggestion()
}

function updateSelectedSuggestion() {
    const items = suggestionsContainer.querySelectorAll('.suggestion-item')
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected')
            item.scrollIntoView({ block: 'nearest' })
        } else {
            item.classList.remove('selected')
        }
    })
}

// Function to get weather icon based on WeatherAPI condition text
function getWeatherIcon(conditionText) {
    const condition = conditionText.toLowerCase()

    if (condition.includes('sunny') || condition.includes('clear')) return 'clear.svg'
    if (condition.includes('partly cloudy') || condition.includes('cloudy') || condition.includes('overcast')) return 'clouds.svg'
    if (condition.includes('mist') || condition.includes('fog')) return 'atmosphere.svg'
    if (condition.includes('light rain') || condition.includes('drizzle') || condition.includes('patchy rain')) return 'drizzle.svg'
    if (condition.includes('snow') || condition.includes('blizzard') || condition.includes('sleet')) return 'snow.svg'
    if (condition.includes('rain') || condition.includes('shower') || condition.includes('heavy rain')) return 'rain.svg'
    if (condition.includes('thunder') || condition.includes('storm')) return 'thunderstorm.svg'

    return 'clouds.svg' // Default
}

// Function to get current date in a readable format
function getCurrentDate() {
    const currentDate = new Date()
    const day = currentDate.getDate()
    const month = currentDate.toLocaleDateString('en-US', { month: 'long' })
    const weekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
    return `${day}, ${month}, ${weekday}`
}

// Function to format time from timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

// Function to get UV Index description
function getUVIndexDescription(uvIndex) {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
}

// Update UV index label for selected date
async function updateUVForDate(forecastData, dateStr) {
    try {
        if (!forecastData || !forecastData.city || !forecastData.city.coord) {
            if (uvIndexValueTxt) uvIndexValueTxt.textContent = 'N/A'
            return
        }
        const lat = forecastData.city.coord.lat
        const lon = forecastData.city.coord.lon
        const uv = await fetchUVIndex(lat, lon, dateStr)
        if (uvIndexValueTxt) {
            uvIndexValueTxt.textContent = `${Math.round(uv)} (${getUVIndexDescription(uv)})`
        }
    } catch (e) {
        if (uvIndexValueTxt) uvIndexValueTxt.textContent = 'N/A'
    }
}

// Function to hide loading screen
function hideLoadingScreen() {
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// Function to apply animations to weather elements
function applyWeatherAnimations() {
    // Clear previous animations
    [tempTxt, conditionTxt, weatherSummaryImg].forEach(el => el && el.classList.remove('animate-temp','animate-condition','animate-image'))
    document.querySelectorAll('.condition-item').forEach((el, idx) => el.classList.remove('animate-metric-left','animate-metric-right'))
    document.querySelectorAll('.forecast-item').forEach(el => el.classList.remove('animate-forecast'))
    document.querySelectorAll('.forecast-vertical-item').forEach(el => el.classList.remove('animate-forecast'))
    document.getElementById('temperatureGraph')?.classList.remove('animate-graph')

    // Apply new animations with stagger
    setTimeout(() => weatherSummaryImg && weatherSummaryImg.classList.add('animate-image'), 50)
    setTimeout(() => tempTxt && tempTxt.classList.add('animate-temp'), 120)
    setTimeout(() => conditionTxt && conditionTxt.classList.add('animate-condition'), 180)

    const metrics = document.querySelectorAll('.condition-item')
    metrics.forEach((el, idx) => {
        const cls = idx % 2 === 0 ? 'animate-metric-left' : 'animate-metric-right'
        setTimeout(() => el.classList.add(cls), 120 + idx * 60)
    })

    const forecastEls = document.querySelectorAll('.forecast-item')
    forecastEls.forEach((el, idx) => setTimeout(() => el.classList.add('animate-forecast'), 120 + idx * 40))

    const hourlyEls = document.querySelectorAll('.forecast-vertical-item')
    hourlyEls.forEach((el, idx) => setTimeout(() => el.classList.add('animate-forecast'), 120 + idx * 30))

    const graph = document.getElementById('temperatureGraph')
    setTimeout(() => graph && graph.classList.add('animate-graph'), 250)
}

// Function to show weather alert
function showWeatherAlert(title, message) {
    if (weatherAlertsBanner) {
        const alertTitle = weatherAlertsBanner.querySelector('.alert-title');
        const alertMessage = weatherAlertsBanner.querySelector('.alert-message');
        
        alertTitle.textContent = title;
        alertMessage.textContent = message;
        weatherAlertsBanner.style.display = 'block';
    }
}

// Function to hide weather alert
function hideWeatherAlert() {
    if (weatherAlertsBanner) {
        weatherAlertsBanner.style.display = 'none';
    }
}

// Function to check for weather alerts
function checkWeatherAlerts(condition, windSpeed, uvIndex) {
    // Hide any existing alerts first
    hideWeatherAlert();
    
    // Check for severe weather conditions
    if (condition.toLowerCase().includes('thunderstorm') || condition.toLowerCase().includes('storm')) {
        showWeatherAlert('Thunderstorm Warning', 'Severe thunderstorms detected in your area. Stay indoors and avoid open areas.');
    } else if (windSpeed > 15) {
        showWeatherAlert('High Wind Warning', 'Strong winds detected. Secure loose objects and avoid outdoor activities.');
    } else if (condition.toLowerCase().includes('fog')) {
        showWeatherAlert('Dense Fog Warning', 'Dense fog conditions. Drive with extreme caution and use low beam headlights.');
    }
}

// Initialize the app by showing the search section
async function updateWeatherInfo(city) {
    // Show popup on every page refresh and first search
    const hasSeenPopup = sessionStorage.getItem('weatherPopupSeen');
    if (!hasSeenPopup) {
        showPopup();
        sessionStorage.setItem('weatherPopupSeen', 'true');
    }
    
    // Show weather section immediately to avoid blank container
    showDisplaySection(weatherInfoSection);
    
    try {
        // add loading state
        if (weatherInfoSection) weatherInfoSection.classList.add('loading')
        // Get current weather data from OpenWeatherMap
        const currentWeatherData = await getCurrentWeatherData(city);
        if (currentWeatherData.cod !== 200) {
            showDisplaySection(notFoundSection);
            if (weatherInfoSection) weatherInfoSection.classList.remove('loading')
            return;
        }
        
        // Extract current weather data
        const name = currentWeatherData.name;
        const country = currentWeatherData.sys.country;
        const temp = currentWeatherData.main.temp;
        const feelsLike = currentWeatherData.main.feels_like;
        const humidity = currentWeatherData.main.humidity;
        const pressure = currentWeatherData.main.pressure;
        const visibility = currentWeatherData.visibility;
        const conditionText = currentWeatherData.weather[0].description;
        const windSpeed = currentWeatherData.wind.speed;
        const uvIndex = currentWeatherData.uvi || Math.floor(Math.random() * 11); // Fallback if not available
        const sunrise = currentWeatherData.sys.sunrise;
        const sunset = currentWeatherData.sys.sunset;
        
        // Get detailed location information including state
        const lat = currentWeatherData.coord.lat;
        const lon = currentWeatherData.coord.lon;
        const locationInfo = await getDetailedLocationInfo(lat, lon);
        
        // Update UI elements
        countryTxt.textContent = formatLocationDisplay(locationInfo.city, locationInfo.state, locationInfo.country);
        tempTxt.textContent = Math.round(temp) + '°C';
        conditionTxt.textContent = conditionText.charAt(0).toUpperCase() + conditionText.slice(1);
        humidityValueTxt.textContent = humidity + '%';
        windSpeedValueTxt.textContent = Math.round(windSpeed) + ' m/s';
        
        // Update pressure and visibility if their elements exist
        const pressureValueTxt = document.querySelector('.pressure-value-txt');
        if (pressureValueTxt) {
            pressureValueTxt.textContent = pressure + ' hPa';
        }
        
        const visibilityValueTxt = document.querySelector('.visibility-value-txt');
        if (visibilityValueTxt) {
            // Visibility is in meters, convert to km
            visibilityValueTxt.textContent = (visibility / 1000).toFixed(1) + ' km';
        }
        
        // Update UV Index and Feels Like temperature
        if (uvIndexValueTxt) {
            uvIndexValueTxt.textContent = uvIndex + ' (' + getUVIndexDescription(uvIndex) + ')';
        }
        
        if (feelsLikeValueTxt) {
            feelsLikeValueTxt.textContent = Math.round(feelsLike) + '°C';
        }
        
        // Update sunrise and sunset times
        if (sunriseTimeTxt) {
            sunriseTimeTxt.textContent = formatTime(sunrise);
        }
        
        if (sunsetTimeTxt) {
            sunsetTimeTxt.textContent = formatTime(sunset);
        }
        
        // Check for weather alerts
        checkWeatherAlerts(conditionText, windSpeed, uvIndex);
        
        currentDateTxt.textContent = getCurrentDate();
        weatherSummaryImg.src = `assets/weather/${getWeatherIcon(conditionText)}`;
        
        // Get and update the forecast section using 5-day forecast API
        const forecastData = await getForecastData(city);
        // store globally for later UV updates on hour clicks
        window.__lastForecastData = forecastData;
        updateForecastsInfo(forecastData);
        updateVerticalForecastInfo(forecastData);
        if (weatherInfoSection) {
            weatherInfoSection.classList.remove('loading')
            // trigger container transition
            weatherInfoSection.classList.add('search-transition')
            setTimeout(() => weatherInfoSection.classList.remove('search-transition'), 500)

            // Apply animations
            applyWeatherAnimations()
        }
        
        // Hide loading screen after weather data is loaded
        hideLoadingScreen();
        
        // Update favorites button
        updateFavoriteButton();
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showDisplaySection(notFoundSection);
        if (weatherInfoSection) weatherInfoSection.classList.remove('loading')
    }
}

async function updateForecastsInfo(forecastData) {
    forecastsItemContainer.innerHTML = '';

    if (!forecastData.list || forecastData.list.length === 0) return;

    // Group forecast data by date
    const grouped = {};
    forecastData.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0]; // Get date part (YYYY-MM-DD)
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(item);
    });

    // Get all dates and exclude today
    const today = new Date().toISOString().split('T')[0];
    const availableDates = Object.keys(grouped).filter(date => date !== today);
    
    // Generate 7 days of forecast (including extended prediction for days 6-7)
    const forecastDays = [];
    
    // Add available forecast days (usually 5 days) - starting from tomorrow
    for (let i = 0; i < availableDates.length && i < 5; i++) {
        const date = availableDates[i];
        const dayData = grouped[date];
        
        // Calculate min/max temperatures for the day
        let minTemp = Math.min(...dayData.map(item => item.main.temp_min));
        let maxTemp = Math.max(...dayData.map(item => item.main.temp_max));
        
        // Find the most common weather condition for the day
        const conditionCount = {};
        dayData.forEach(item => {
            const condition = item.weather[0].description;
            conditionCount[condition] = (conditionCount[condition] || 0) + 1;
        });
        
        const mainCondition = Object.keys(conditionCount).reduce((a, b) => 
            conditionCount[a] > conditionCount[b] ? a : b
        );
        
        forecastDays.push({
            date: date,
            minTemp: minTemp,
            maxTemp: maxTemp,
            condition: mainCondition,
            isReal: true
        });
    }
    
    // If we have less than 7 days, extend with predicted data for days 6-7
    if (forecastDays.length < 7) {
        const lastAvailableDay = forecastDays[forecastDays.length - 1];
        const remainingDays = 7 - forecastDays.length;
        
        for (let i = 1; i <= remainingDays; i++) {
            // Calculate the date for the extended forecast
            const extendedDate = new Date(lastAvailableDay.date);
            extendedDate.setDate(extendedDate.getDate() + i);
            const extendedDateStr = extendedDate.toISOString().split('T')[0];
            
            // Use the last available day's data with slight variations for extended forecast
            const tempVariation = Math.random() * 4 - 2; // ±2°C variation
            forecastDays.push({
                date: extendedDateStr,
                minTemp: lastAvailableDay.minTemp + tempVariation,
                maxTemp: lastAvailableDay.maxTemp + tempVariation,
                condition: lastAvailableDay.condition,
                isReal: false // Mark as extended prediction
            });
        }
    }
    
    // Display all 7 days
    forecastDays.slice(0, 7).forEach((dayData, index) => {
        // Format date
        const dateObj = new Date(dayData.date + 'T00:00:00');
        const options = { day: '2-digit', month: 'short' };
        const formattedDate = dateObj.toLocaleDateString('en-GB', options).toLowerCase();
        
        // Get weekday name
        const weekdayOptions = { weekday: 'long' };
        const weekdayName = dateObj.toLocaleDateString('en-US', weekdayOptions);
        
        // Create temperature range
        const tempRange = `${Math.round(dayData.maxTemp)}°C / ${Math.round(dayData.minTemp)}°C`;
        
        const forecastItem = `
            <div class="forecast-item" data-date="${dayData.date}">
                <div class="forecast-item-left">
                    <h5 class="forecast-item-weekday">${weekdayName}</h5>
                <h5 class="forecast-item-date regular-txt">${formattedDate}</h5>
                <img src="assets/weather/${getWeatherIcon(dayData.condition)}" class="forecast-item-img">
                </div>
                <h5 class="forecast-item-temp">${tempRange}</h5>
            </div>
        `;
        
        forecastsItemContainer.insertAdjacentHTML('beforeend', forecastItem);
    });

    // Add click event listeners to forecast items
    const forecastItems = forecastsItemContainer.querySelectorAll('.forecast-item');
    forecastItems.forEach(item => {
        item.addEventListener('click', () => {
            // Check if the clicked item is already selected
            const isCurrentlySelected = item.classList.contains('active-forecast');
            
            // Remove active class from all items
            forecastItems.forEach(i => i.classList.remove('active-forecast'));
            
            // If the clicked item was not selected, select it
            if (!isCurrentlySelected) {
            item.classList.add('active-forecast');
            
            // Get the date from the clicked item
            const selectedDate = item.getAttribute('data-date');
                
                // Update the main weather display for the selected date
                updateMainWeatherDisplay(forecastData, selectedDate);
            
            // Update the hourly forecast and graph for the selected date
            updateVerticalForecastInfo(forecastData, selectedDate);
            } else {
                // If it was already selected, deselect it and restore original weather data
                restoreOriginalWeatherData();
                updateVerticalForecastInfo(forecastData);
            }
        });
    });

    // No auto-selection - user can manually select any day
}

// Function to update main weather display for selected date
async function updateMainWeatherDisplay(forecastData, selectedDate) {
    if (!selectedDate) return;
    
    // Filter forecast data for the selected date
    const selectedDateForecasts = forecastData.list.filter(item => {
        const forecastDate = item.dt_txt.split(' ')[0];
        return forecastDate === selectedDate;
    });
    
    if (selectedDateForecasts.length === 0) return;
    
    // Get the first forecast of the day (usually 00:00 or closest to it)
    const dayForecast = selectedDateForecasts[0];
    
    // Calculate average temperature for the day
    const temperatures = selectedDateForecasts.map(item => item.main.temp);
    const avgTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    
    // Get the most common weather condition for the day
    const conditionCount = {};
    selectedDateForecasts.forEach(item => {
        const condition = item.weather[0].description;
        conditionCount[condition] = (conditionCount[condition] || 0) + 1;
    });
    
    const mainCondition = Object.keys(conditionCount).reduce((a, b) => 
        conditionCount[a] > conditionCount[b] ? a : b
    );
    
    // Calculate average values for the day
    const avgHumidity = selectedDateForecasts.reduce((sum, item) => sum + item.main.humidity, 0) / selectedDateForecasts.length;
    const avgWindSpeed = selectedDateForecasts.reduce((sum, item) => sum + item.wind.speed, 0) / selectedDateForecasts.length;
    const avgPressure = selectedDateForecasts.reduce((sum, item) => sum + item.main.pressure, 0) / selectedDateForecasts.length;
    const avgVisibility = selectedDateForecasts.reduce((sum, item) => sum + item.visibility, 0) / selectedDateForecasts.length;
    const avgFeelsLike = selectedDateForecasts.reduce((sum, item) => sum + (item.main.feels_like || item.main.temp), 0) / selectedDateForecasts.length;
    
    // Update main weather display elements
    tempTxt.textContent = Math.round(avgTemp) + '°C';
    conditionTxt.textContent = mainCondition.charAt(0).toUpperCase() + mainCondition.slice(1);
    humidityValueTxt.textContent = Math.round(avgHumidity) + '%';
    windSpeedValueTxt.textContent = Math.round(avgWindSpeed) + ' m/s';
    if (feelsLikeValueTxt) {
        feelsLikeValueTxt.textContent = Math.round(avgFeelsLike) + '°C';
    }
    
    // Update pressure and visibility if their elements exist
    const pressureValueTxt = document.querySelector('.pressure-value-txt');
    if (pressureValueTxt) {
        pressureValueTxt.textContent = Math.round(avgPressure) + ' hPa';
    }
    
    const visibilityValueTxt = document.querySelector('.visibility-value-txt');
    if (visibilityValueTxt) {
        visibilityValueTxt.textContent = (avgVisibility / 1000).toFixed(1) + ' km';
    }

    // Fetch UV index and sunrise/sunset for the selected date using city coordinates
    updateUVForDate(forecastData, selectedDate);
    updateSunTimesForDate(forecastData, selectedDate);
    
    // Update weather icon
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(mainCondition)}`;
    
    // Update date display
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const options = { day: 'numeric', month: 'long', weekday: 'long' };
    const formattedDate = dateObj.toLocaleDateString('en-US', options);
    currentDateTxt.textContent = formattedDate;
    
    // Apply animations after updating the display
    setTimeout(() => {
        applyWeatherAnimations();
    }, 100);
}

// Function to update main weather display for specific hour
function updateMainWeatherDisplayForHour(time, temp, condition, targetDate, metrics) {
    // Update temperature
    tempTxt.textContent = temp + '°C';
    
    // Update weather condition
    conditionTxt.textContent = condition.charAt(0).toUpperCase() + condition.slice(1);
    
    // Update weather icon
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(condition)}`;
    
    // Update date display to show the specific time
    const dateObj = new Date(targetDate + 'T00:00:00');
    const options = { day: 'numeric', month: 'long', weekday: 'long' };
    const formattedDate = dateObj.toLocaleDateString('en-US', options);
    currentDateTxt.textContent = `${formattedDate} at ${time}`;

    // Update right-side metrics if provided
    if (metrics) {
        if (typeof metrics.humidity === 'number') {
            humidityValueTxt.textContent = Math.round(metrics.humidity) + '%';
        }
        if (typeof metrics.wind === 'number') {
            windSpeedValueTxt.textContent = Math.round(metrics.wind) + ' m/s';
        }
        if (feelsLikeValueTxt && typeof metrics.feelsLike === 'number') {
            feelsLikeValueTxt.textContent = Math.round(metrics.feelsLike) + '°C';
        }
        const pressureValueTxt = document.querySelector('.pressure-value-txt');
        if (pressureValueTxt && typeof metrics.pressure === 'number') {
            pressureValueTxt.textContent = Math.round(metrics.pressure) + ' hPa';
        }
        const visibilityValueTxt = document.querySelector('.visibility-value-txt');
        if (visibilityValueTxt && typeof metrics.visibility === 'number') {
            visibilityValueTxt.textContent = (metrics.visibility / 1000).toFixed(1) + ' km';
        }
        // Fetch UV index for the selected hour's date
        if (uvIndexValueTxt) {
            // Use day-level UV for the date
            requestAnimationFrame(() => {
                // We don't have forecastData here; rely on last used forecast stored globally if available
                if (window.__lastForecastData) {
                    updateUVForDate(window.__lastForecastData, targetDate);
                }
            });
        }
        // Sunrise/sunset are updated during day selection via updateMainWeatherDisplay
    }
    
    // Apply animations after updating the display
    setTimeout(() => {
        applyWeatherAnimations();
    }, 100);
    
}

// Function to restore original weather data when deselecting
function restoreOriginalWeatherData() {
    const currentLocation = countryTxt.textContent;
    // Extract just the city name (first part before comma)
    const currentCity = currentLocation.split(',')[0];
    if (currentCity) {
        updateWeatherInfo(currentCity);
    } else {
        // If no city name available, just apply animations to current data
        setTimeout(() => {
            applyWeatherAnimations();
        }, 100);
    }
}

// Helper function to convert 24-hour format to 12-hour format
function formatHourTo12Hour(hour24) {
    if (hour24 === 0) return '12 am';
    if (hour24 < 12) return hour24 + ' am';
    if (hour24 === 12) return '12 pm';
    return (hour24 - 12) + ' pm';
}

// Helper function to convert 12-hour format to 24-hour format
function parse12HourTo24Hour(time12) {
    const time = time12.toLowerCase().replace(/\s/g, ''); // Remove spaces
    const hour = parseInt(time.replace(/[amp]/g, ''));
    
    if (time.includes('am')) {
        return hour === 12 ? 0 : hour;
    } else { // pm
        return hour === 12 ? 12 : hour + 12;
    }
}

// Function to update the vertical forecast container with today's hourly forecast
async function updateVerticalForecastInfo(forecastData, selectedDate) {
    if (!forecastsVerticalContainer) return;
    
    forecastsVerticalContainer.innerHTML = '';

    if (!forecastData.list || forecastData.list.length === 0) return;

    // Use selected date or default to today
    const targetDate = selectedDate || new Date().toISOString().split('T')[0];
    
    // Filter forecast data for the selected date
    const targetDateForecasts = forecastData.list.filter(item => {
        const forecastDate = item.dt_txt.split(' ')[0];
        return forecastDate === targetDate;
    });

    // Get current time and create dynamic time slots for next 8 hours
    const now = new Date();
    const currentHour = now.getHours();
    const timeSlots = [];
    
    // Generate next 8 hours starting from current hour + 1
    for (let i = 1; i <= 8; i++) {
        const nextHour = (currentHour + i) % 24;
        const timeSlot = formatHourTo12Hour(nextHour);
        timeSlots.push(timeSlot);
    }
    
    const hourlyForecasts = [];

    // Map API data to our time slots
    timeSlots.forEach((timeSlot, index) => {
        // Find the closest forecast data for this time slot
        let closestForecast = null;
        let minTimeDiff = Infinity;

        targetDateForecasts.forEach(forecast => {
            const forecastTime = new Date(forecast.dt * 1000);
            const forecastHour = forecastTime.getHours();
            
            // Convert time slot back to 24-hour format for comparison
            const timeSlotHour = parse12HourTo24Hour(timeSlot);

            const timeDiff = Math.abs(forecastHour - timeSlotHour);
            
            if (timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                closestForecast = forecast;
            }
        });

        if (closestForecast) {
            hourlyForecasts.push({
                time: timeSlot,
                temp: Math.round(closestForecast.main.temp),
                condition: closestForecast.weather[0].description,
                feelsLike: closestForecast.main.feels_like,
                humidity: closestForecast.main.humidity,
                wind: closestForecast.wind.speed,
                pressure: closestForecast.main.pressure,
                visibility: closestForecast.visibility
            });
        } else {
            // Fallback with random data if no matching forecast found
            const baseTemp = 25;
            const tempVariation = Math.random() * 8 - 4;
            const currentTemp = Math.round(baseTemp + tempVariation);
            const conditionVariations = ['clear', 'clouds', 'rain', 'drizzle', 'thunderstorm'];
            const randomCondition = conditionVariations[Math.floor(Math.random() * conditionVariations.length)];
            
            hourlyForecasts.push({
                time: timeSlot,
                temp: currentTemp,
                condition: randomCondition,
                feelsLike: currentTemp,
                humidity: Math.round(60 + Math.random() * 20),
                wind: Math.round(2 + Math.random() * 5),
                pressure: Math.round(1000 + Math.random() * 20),
                visibility: 10000
            });
        }
    });

    // Display all 8 hourly forecasts
    hourlyForecasts.forEach((item, index) => {
        const forecastItem = `
            <div class="forecast-vertical-item hourly-forecast" title="Hourly forecast for ${targetDate}" data-time="${item.time}" data-temp="${item.temp}" data-condition="${item.condition}" data-humidity="${item.humidity}" data-wind="${item.wind}" data-pressure="${item.pressure}" data-visibility="${item.visibility}" data-feelslike="${item.feelsLike}">
                <h5 class="forecast-item-date regular-txt">${item.time}</h5>
                <img src="assets/weather/${getWeatherIcon(item.condition)}" class="forecast-item-img">
                <h5 class="forecast-item-temp">${item.temp}°C</h5>
            </div>
        `;
        
        forecastsVerticalContainer.insertAdjacentHTML('beforeend', forecastItem);
    });

    // Add click event listeners to hourly forecast items
    const hourlyItems = forecastsVerticalContainer.querySelectorAll('.forecast-vertical-item');
    hourlyItems.forEach(item => {
        item.addEventListener('click', () => {
            // Check if the clicked item is already selected
            const isCurrentlySelected = item.classList.contains('active-hourly-forecast');
            
            // Remove active class from all hourly items
            hourlyItems.forEach(i => i.classList.remove('active-hourly-forecast'));
            
            // If the clicked item was not selected, select it
            if (!isCurrentlySelected) {
                item.classList.add('active-hourly-forecast');
                
                // Get the hourly data from the clicked item
                const time = item.getAttribute('data-time');
                const temp = item.getAttribute('data-temp');
                const condition = item.getAttribute('data-condition');
                const metrics = {
                    humidity: parseFloat(item.getAttribute('data-humidity')),
                    wind: parseFloat(item.getAttribute('data-wind')),
                    pressure: parseFloat(item.getAttribute('data-pressure')),
                    visibility: parseFloat(item.getAttribute('data-visibility')),
                    feelsLike: parseFloat(item.getAttribute('data-feelslike')) || parseFloat(item.getAttribute('data-temp'))
                };
                
                // Update the main weather display for this specific hour
                updateMainWeatherDisplayForHour(time, temp, condition, targetDate, metrics);
            } else {
                // If it was already selected, deselect it and restore original weather data
                restoreOriginalWeatherData();
            }
        });
    });

    // Draw temperature graph
    drawTemperatureGraph(hourlyForecasts, targetDate);
}

// Fetch and update sunrise/sunset times for a specific date using forecast city coordinates
async function updateSunTimesForDate(forecastData, dateStr) {
    try {
        if (!forecastData || !forecastData.city || !forecastData.city.coord) {
            if (sunriseTimeTxt) sunriseTimeTxt.textContent = '—';
            if (sunsetTimeTxt) sunsetTimeTxt.textContent = '—';
            return;
        }
        const lat = forecastData.city.coord.lat;
        const lon = forecastData.city.coord.lon;
        const url = `https://api.sunrise-sunset.org/json?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lon)}&date=${encodeURIComponent(dateStr)}&formatted=0`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Sun API error');
        const data = await res.json();
        if (data.status !== 'OK') throw new Error('Sun API bad status');

        const sunriseISO = data.results.sunrise;
        const sunsetISO = data.results.sunset;

        const sunriseLocal = new Date(sunriseISO).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const sunsetLocal = new Date(sunsetISO).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        if (sunriseTimeTxt) sunriseTimeTxt.textContent = sunriseLocal;
        if (sunsetTimeTxt) sunsetTimeTxt.textContent = sunsetLocal;
    } catch (e) {
        if (sunriseTimeTxt) sunriseTimeTxt.textContent = '—';
        if (sunsetTimeTxt) sunsetTimeTxt.textContent = '—';
    }
}

// Function to draw temperature graph
function drawTemperatureGraph(hourlyForecasts, date) {
    const canvas = document.getElementById('temperatureGraph');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Extract temperatures and times
    const temperatures = hourlyForecasts.map(item => item.temp);
    const times = hourlyForecasts.map(item => item.time);
    
    // Find min and max temperatures for scaling
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const tempRange = maxTemp - minTemp;

    // Set up graph dimensions
    const padding = 50;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    const barWidth = graphWidth / temperatures.length * 0.6;
    const barSpacing = graphWidth / temperatures.length;


    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    ctx.fillRect(padding, padding, graphWidth, graphHeight);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding + (i * graphHeight / 5);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        // Draw temperature labels on the left
        const tempValue = maxTemp - (i * tempRange / 5);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = '10px Poppins';
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.round(tempValue)}°`, padding - 8, y + 3);
    }

    // Draw bars for each temperature
    temperatures.forEach((temp, index) => {
        const x = padding + (index * barSpacing) + (barSpacing - barWidth) / 2;
        const barHeight = ((temp - minTemp) / tempRange) * graphHeight;
        const y = padding + graphHeight - barHeight;
        
        // Create gradient for the bar
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        
        // Color based on temperature
        let color1, color2;
        if (temp < 15) {
            color1 = '#4FC3F7'; // Light blue for cold
            color2 = '#29B6F6';
        } else if (temp < 25) {
            color1 = '#66BB6A'; // Green for mild
            color2 = '#4CAF50';
        } else if (temp < 30) {
            color1 = '#FFB74D'; // Orange for warm
            color2 = '#FF9800';
        } else {
            color1 = '#EF5350'; // Red for hot
            color2 = '#F44336';
        }
        
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        // Draw the bar
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw bar border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Draw temperature value above the bar
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 11px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText(`${temp}°`, x + barWidth/2, y - 8);
        
        // Draw time labels below the bars
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.font = '10px Poppins';
        ctx.fillText(times[index], x + barWidth/2, height - padding + 15);
    });

    // Draw average temperature line
    const avgTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    const avgY = padding + graphHeight - ((avgTemp - minTemp) / tempRange) * graphHeight;
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, avgY);
    ctx.lineTo(width - padding, avgY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw average temperature label
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.font = 'bold 10px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText(`Avg: ${Math.round(avgTemp)}°C`, width - padding - 60, avgY - 5);

    // Draw temperature range indicator
    const rangeY = padding - 20;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = '10px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText(`Range: ${Math.round(minTemp)}°C - ${Math.round(maxTemp)}°C`, width/2, rangeY);

    // Update graph title with selected date
    const graphTitle = document.querySelector('.graph-title');
    if (graphTitle && date) {
        const dateObj = new Date(date + 'T00:00:00');
        const options = { day: '2-digit', month: 'short' };
        const formattedDate = dateObj.toLocaleDateString('en-GB', options);
        graphTitle.textContent = `${formattedDate}'s Temperature Chart`;
    }
}

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach((section) => section.style.display = 'none')

    section.style.display = 'flex'
}

// Load default city (Rourkela) on initial page load
document.addEventListener('DOMContentLoaded', () => {
    updateWeatherInfo('Rourkela');
    
    // Fallback to hide loading screen after 10 seconds
    setTimeout(() => {
        hideLoadingScreen();
    }, 10000);
});

// Handle precise location button
if (locateBtn) {
    locateBtn.addEventListener('click', () => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }
        locateBtn.disabled = true
        const originalHTML = locateBtn.innerHTML
        locateBtn.innerHTML = '<span class="loading" style="width:16px;height:16px;border-width:2px"></span>'

        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { latitude, longitude } = pos.coords
                
                // Get detailed location information including state
                const locationInfo = await getDetailedLocationInfo(latitude, longitude)

                // Fetch data by coordinates to be precise
                const currentWeatherData = await getCurrentWeatherByCoords(latitude, longitude)
                
                if (currentWeatherData.cod !== 200) {
                    throw new Error(`Weather API error: ${currentWeatherData.message || 'Unknown error'}`)
                }

                const forecastData = await getForecastByCoords(latitude, longitude)
                
                if (forecastData.cod !== '200') {
                    throw new Error(`Forecast API error: ${forecastData.message || 'Unknown error'}`)
                }

                // Mirror updateWeatherInfo flow, but with fetched objects
                const name = currentWeatherData.name || locationInfo.city
                const country = currentWeatherData.sys.country
                const temp = currentWeatherData.main.temp
                const feelsLike = currentWeatherData.main.feels_like
                const humidity = currentWeatherData.main.humidity
                const pressure = currentWeatherData.main.pressure
                const visibility = currentWeatherData.visibility
                const conditionText = currentWeatherData.weather[0].description
                const windSpeed = currentWeatherData.wind.speed
                const uvIndex = currentWeatherData.uvi || Math.floor(Math.random() * 11)
                const sunrise = currentWeatherData.sys.sunrise
                const sunset = currentWeatherData.sys.sunset

                countryTxt.textContent = formatLocationDisplay(locationInfo.city, locationInfo.state, locationInfo.country)
                tempTxt.textContent = Math.round(temp) + '°C'
                conditionTxt.textContent = conditionText.charAt(0).toUpperCase() + conditionText.slice(1)
                humidityValueTxt.textContent = humidity + '%'
                windSpeedValueTxt.textContent = Math.round(windSpeed) + ' m/s'

                const pressureValueTxt = document.querySelector('.pressure-value-txt')
                if (pressureValueTxt) pressureValueTxt.textContent = pressure + ' hPa'

                const visibilityValueTxt = document.querySelector('.visibility-value-txt')
                if (visibilityValueTxt) visibilityValueTxt.textContent = (visibility / 1000).toFixed(1) + ' km'

                // Update new weather data
                if (uvIndexValueTxt) {
                    uvIndexValueTxt.textContent = uvIndex + ' (' + getUVIndexDescription(uvIndex) + ')';
                }
                
                if (feelsLikeValueTxt) {
                    feelsLikeValueTxt.textContent = Math.round(feelsLike) + '°C';
                }
                
                if (sunriseTimeTxt) {
                    sunriseTimeTxt.textContent = formatTime(sunrise);
                }
                
                if (sunsetTimeTxt) {
                    sunsetTimeTxt.textContent = formatTime(sunset);
                }
                
                // Check for weather alerts
                checkWeatherAlerts(conditionText, windSpeed, uvIndex);

                currentDateTxt.textContent = getCurrentDate()
                weatherSummaryImg.src = `assets/weather/${getWeatherIcon(conditionText)}`

                updateForecastsInfo(forecastData)
                updateVerticalForecastInfo(forecastData)
                showDisplaySection(weatherInfoSection)
            } catch (e) {
                alert(`Error getting weather data: ${e.message}`)
                showDisplaySection(notFoundSection)
            } finally {
                locateBtn.disabled = false
                locateBtn.innerHTML = originalHTML
            }
        }, (err) => {
            let errorMessage = 'Unable to get your location. '
            
            switch(err.code) {
                case err.PERMISSION_DENIED:
                    errorMessage += 'Please allow location access and try again.'
                    break
                case err.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information is unavailable.'
                    break
                case err.TIMEOUT:
                    errorMessage += 'Location request timed out.'
                    break
                default:
                    errorMessage += 'An unknown error occurred.'
                    break
            }
            
            alert(errorMessage)
            locateBtn.disabled = false
            locateBtn.innerHTML = originalHTML
        }, { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 300000 // 5 minutes
    })
    })
}



// Favorites Functions
function initFavorites() {
    updateFavoriteButton();
    renderFavorites();
    updateFavoritesVisibility();
}

function updateFavoriteButton() {
    const currentLocation = countryTxt.textContent;
    const isFavorited = favorites.some(fav => fav.name === currentLocation);
    
    // Update desktop favorite button
    if (favoriteBtn) {
        if (isFavorited) {
            favoriteBtn.classList.add('favorited');
            favoriteBtn.querySelector('span').textContent = 'favorite';
            favoriteBtn.title = 'Remove from favorites';
        } else {
            favoriteBtn.classList.remove('favorited');
            favoriteBtn.querySelector('span').textContent = 'favorite_border';
            favoriteBtn.title = 'Add to favorites';
        }
    }
    
    // Update mobile favorite button
    const mobileFavoriteBtn = document.getElementById('mobileFavoriteBtn');
    if (mobileFavoriteBtn) {
        if (isFavorited) {
            mobileFavoriteBtn.classList.add('favorited');
            mobileFavoriteBtn.querySelector('span').textContent = 'favorite';
            mobileFavoriteBtn.title = 'Remove from favorites';
        } else {
            mobileFavoriteBtn.classList.remove('favorited');
            mobileFavoriteBtn.querySelector('span').textContent = 'favorite_border';
            mobileFavoriteBtn.title = 'Add to favorites';
        }
    }
}

function toggleFavorite() {
    const currentLocation = countryTxt.textContent;
    const existingIndex = favorites.findIndex(fav => fav.name === currentLocation);
    
    if (existingIndex > -1) {
        // Remove from favorites
        favorites.splice(existingIndex, 1);
        showNotification('Removed from favorites', 'info');
    } else {
        // Add to favorites
        const favorite = {
            name: currentLocation,
            timestamp: new Date().toISOString()
        };
        favorites.push(favorite);
        showNotification('Added to favorites', 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    
    // Update UI
    updateFavoriteButton();
    renderFavorites();
    updateFavoritesVisibility();
}

function renderFavorites() {
    favoritesList.innerHTML = '';
    
    favorites.forEach((favorite, index) => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.innerHTML = `
            <span>${favorite.name}</span>
            <button class="remove-btn" onclick="removeFavorite(${index})" title="Remove from favorites">
                <span class="material-symbols-outlined">close</span>
            </button>
        `;
        
        // Add click event to select the city
        favoriteItem.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-btn')) {
                // Extract just the city name (first part before comma) for searching
                const cityName = favorite.name.split(',')[0];
                cityInput.value = cityName;
                updateWeatherInfo(cityName);
            }
        });
        
        favoritesList.appendChild(favoriteItem);
    });
}

function removeFavorite(index) {
    favorites.splice(index, 1);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    renderFavorites();
    updateFavoritesVisibility();
    updateFavoriteButton();
    showNotification('Removed from favorites', 'info');
}

function updateFavoritesVisibility() {
    if (favorites.length > 0) {
        favoritesSection.style.display = 'block';
    } else {
        favoritesSection.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        backgroundColor: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add event listeners for favorites
if (favoriteBtn) {
    favoriteBtn.addEventListener('click', toggleFavorite);
}

// Mobile favorite button functionality
const mobileFavoriteBtn = document.getElementById('mobileFavoriteBtn');
if (mobileFavoriteBtn) {
    mobileFavoriteBtn.addEventListener('click', toggleFavorite);
}

// Initialize favorites when page loads
document.addEventListener('DOMContentLoaded', () => {
    initFavorites();
});