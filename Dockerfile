# Stage 1: Build the React application
FROM node:22-alpine AS build

WORKDIR /app

# Copy lock files and packages
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve the application using Python & FastAPI
FROM python:3.12-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy static frontend assets from build stage
COPY --from=build /app/dist ./dist

# Copy python app and data folders
COPY app ./app
COPY data ./data

# Expose port 8080 (Cloud Run's default port)
ENV PORT=8080
EXPOSE 8080

# Run FastAPI using uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
