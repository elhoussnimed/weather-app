const searchSection = document.querySelector(".search");
const resultSection = document.querySelector(".result");
const countriesContainer = document.querySelector(".search .form .country");
const searchBtn = document.querySelector(".search .form .btn");
const locationIcon = document.querySelector(".search .form .location img");
const cityNameInput = document.querySelector(".search .form .city");
const countrySelect = document.querySelector(".search .form .country");

// get countries list
function getCountries() {
  let countriesList = [];
  fetch("https://restcountries.com/v3.1/all")
    .then((res) => res.json())
    .then((data) => {
      data.forEach((ele) => {
        countriesList.push({
          name: ele.name.common,
          cca2: ele.cca2,
        });
      });
      countriesList.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      countriesList.forEach((country) => {
        countriesContainer.innerHTML += `<option data-code=${country.cca2}>${country.name}</option>`;
      });
    });
}
getCountries();

// get geolocalisation
function getLocalisation() {
  navigator.geolocation.getCurrentPosition(succes, error);
  // callback function for geolocalisation function in succes
  function succes(position) {
    const { latitude, longitude } = position.coords;
    getCurrentWeather(latitude, longitude);
    append5DaysWeatherData(latitude, longitude);
  }
  // callback function for geolocalisation function in error
  function error(err) {
    console.log(`ERROR(${err.code}): ${err.message}`);
  }
}

// get city name and country code
let cityName;
let countryCode;

// get city name
function getCity() {
  if (cityNameInput.value === "") {
    alert("please enter a city name!");
  }
  cityName = cityNameInput.value;
}

// get the coutry selected code cca2
function getCountry() {
  const allCountries = [
    ...document.querySelectorAll(".search .form .country option"),
  ];
  const selectedCountry = allCountries.filter(
    (country) => country.innerHTML === countrySelect.value
  );
  countryCode = selectedCountry[0].dataset.code;
}

// get lat and long by city name and country code
function getLatAndLongByCityName() {
  fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},${countryCode}&appid=b1241cf617d2e5138687ed81c6d6c799`
  )
    .then((res) => res.json())
    .then((data) => {
      const { lat, lon } = data[0];
      getCurrentWeather(lat, lon);
      append5DaysWeatherData(lat, lon);
    });
}

// show rersults by clicking on search btn
searchBtn.addEventListener("click", () => {
  getCountry();
  getCity();
  getLatAndLongByCityName();
  if (cityNameInput.value.length > 2) {
    searchSection.classList.remove("d-block");
    searchSection.classList.add("d-none");
    resultSection.classList.remove("d-none");
    resultSection.classList.add("d-block");
  }
});

// show results by clicking on location icone
locationIcon.addEventListener("click", () => {
  getLocalisation();
  searchSection.classList.remove("d-block");
  searchSection.classList.add("d-none");
  resultSection.classList.remove("d-none");
  resultSection.classList.add("d-block");
});

// =========================================================== result section ===============================================================

const resultContainer = document.querySelector(".result");
const weatherInfosContainer = document.querySelector(".result .weather-infos");
const nextDaysWeatherContainer = document.querySelector(
  ".result .next-days-weather"
);

async function getCurrentWeather(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=b1241cf617d2e5138687ed81c6d6c799&units=metric`
  );
  const data = await response.json();
  appendData(data);
}

