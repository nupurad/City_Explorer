from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# Replace with your actual keys
OPENWEATHER_API_KEY = "0314a968c932b0a7359ebc82eef96826"
RAPIDAPI_KEY = "db6ee9f374mshdd6db167161a039p1c1071jsna7b7b92709a1"

@app.route('/explore-city', methods=['GET'])
def explore_city():
    city = request.args.get('city')
    print(f"City requested: {city}")

    # 1. Fetch weather info
    weather_url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
    weather_res = requests.get(weather_url)
    weather_data = weather_res.json()

    if weather_res.status_code != 200:
        return jsonify({"error": "Weather API failed", "details": weather_data}), 500

    # 🧠 Extract the country code (e.g., "US")
    country_code = weather_data.get("sys", {}).get("country", "US")

    # 2. Fetch city info filtered by country
    city_url = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities"
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
    }
    city_params = {
        "namePrefix": city,
        "limit": 10,
        "sort": "-population",
        "countryIds": country_code
    }

    city_res = requests.get(city_url, headers=headers, params=city_params)
    city_data_json = city_res.json()

    if city_res.status_code != 200 or "data" not in city_data_json or not city_data_json["data"]:
        return jsonify({"error": "GeoDB API failed or returned no data", "details": city_data_json}), 500

    # Try to match city name exactly, fallback to best match
    matching_city = next(
        (c for c in city_data_json["data"] if c["name"].lower() == city.lower()),
        city_data_json["data"][0]
    )

    return jsonify({
        "weather": weather_data,
        "cityInfo": matching_city
    })

@app.route('/')
def home():
    return "✅ Flask is alive!"


if __name__ == '__main__':
    app.run(debug=True)
