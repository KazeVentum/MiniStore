#!/bin/bash

# Auto-detect local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    HOST_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
else
    # Linux
    HOST_IP=$(hostname -I | awk '{print $1}')
fi

if [ -z "$HOST_IP" ]; then
    echo "⚠️  Could not detect local IP. Using localhost."
    HOST_IP="localhost"
fi

echo "🌐 Detected IP: $HOST_IP"
export HOST_IP

# Run docker-compose with the detected IP
docker-compose "$@"
