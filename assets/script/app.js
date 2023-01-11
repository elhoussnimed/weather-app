const countriesContainer = document.querySelector(".search .form .country");
const searchBtn = document.querySelector(".search .form .btn");
const locationIcon = document.querySelector(".search .form .location img");

// get countries list
async function getCountries() {
  const response = await fetch("https://restcountries.com/v3.1/all");
  const data = await response.json();
  let countriesList = [];
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
}
getCountries();

// get geolocalisation
function getLocalisation() {
  navigator.geolocation.getCurrentPosition(succes, error);

  // callback function for geolocalisation function in succes
  function succes(position) {
    const { latitude, longitude } = position.coords;
    // save coords to session storage to use it later
    localStorage.setItem(
      "coords",
      JSON.stringify({
        latitudePosition: latitude,
        longitudePosition: longitude,
      })
    );
  }

  // callback function for geolocalisation function in error
  function error(err) {
    console.log(`ERROR(${err.code}): ${err.message}`);
  }
}

// get city name and country code
let cityName;
let countryCode;
function getCity() {
  const cityNameInput = document.querySelector(".search .form .city");
  cityName = cityNameInput.value;
  cityNameInput.value = "";
}

function getCountry() {
  const countrySelect = document.querySelector(".search .form .country");
  const allCountries = [
    ...document.querySelectorAll(".search .form .country option"),
  ];

  const selectedCountry = allCountries.filter((country) => {
    return country.innerHTML === countrySelect.value;
  });
  countryCode = selectedCountry[0].dataset.code;
}

// get lat and long by city name and country code
async function getLatAndLongByCityName() {
  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},${countryCode}&appid=b1241cf617d2e5138687ed81c6d6c799`
  );
  const data = await response.json();
  const { lat, lon } = data[0];
  // save coords to session storage to use it later
  localStorage.setItem(
    "coords",
    JSON.stringify({
      latitudePosition: lat,
      longitudePosition: lon,
    })
  );
}

searchBtn.addEventListener("click", () => {
  getCity();
  getCountry();
  getLatAndLongByCityName();
  location.href = "result.html";
});

// get lat and long by clicking on location icone
locationIcon.addEventListener("click", () => {
  getLocalisation();
  location.href = "result.html";
});
