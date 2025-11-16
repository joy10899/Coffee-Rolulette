# import ollama
# import googlemaps 
# from flask import Flask, request, jsonify
# from flask_cors import CORS  # For allowing the website to talk to the backend
# import os

# # --- CONFIGURATION ---
# # REMEMBER to set your API key in your terminal:
# # export GOOGLE_MAPS_KEY="YOUR_API_KEY_HERE"
# GOOGLE_API_KEY = os.environ.get('GOOGLE_MAPS_KEY')

# if not GOOGLE_API_KEY:
#     raise ValueError("No GOOGLE_MAPS_KEY set. Please set the environment variable.")

# # --- APP SETUP ---
# app = Flask(__name__)
# CORS(app) # Allow cross-origin requests from your website
# gmaps = googlemaps.Client(key=GOOGLE_API_KEY)

# @app.route('/find-nearby-coffee', methods=['POST'])
# def find_coffee():
#     """
#     Expects JSON from the frontend: {"lat": 32.8801, "lng": -117.2340}
#     """
#     data = request.get_json()
#     if not data or 'lat' not in data or 'lng' not in data:
#         return jsonify({"error": "Missing 'lat' or 'lng'"}), 400

#     user_location = (data['lat'], data['lng'])

#     try:
#         # === 1. PYTHON CALLS GOOGLE MAPS API ===
#         # This is the "pull" from Google
#         nearby_results = gmaps.places_nearby(
#             location=user_location,
#             radius=1500,  # 1500 meters (about 1 mile)
#             keyword='coffee study spot',
#             type='cafe'
#         )

#         # === 2. PYTHON PROCESSES THE RESULTS ===
#         shops = []
#         # Get the first 5 shops from the results
#         for place in nearby_results.get('results', []):
#             shop_name = place.get('name')
#             shop_rating = place.get('rating', 'No rating')
#             shops.append(f"'{shop_name}' (Rating: {shop_rating})")
            
#             if len(shops) >= 5:
#                 break
        
#         if not shops:
#             return jsonify({"answer": "Sorry, I couldn't find any coffee shops nearby."})

#         # === 3. PYTHON CALLS OLLAMA ===
#         # Create a prompt for Ollama with the data we got from Google
#         shop_list_str = ", ".join(shops)
#         system_prompt = "You are a friendly coffee shop assistant. Be very brief and casual."
#         user_prompt = f"Here are the nearby coffee spots: {shop_list_str}. Briefly recommend them for a student."

#         response = ollama.chat(
#             model='llama3',  # Using llama3 model
#             messages=[
#                 {'role': 'system', 'content': system_prompt},
#                 {'role': 'user', 'content': user_prompt},
#             ]
#         )
        
#         ollama_summary = response['message']['content']

#         # === 4. PYTHON SENDS THE FINAL RESPONSE ===
#         # Send the REAL summary and also the raw data (in case you want to use it later)
#         google_maps_url = f"https://www.google.com/maps?q={data['lat']},{data['lng']}"
#         return jsonify({
#             "answer": ollama_summary, 
#             "raw_data": nearby_results.get('results', []),
#             "maps_url": google_maps_url
#         })
#         print(data);

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # --- RUN THE APP ---
# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000)

