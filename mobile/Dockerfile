FROM node:20-alpine

WORKDIR /app

# Install Expo CLI and dependencies
RUN npm install -g expo-cli @expo/ngrok

# Copy package files first (for better caching)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy source code
COPY . .

# Expo ports
EXPOSE 8081 19000 19001 19002

# Default command - start Expo with tunnel mode for easier phone connection
CMD ["npx", "expo", "start", "--tunnel"]
