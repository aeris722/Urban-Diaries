import { useEffect, useMemo, useState } from "react";
import type { WeatherInfo } from "../types/journal";

type WeatherCache = {
  lat: number;
  lon: number;
  weather: WeatherInfo;
  createdAt: number;
};

const WEATHER_CACHE_KEY = "urban_diaries_weather_cache_v1";
const CACHE_TTL_MS = 30 * 60 * 1000;

const weatherCodeToIcon = (code: number | null): string => {
  if (code === null) return "Cloud";
  if ([0].includes(code)) return "Sun";
  if ([1, 2, 3].includes(code)) return "CloudSun";
  if ([45, 48].includes(code)) return "CloudFog";
  if ([51, 53, 55, 56, 57].includes(code)) return "CloudDrizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "CloudRain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "CloudSnow";
  if ([95, 96, 99].includes(code)) return "CloudLightning";
  return "Cloud";
};

const safeParseCache = (): WeatherCache | null => {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WeatherCache;
  } catch {
    return null;
  }
};

const saveCache = (cache: WeatherCache) => {
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage quota errors
  }
};

async function fetchLocationName(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    );
    if (!response.ok) throw new Error("Location lookup failed");
    const data = (await response.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
    };

    const city = data.city ?? data.locality ?? "";
    const state = data.principalSubdivision ?? "";
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  } catch {
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  }
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherInfo> {
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto&temperature_unit=fahrenheit`,
  );

  if (!weatherResponse.ok) {
    throw new Error("Weather request failed");
  }

  const weatherData = (await weatherResponse.json()) as {
    current?: { temperature_2m?: number; weather_code?: number };
  };

  const temperature = weatherData.current?.temperature_2m ?? null;
  const weatherCode = weatherData.current?.weather_code ?? null;
  const locationName = await fetchLocationName(lat, lon);

  return {
    locationName,
    temperature,
    weatherCode,
    icon: weatherCodeToIcon(weatherCode),
  };
}

export function useUserWeather() {
  const [weather, setWeather] = useState<WeatherInfo>({
    locationName: "Location unavailable",
    temperature: null,
    weatherCode: null,
    icon: "CloudOff",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const resolveWeather = async () => {
      const cached = safeParseCache();
      const cachedIsUsable =
        cached &&
        Date.now() - cached.createdAt < CACHE_TTL_MS &&
        cached.weather.locationName !== "Unknown location";

      if (cachedIsUsable) {
        if (!isCancelled) {
          setWeather(cached!.weather);
          setIsLoading(false);
        }
        return;
      }

      if (!navigator.geolocation) {
        setWeather({
          locationName: "Geolocation unsupported",
          temperature: null,
          weatherCode: null,
          icon: "MapPinOff",
        });
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const nextWeather = await fetchWeather(lat, lon);
            if (isCancelled) return;
            setWeather(nextWeather);
            saveCache({ lat, lon, weather: nextWeather, createdAt: Date.now() });
          } catch {
            if (!isCancelled) {
              setWeather({
                locationName: "Weather unavailable",
                temperature: null,
                weatherCode: null,
                icon: "CloudOff",
              });
            }
          } finally {
            if (!isCancelled) setIsLoading(false);
          }
        },
        () => {
          if (!isCancelled) {
            setWeather({
              locationName: "Permission denied",
              temperature: null,
              weatherCode: null,
              icon: "MapPinOff",
            });
            setIsLoading(false);
          }
        },
        { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 10_000 },
      );
    };

    resolveWeather().catch(() => {
      if (!isCancelled) {
        setWeather({
          locationName: "Weather unavailable",
          temperature: null,
          weatherCode: null,
          icon: "CloudOff",
        });
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  return useMemo(() => ({ ...weather, isLoading }), [weather, isLoading]);
}
