FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000 80

# If you want to run Flask:
# CMD ["python", "app.py"]

# If you want to run FastAPI (Google Maps service):
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]

# To run both, use a process manager like 'gunicorn' or 'supervisord', or create a custom entrypoint script.