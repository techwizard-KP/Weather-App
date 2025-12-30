import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
const limit = 1;

import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.API_KEY;
// console.log(API_KEY);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", {
    weather: null,
    error: null,
    bgClass: "default-bg",
  });
});

app.post("/weather", async (req, res) => {
  try {
    const city = req.body.city;

    const geoResponse = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${limit}&appid=${API_KEY}`
    );

    if (geoResponse.data.length === 0) {
      return res.render("index.ejs", {
        error: "City not found",
        weather: null,
        bgClass: "default-bg",
      });
    }

    const { lat, lon, name, country } = geoResponse.data[0];

    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units="metric"&appid=${API_KEY}
        `
    );
    let bgClass = "default-bg"; // fallback

    const mainWeather = weatherResponse.data.weather[0].main;

    if (mainWeather === "Rain") {
      bgClass = "rain-bg";
    } else if (mainWeather === "Clear") {
      bgClass = "sunny-bg";
    } else if (mainWeather === "Clouds") {
      bgClass = "cloudy-bg";
    } else if (mainWeather === "Snow") {
      bgClass = "snow-bg";
    } else if (mainWeather === "Mist") {
      bgClass = "mist-bg";
    } else if (mainWeather === "Fog") {
      bgClass = "fog-bg";
    } else {
      bgClass = "paris-bg"; // default for any other weather
    }

    res.render("index.ejs", {
      error: null,
      weather: weatherResponse.data,
      city: `${name}, ${country}`,
      bgClass,
    });
  } catch (err) {
    console.error("ERROR DETAILS:", err.response?.data || err.message);
    res.render("index.ejs", {
      weather: null,
      error: err.response?.data?.message || "Something went wrong",
    });
  }
});
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`✅ Server running locally at http://localhost:${port}`);
  });
}

export default app;
