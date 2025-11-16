# google-maps-api-service/Dockerfile
# Use official Python image as the base
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy necessary files
COPY requirements.txt .
COPY app /app/app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 80 (internal container port)
EXPOSE 80

# Command to run the Uvicorn server (FastAPI)
# Binds to port 80 inside the container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]