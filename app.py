import ollama
import googlemaps
from flask import Flask, request, jsonify
from flask_cors import CORS  # <-- 1. IMPORT THIS
import os

# --- CONFIGURATION ---
GOOGLE_API_KEY = os.environ.get('GOOGLE_MAPS_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("No GOOGLE_MAPS_KEY set.")

app = Flask(__name__)
CORS(app)  # <-- 2. ADD THIS (it allows your website to talk to your backend)
gmaps = googlemaps.Client(key=GOOGLE_API_KEY)

@app.route('/find-nearby-coffee', methods=['POST'])
def find_coffee():
    # ... (the rest of your find_coffee function is identical)
    data = request.get_json()
    if not data or 'lat' not in data or 'lng' not in data:
        return jsonify({"error": "Missing 'lat' or 'lng'"}), 400

    user_location = (data['lat'], data['lng'])

    try:
        # ... (Google Maps and Ollama logic goes here)
        # (Just pasting the end of the function for brevity)

        # Example response for this demo
        ollama_summary = "Ollama's summary of coffee shops would appear here!"
        return jsonify({"answer": ollama_summary})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)