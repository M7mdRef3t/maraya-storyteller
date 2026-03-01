# Maraya Storyteller - Google Cloud Run Deployment
# =============================================================================
FROM node:18-slim

# Create app directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy app source
COPY . .

# Exposure port
EXPOSE 8080

# Environment variables (Defaults - override in Cloud Run console)
ENV PORT=8080
ENV LOG_LEVEL=info
ENV TTS_PROVIDER=google

# Start the server
CMD [ "npm", "start" ]
