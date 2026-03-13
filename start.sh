#!/bin/bash

# Detect local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    HOST_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
else
    HOST_IP=$(hostname -I | awk '{print $1}')
fi

if [ -z "$HOST_IP" ]; then
    HOST_IP="localhost"
fi

export HOST_IP

# Menu
echo ""
echo "MiniStore - Select environment"
echo "------------------------------"
echo "  1) Web  (Backend + Frontend)"
echo "  2) Mobile"
echo "  3) All"
echo "  0) Exit"
echo ""
read -rp "Option: " OPTION

case "$OPTION" in
    1)
        echo ""
        echo "Starting web environment..."
        docker compose up -d --build backend frontend
        echo ""
        echo "Web environment is up."
        echo "  Frontend : http://localhost:5173"
        echo "  Backend  : http://localhost:3000"
        echo "  Local IP : $HOST_IP"
        ;;
    2)
        echo ""
        echo "Starting mobile environment..."
        docker compose up -d --build mobile
        echo ""
        echo "Mobile environment is up."
        echo "  Expo Dev Server : http://$HOST_IP:8081"
        echo "  Expo Go (LAN)   : exp://$HOST_IP:19000"
        ;;
    3)
        echo ""
        echo "Starting all environments..."
        docker compose up -d --build
        echo ""
        echo "All environments are up."
        echo "  Frontend        : http://localhost:5173"
        echo "  Backend         : http://localhost:3000"
        echo "  Expo Dev Server : http://$HOST_IP:8081"
        echo "  Expo Go (LAN)   : exp://$HOST_IP:19000"
        echo "  Local IP        : $HOST_IP"
        ;;
    0)
        echo "Exiting."
        exit 0
        ;;
    *)
        echo "Invalid option."
        exit 1
        ;;
esac
