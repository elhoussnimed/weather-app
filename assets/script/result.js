const { latitudePosition, longitudePosition } = JSON.parse(
  localStorage.getItem("coords")
);
const weatherInfosContainer = document.querySelector(".result .weather-infos");
const nextDaysWeatherContainer = document.querySelector(
  ".result .next-days-weather"
);
const homeIcone = document.querySelector(".result .home-icone");

homeIcone.addEventListener("click", (location.href = "index.html"));

async function getCurrentWeather() {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitudePosition}&lon=${longitudePosition}&appid=b1241cf617d2e5138687ed81c6d6c799&units=metric`
  );
  const data = await response.json();
  appendData(data);
}

getCurrentWeather();

async function appendData(data) {
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

  // get countries list
  const response = await fetch("https://restcountries.com/v3.1/all");
  const countries = await response.json();

  let countriesList = [];
  countries.forEach((ele) => {
    countriesList.push({
      name: ele.name.common,
      cca2: ele.cca2,
    });
  });
  const selectedCountry = countriesList.filter((ele) => ele.cca2 === country);

  // set icon to not available if :
  if (main === "Sand" || main === "Ash" || main === "Squale") {
    main = "not-available";
  }

  const todayWeather = `
        <p class="date mb-0 fs-3 fw-medium">${date}</p>
        <h1 class="city-name text-capitalize mb-0">${name},<span>${selectedCountry[0].name}</span></h1>
        <div class="temp d-flex align-items-center">
            <p class="mb-0 fw-medium">${temp}°C</p>
            <img src="./assets/imgs/weather-icons/${main}.svg" class="object-fit-cover" alt="weather icone">
        </div>
        <p class="weather-description mb-0 fs-4 fs-md-5 text-capitalize fw-medium">${description}</p>
        <div class="min-max-temp d-flex gap-2">
            <p class="mb-0 fs-6 text-capitalize fw-medium">min temp: ${temp_min}°C</p>
            <p class="mb-0 fs-6 text-capitalize fw-medium">max temp: ${temp_max}°C</p>
        </div>
        <p class="humidity mb-0 fs-6 text-capitalize fw-medium">humidity : ${humidity}%</p>
        <div class="wind">
            <p class="mb-0 fs-6 text-capitalize fw-medium">wind speed: ${speed} meter/second</p>
            <p class="mb-0 fs-6 text-capitalize fw-medium">wind degree: ${deg}</p>
        </div>
    `;
  weatherInfosContainer.innerHTML += todayWeather;
}

async function append5DaysWeatherData() {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${latitudePosition}&lon=${longitudePosition}&cnt=32&units=metric&appid=b1241cf617d2e5138687ed81c6d6c799`
  );
  const data = await response.json();
  const allDays = data.list;
  const regEx = /\d{4}-\d{2}-\d{2} (12:00:00)/g;

  // get next 4 days weather at the 12:00 oclock
  const selectedDays = allDays.filter((day) => {
    return day.dt_txt.match(regEx);
  });

  console.log(selectedDays);

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

    const dayWeather = `
    <div class="next-day h-100 p-2 col-6 col-md-3 text-center">
        <p class="date fs-3">${date}</p>
        <img src="./assets/imgs/weather-icons/${main}.svg" class="d-block mx-auto" alt="weather icone">
        <p class="temp fs-4 mb-0">${temp}° C</p>
        <p class="weather-description text-capitalize fs-5">${description}</p>
    </div>
    `;
    nextDaysWeatherContainer.innerHTML += dayWeather;
  });
}

append5DaysWeatherData();