async function append5DaysWeatherData(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=32&units=metric&appid=b1241cf617d2e5138687ed81c6d6c799`
  );
  const data = await response.json();
  const allDays = data.list;
  const regEx = /\d{4}-\d{2}-\d{2} (12:00:00)/g;

  // get next 4 days weather at the 12:00 oclock
  const selectedDays = allDays.filter((day) => {
    return day.dt_txt.match(regEx);
  });

  // append next 4 days weather to the DOM
  selectedDays.forEach((day) => {
    const {
      dt_txt,
      weather,
      main: { temp },
    } = day;
    const { description, main } = weather[0];
    let date = new Date(dt_txt);
    let month = date.getMonth() + 1;
    if (month < 10) {
      month = `0${month}`;
    }
    date = `${date.getDate()}-${month}-${date.getFullYear()}`;

    const iconSrc = `./assets/imgs/weather-icons/Clouds.svg`;

    const dayWeather = `
      <div class="next-day h-100 p-2 col-6 col-md-3 text-center">
          <p class="date fs-3">${date}</p>
          <img src="${iconSrc}" class="d-block mx-auto" alt="weather icone">
          <p class="temp fs-4 mb-0">${temp.toFixed()}° C</p>
          <p class="weather-description text-capitalize fs-5">${description}</p>
      </div>
      `;
    nextDaysWeatherContainer.innerHTML += dayWeather;
  });
}

function appendData(data) {
  const {
    name,
    sys: { country },
    main: { temp, temp_max, temp_min, humidity },
    wind: { deg, speed },
    weather,
  } = data;
  const { main, description } = weather[0];
  // get date
  let date = new Date();
  let month = date.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }
  date = `${date.getDate()}-${month}-${date.getFullYear()}`;

  // change result background
  if (main === "Clouds") {
    resultContainer.style.cssText = `background: url(./assets/imgs/cloudy.jpg) !important`;
  } else if (main === "Clear") {
    resultContainer.style.cssText = `background: url(./assets/imgs/sunny.jpg) !important`;
  } else if (main === "Snow") {
    resultContainer.style.cssText = `background: url(./assets/imgs/snowy.jpg) !important`;
  } else if (main === "Rain") {
    resultContainer.style.cssText = `background: url(./assets/imgs/rainy.jpg) !important`;
  } else if (main === "Thunderstorm") {
    resultContainer.style.cssText = `background: url(./assets/imgs/thunder.jpg) !important`;
  } else {
    resultContainer.style.cssText = `background: url(./assets/imgs/bg.jpg) !important`;
  }

  // get countries list
  let countriesList = [];
  fetch("https://restcountries.com/v3.1/all")
    .then((res) => res.json())
    .then((countries) => {
      countries.forEach((ele) => {
        countriesList.push({
          name: ele.name.common,
          cca2: ele.cca2,
        });
      });
      const selectedCountry = countriesList.filter(
        (ele) => ele.cca2 === country
      );

      // set icon to not available if :
      if (main === "Sand" || main === "Ash" || main === "Squale") {
        main = "Not-available";
      }

      const iconSrc = `./assets/imgs/weather-icons/Clouds.svg`;

      const todayWeather = `
            <p class="date mb-0 fs-3 fw-medium">${date}</p>
            <h1 class="city-name text-capitalize mb-0">${name},<span>${
        selectedCountry[0].name
      }</span></h1>
            <div class="temp d-flex align-items-center">
                <p class="mb-0 fw-medium">${temp.toFixed()}°C</p>
                <img src="${iconSrc}" class="object-fit-cover" alt="weather icone">
            </div>
            <p class="weather-description mb-0 fs-4 fs-md-5 text-capitalize fw-medium">${description}</p>
            <div class="min-max-temp d-flex gap-2">
                <p class="mb-0 fs-6 text-capitalize fw-medium">min temp: ${temp_min.toFixed()}°C</p>
                <p class="mb-0 fs-6 text-capitalize fw-medium">max temp: ${temp_max.toFixed()}°C</p>
            </div>
            <p class="humidity mb-0 fs-6 text-capitalize fw-medium">humidity : ${humidity}%</p>
            <div class="wind">
                <p class="mb-0 fs-6 text-capitalize fw-medium">wind speed: ${speed} meter/second</p>
                <p class="mb-0 fs-6 text-capitalize fw-medium">wind degree: ${deg}</p>
            </div>
        `;
      weatherInfosContainer.innerHTML += todayWeather;
    });
}

// // hide scroll msg
function hideScrollMsg() {
  if (window.innerWidth < 768) {
    const scrollMsg = document.querySelector(".result .scroll-msg");
    nextDaysWeatherContainer.addEventListener("scroll", (e) => {
      scrollMsg.style.cssText = "display: none !important";
    });
  }
}
hideScrollMsg();
