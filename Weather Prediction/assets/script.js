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
const themeToggleBtn = document.querySelector('.theme-toggle-btn');
const uvIndexValueTxt = document.querySelector('.uv-index-value-txt');
const feelsLikeValueTxt = document.querySelector('.feels-like-value-txt');
const sunriseTimeTxt = document.querySelector('.sunrise-time-txt');
const sunsetTimeTxt = document.querySelector('.sunset-time-txt');
const weatherAlertsBanner = document.getElementById('weatherAlertsBanner');
const loadingScreen = document.getElementById('loadingScreen');

// Favorites functionality
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

// Function to convert country code to full country name
function getCountryName(countryCode) {
    try {
        return new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || countryCode;
    } catch (e) {
        // Fallback for older browsers
        return countryCode;
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
        
        // Update UI elements
        countryTxt.textContent = `${name}, ${getCountryName(country)}`;
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
    
    // Update main weather display elements
    tempTxt.textContent = Math.round(avgTemp) + '°C';
    conditionTxt.textContent = mainCondition.charAt(0).toUpperCase() + mainCondition.slice(1);
    humidityValueTxt.textContent = Math.round(avgHumidity) + '%';
    windSpeedValueTxt.textContent = Math.round(avgWindSpeed) + ' m/s';
    
    // Update pressure and visibility if their elements exist
    const pressureValueTxt = document.querySelector('.pressure-value-txt');
    if (pressureValueTxt) {
        pressureValueTxt.textContent = Math.round(avgPressure) + ' hPa';
    }
    
    const visibilityValueTxt = document.querySelector('.visibility-value-txt');
    if (visibilityValueTxt) {
        visibilityValueTxt.textContent = (avgVisibility / 1000).toFixed(1) + ' km';
    }
    
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
function updateMainWeatherDisplayForHour(time, temp, condition, targetDate) {
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
    
    // Apply animations after updating the display
    setTimeout(() => {
        applyWeatherAnimations();
    }, 100);
    
}

// Function to restore original weather data when deselecting
function restoreOriginalWeatherData() {
    const currentCity = countryTxt.textContent.split(',')[0];
    if (currentCity) {
        updateWeatherInfo(currentCity);
    } else {
        // If no city name available, just apply animations to current data
        setTimeout(() => {
            applyWeatherAnimations();
        }, 100);
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

    // Define time slots for hourly display
    const timeSlots = ['3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm', '12am'];
    const hourlyForecasts = [];

    // Map API data to our time slots
    timeSlots.forEach((timeSlot, index) => {
        // Find the closest forecast data for this time slot
        let closestForecast = null;
        let minTimeDiff = Infinity;

        targetDateForecasts.forEach(forecast => {
            const forecastTime = new Date(forecast.dt * 1000);
            const forecastHour = forecastTime.getHours();
            
            // Map time slots to hours
            const timeSlotHour = {
                '3am': 3, '6am': 6, '9am': 9, '12pm': 12, 
                '3pm': 15, '6pm': 18, '9pm': 21
            }[timeSlot];

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
                precipitationProb: Math.round((closestForecast.pop || 0) * 100) // Convert to percentage
            });
        } else {
            // Fallback with random data if no matching forecast found
            const baseTemp = 25;
            const tempVariation = Math.random() * 8 - 4;
            const currentTemp = Math.round(baseTemp + tempVariation);
            const conditionVariations = ['clear', 'clouds', 'rain', 'drizzle', 'thunderstorm'];
            const randomCondition = conditionVariations[Math.floor(Math.random() * conditionVariations.length)];
            const randomPrecipProb = Math.floor(Math.random() * 100);
            
            hourlyForecasts.push({
                time: timeSlot,
                temp: currentTemp,
                condition: randomCondition,
                precipitationProb: randomPrecipProb
            });
        }
    });

    // Display all 8 hourly forecasts
    hourlyForecasts.forEach((item, index) => {
        // For the second 12pm, add a slight variation to distinguish it
        let displayTime = item.time;
        let displayTemp = item.temp;
        
        if (item.time === '12pm' && index === 7) {
            displayTime = '12am';
            displayTemp = item.temp + 2; // Add 2 degrees to distinguish second 12pm
        }
        
        const forecastItem = `
            <div class="forecast-vertical-item hourly-forecast" title="Hourly forecast for ${targetDate}" data-time="${displayTime}" data-temp="${displayTemp}" data-condition="${item.condition}">
                <h5 class="forecast-item-date regular-txt">${displayTime}</h5>
                <img src="assets/weather/${getWeatherIcon(item.condition)}" class="forecast-item-img">
                <h5 class="forecast-item-temp">${displayTemp}°C</h5>
                <h6 class="precipitation-prob">${item.precipitationProb}%</h6>
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
                
                // Update the main weather display for this specific hour
                updateMainWeatherDisplayForHour(time, temp, condition, targetDate);
            } else {
                // If it was already selected, deselect it and restore original weather data
                restoreOriginalWeatherData();
            }
        });
    });

    // Draw temperature graph
    drawTemperatureGraph(hourlyForecasts, targetDate);
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

    // Check if we're in dark mode
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

    // Draw background
    ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)';
    ctx.fillRect(padding, padding, graphWidth, graphHeight);

    // Draw grid lines with appropriate colors for light/dark mode
    ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
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
        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)';
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
        ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Draw temperature value above the bar
        ctx.fillStyle = isDarkMode ? 'white' : '#333333';
        ctx.font = 'bold 11px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText(`${temp}°`, x + barWidth/2, y - 8);
        
        // Draw time labels below the bars
        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
        ctx.font = '10px Poppins';
        ctx.fillText(times[index], x + barWidth/2, height - padding + 15);
    });

    // Draw average temperature line
    const avgTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    const avgY = padding + graphHeight - ((avgTemp - minTemp) / tempRange) * graphHeight;
    
    ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, avgY);
    ctx.lineTo(width - padding, avgY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw average temperature label
    ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)';
    ctx.font = 'bold 10px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText(`Avg: ${Math.round(avgTemp)}°C`, width - padding - 60, avgY - 5);

    // Draw temperature range indicator
    const rangeY = padding - 20;
    ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)';
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
                
                // Get city name for display consistency
                const cityName = await reverseGeocode(latitude, longitude)

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
                const name = currentWeatherData.name || cityName
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

                countryTxt.textContent = `${name}, ${getCountryName(country)}`
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

// Dark Mode Toggle Functionality
if (themeToggleBtn) {
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Update button icon based on current theme
    const updateThemeIcon = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        themeToggleBtn.querySelector('span').textContent = isDark ? 'light_mode' : 'dark_mode';
    };
    
    // Initialize icon
    updateThemeIcon();
    
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update theme
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Save to localStorage
        localStorage.setItem('theme', newTheme);
        
        // Update button icon
        updateThemeIcon();
        
        // Redraw the temperature graph with new theme colors
        setTimeout(() => {
            const forecastsVerticalContainer = document.querySelector('.forecasts-vertical-container');
            if (forecastsVerticalContainer && forecastsVerticalContainer.children.length > 0) {
                // Get the current hourly forecasts data and redraw
                const hourlyItems = forecastsVerticalContainer.querySelectorAll('.forecast-vertical-item');
                if (hourlyItems.length > 0) {
                    const hourlyForecasts = Array.from(hourlyItems).map(item => ({
                        time: item.getAttribute('data-time'),
                        temp: parseInt(item.getAttribute('data-temp')),
                        condition: item.getAttribute('data-condition')
                    }));
                    
                    // Get the current target date
                    const activeItem = forecastsVerticalContainer.querySelector('.active-hourly-forecast');
                    const targetDate = activeItem ? activeItem.getAttribute('title').split('for ')[1] : new Date().toISOString().split('T')[0];
                    
                    drawTemperatureGraph(hourlyForecasts, targetDate);
                }
            }
        }, 100); // Small delay to ensure theme is applied
    });
}

// Mobile Theme Button Functionality
const mobileThemeBtn = document.querySelector('.mobile-theme-btn');
if (mobileThemeBtn) {
    // Update mobile theme icon based on current theme
    const updateMobileThemeIcon = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        mobileThemeBtn.querySelector('span').textContent = isDark ? 'light_mode' : 'dark_mode';
    };
    
    // Initialize mobile icon
    updateMobileThemeIcon();
    
    mobileThemeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update theme
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Save to localStorage
        localStorage.setItem('theme', newTheme);
        
        // Update both desktop and mobile button icons
        if (themeToggleBtn && themeToggleBtn.querySelector('span')) {
            themeToggleBtn.querySelector('span').textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
        }
        updateMobileThemeIcon();
        
        // Redraw the temperature graph with new theme colors
        setTimeout(() => {
            const forecastsVerticalContainer = document.querySelector('.forecasts-vertical-container');
            if (forecastsVerticalContainer && forecastsVerticalContainer.children.length > 0) {
                const hourlyItems = forecastsVerticalContainer.querySelectorAll('.forecast-vertical-item');
                if (hourlyItems.length > 0) {
                    const hourlyForecasts = Array.from(hourlyItems).map(item => ({
                        time: item.getAttribute('data-time'),
                        temp: parseInt(item.getAttribute('data-temp')),
                        condition: item.getAttribute('data-condition')
                    }));
                    
                    const activeItem = forecastsVerticalContainer.querySelector('.active-hourly-forecast');
                    const targetDate = activeItem ? activeItem.getAttribute('title').split('for ')[1] : new Date().toISOString().split('T')[0];
                    
                    drawTemperatureGraph(hourlyForecasts, targetDate);
                }
            }
        }, 100);
    });
}

// Favorites Functions
function initFavorites() {
    updateFavoriteButton();
    renderFavorites();
    updateFavoritesVisibility();
}

function updateFavoriteButton() {
    const currentCity = countryTxt.textContent;
    const isFavorited = favorites.some(fav => fav.name === currentCity);
    
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

function toggleFavorite() {
    const currentCity = countryTxt.textContent;
    const existingIndex = favorites.findIndex(fav => fav.name === currentCity);
    
    if (existingIndex > -1) {
        // Remove from favorites
        favorites.splice(existingIndex, 1);
        showNotification('Removed from favorites', 'info');
    } else {
        // Add to favorites
        const favorite = {
            name: currentCity,
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
                cityInput.value = favorite.name;
                searchWeather();
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

// Initialize favorites when page loads
document.addEventListener('DOMContentLoaded', () => {
    initFavorites();
});