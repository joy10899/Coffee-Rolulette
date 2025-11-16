# ☕ Coffee Study Spot Finder

This is a full-stack web application designed to help students find the best nearby coffee shops for studying. It uses the Google Maps API to locate cafes and then feeds that data into a locally-run LLM using Ollama to provide smart, friendly summaries and recommendations.

## Tech Stack

- **Frontend**: React (bootstrapped with Create React App)
- **Backend**: Python (using Flask)
- **APIs**: Google Maps API, Ollama

## Prerequisites

- Node.js and npm installed
- Python 3.x installed
- Ollama installed and running locally
- Google Maps API key

## Setup & Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
"/c/Program Files/PyManager/python.exe" -m pip install flask flask-cors googlemaps ollama
```

3. Set your Google Maps API key as an environment variable:
```bash
export GOOGLE_MAPS_KEY="your-google-maps-api-key"
```

4. Start the Flask backend server:
```bash
"/c/Program Files/PyManager/python.exe" app.py (replace with your local python path)
```

The backend will run on `http://127.0.0.1:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install npm dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Running the Application

1. **Start Ollama** (if not already running):
```bash
ollama run llama3
```

2. **Start the Backend** (in one terminal):
```bash
cd backend
export GOOGLE_MAPS_KEY="your-api-key"
"/c/Program Files/PyManager/python.exe" app.py (replace with your local python path)
```

3. **Start the Frontend** (in another terminal):
```bash
cd frontend
npm start
```

4. Open your browser to `http://localhost:3000` and click "Find Coffee Near Me"

## How It Works

1. The frontend sends user coordinates to the Flask backend
2. The backend queries Google Maps API for nearby coffee shops
3. The results are processed by Ollama (LLM) for smart recommendations
4. The frontend displays the AI-generated summary to the user