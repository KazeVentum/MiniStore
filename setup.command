#!/bin/bash
cd "$(dirname "$0")"
echo "💖 Instalando MiniStore... Por favor espera..."
npm install
npm run install-all
echo "✨ ¡Instalación completada! Ahora puedes usar 'start.command' para abrir la app."
read -p "Presiona Enter para cerrar..."
