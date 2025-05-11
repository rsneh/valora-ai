# Stage 1: Use an official Python runtime as a parent image
# Using a slim version for a smaller image size.
# Ensure the Python version matches your development environment (e.g., 3.9, 3.10, 3.11)
FROM python:3.10-slim

# Set environment variables
# Prevents Python from writing pyc files to disc (optional)
ENV PYTHONDONTWRITEBYTECODE=1
# Ensures Python output is sent straight to terminal without being buffered (recommended for Docker)
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies that might be needed by some Python packages
# For example, psycopg2 (PostgreSQL adapter) might need gcc and libpq-dev
# Add other dependencies if your Python packages require them
RUN apt-get update \
  && apt-get install -y --no-install-recommends gcc libpq-dev \
  # Clean up apt caches to reduce image size
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container at /app
# This is done before copying the rest of the code to leverage Docker's build cache.
# If requirements.txt doesn't change, this layer won't be rebuilt.
COPY ./requirements.txt /app/requirements.txt

# Install any needed packages specified in requirements.txt
# --no-cache-dir: Disables the pip cache, which can reduce image size.
# --upgrade pip: Ensures pip is up to date.
RUN pip install --no-cache-dir --upgrade pip \
  && pip install --no-cache-dir -r /app/requirements.txt

# Copy the rest of the application code from your local ./backend directory into the container at /app
# This includes your app directory, main.py, models, routers, etc.
COPY . /app/

# Expose the port the app runs on (defined by Uvicorn command)
# This is more for documentation; the actual port mapping is done in docker-compose.yml
EXPOSE 8000

# Define the command to run the application
# This is the default command if not overridden by docker-compose.yml
# Assumes your FastAPI app instance is 'app' in 'app/main.py'
# The host 0.0.0.0 makes the app accessible from outside the container.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
