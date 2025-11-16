# ☕ Coffee Study Spot Finder

This is a full-stack web application designed to help students find the best nearby coffee shops for studying. It uses the Google Maps API to locate cafes and then feeds that data into a locally-run LLM using Ollama to provide smart, friendly summaries and recommendations.

## Tech Stack

- **Frontend**: React (bootstrapped with Create React App)
- **Backend**: Python (using Flask/FastAPI)
- **APIs**: Google Maps API, Ollama (Qwen model)
- **Deployment**: Docker & Docker Compose

## Prerequisites

- **Node.js** (v18+) and npm installed
- **Python 3.11+** installed
- **Ollama** installed and running locally ([Download here](https://ollama.com/download))
- **Docker Desktop** installed ([Download here](https://www.docker.com/products/docker-desktop/))
- **Google Maps API key** ([Get one here](https://developers.google.com/maps/documentation/javascript/get-api-key))

## Quick Start with Docker (Recommended)

### 1. Install Prerequisites

**Install Docker Desktop:**
- Download from https://www.docker.com/products/docker-desktop/
- Install and restart your computer
- Verify installation: `docker --version`

**Install Ollama:**
- Download from https://ollama.com/download
- Install the application
- Pull the required model: `ollama pull qwen`

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
GOOGLE_MAPS_KEY=your-actual-google-maps-api-key-here
```

### 3. Start Ollama with CORS Enabled

**Windows:**
```bash
# Stop any running Ollama instance from system tray (right-click > Quit)
# Then start with CORS enabled:
set OLLAMA_ORIGINS=http://localhost:3000 && ollama serve
```

**Mac/Linux:**
```bash
OLLAMA_ORIGINS=http://localhost:3000 ollama serve
```

Keep this terminal running.

### 4. Start the Application with Docker

Open a new terminal and run:

```bash
cd /path/to/Coffee-Roulette
docker compose up --build
```

This will:
- Build the frontend and backend containers
- Start the frontend on `http://localhost:3000`
- Start the backend on `http://localhost:8000`

### 5. Access the Application

Open your browser and go to: **http://localhost:3000**

### 6. Stop the Application

Press `Ctrl+C` in the terminal, then run:
```bash
docker compose down
```

---

## Manual Setup (Without Docker)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment (recommended):**
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   
   Or install manually:
   ```bash
   pip install flask flask-cors googlemaps ollama fastapi uvicorn pydantic
   ```

4. **Set your Google Maps API key:**
   ```bash
   # Windows (cmd):
   set GOOGLE_MAPS_KEY=your-google-maps-api-key
   
   # Windows (PowerShell):
   $env:GOOGLE_MAPS_KEY="your-google-maps-api-key"
   
   # Mac/Linux:
   export GOOGLE_MAPS_KEY="your-google-maps-api-key"
   ```

5. **Start the backend server:**
   ```bash
   python app.py
   ```
   
   Backend runs on `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install npm dependencies:**
   ```bash
   npm install
   ```
   
   This installs:
   - react, react-dom
   - axios (for HTTP requests)
   - react-scripts
   - All other dependencies from package.json

3. **Start the React development server:**
   ```bash
   npm start
   ```
   
   Frontend runs on `http://localhost:3000`

### Ollama Setup

1. **Install Ollama:**
   - Download from https://ollama.com/download
   - Follow installation instructions for your OS

2. **Pull the Qwen model:**
   ```bash
   ollama pull qwen
   ```

3. **Start Ollama with CORS enabled:**
   ```bash
   # Windows:
   set OLLAMA_ORIGINS=http://localhost:3000 && ollama serve
   
   # Mac/Linux:
   OLLAMA_ORIGINS=http://localhost:3000 ollama serve
   ```

---

## Running the Application (Manual Method)

### Step-by-Step:

1. **Terminal 1 - Start Ollama:**
   ```bash
   # Windows:
   set OLLAMA_ORIGINS=http://localhost:3000 && ollama serve
   
   # Mac/Linux:
   OLLAMA_ORIGINS=http://localhost:3000 ollama serve
   ```

2. **Terminal 2 - Start Backend:**
   ```bash
   cd backend
   
   # Set API key (Windows cmd):
   set GOOGLE_MAPS_KEY=your-api-key
   
   # Set API key (Mac/Linux):
   export GOOGLE_MAPS_KEY=your-api-key
   
   # Start server:
   python app.py
   ```

3. **Terminal 3 - Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

4. **Open Browser:**
   - Navigate to `http://localhost:3000`
   - Search for coffee shops!

---

## Project Structure

```
Coffee-Roulette/
├── backend/
│   ├── app.py                 # Flask/FastAPI backend server
│   ├── Dockerfile             # Docker configuration for backend
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main React component with agent loop
│   │   ├── LeftPanel.js      # Map and reviews display
│   │   ├── RightPanel.js     # Chat interface
│   │   └── *.css             # Styling files
│   ├── public/
│   ├── package.json          # Node.js dependencies
│   └── Dockerfile            # Docker configuration for frontend
├── docker-compose.yml        # Docker Compose orchestration
├── .env.example              # Environment variables template
├── .dockerignore             # Docker ignore patterns
└── README.md                 # This file
```

---

## How It Works

1. User enters a coffee shop query in the chat interface
2. Frontend (React) sends the query to Ollama LLM
3. Ollama uses the `google_maps_lookup` tool to search for places
4. The tool fetches data from Google Maps API (via backend)
5. Results include: name, address, rating, reviews, and embedded map
6. Frontend displays the map in LeftPanel and details/reviews below
7. Chat conversation continues in RightPanel
