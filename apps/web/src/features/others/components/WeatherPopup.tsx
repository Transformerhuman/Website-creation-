import React, { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  code: number;
  time: number;
}

const WeatherPopup: React.FC<{ lang: 'en' | 'ne', onClose: () => void }> = ({ lang, onClose }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const getWeatherEmoji = (code: number) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 57) return '🌦️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌧️';
    return '⛈️';
  };

  useEffect(() => {
    const fetchWeather = async () => {
      const cached = localStorage.getItem('ap_weather_cache');
      if (cached) {
        const parsed = JSON.parse(cached) as WeatherData;
        const diff = Date.now() - parsed.time;
        if (diff < 30 * 60 * 1000) { // 30 minutes
          setWeather(parsed);
          return;
        }
      }

      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current=temperature_2m,weather_code');
        const data = await res.json();
        const newWeather = {
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
          time: Date.now()
        };
        setWeather(newWeather);
        localStorage.setItem('ap_weather_cache', JSON.stringify(newWeather));
      } catch (err) {
        console.error("Weather fetch failed", err);
      }
    };

    fetchWeather();
  }, []);

  return (
    <div className="absolute top-12 left-0 w-64 bg-white shadow-2xl rounded-3xl p-6 z-[200] border border-slate-100 animate-in slide-in-from-top-2 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">{lang === 'en' ? 'Live Weather' : 'ताजा मौसम'}</h3>
        <button onClick={onClose} className="text-slate-300 hover:text-slate-900 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {!weather ? (
        <div className="flex flex-col items-center py-4">
          <div className="w-8 h-8 border-2 border-slate-100 border-t-slate-400 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="text-center">
          <span className="text-5xl drop-shadow-sm">{getWeatherEmoji(weather.code)}</span>
          <p className="text-4xl font-black mt-3 text-slate-900">{weather.temp}°C</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">Kathmandu, Nepal</p>
          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Updated {new Date(weather.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherPopup;
