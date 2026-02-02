#!/bin/bash

# --- CONFIGURACIÓN ---
DB_NAME="bisuteria_ventas"
DB_USER="user"
DB_PASS="password" 
DB_PORT="3307"
OUTPUT_FILE="$HOME/Downloads/backup_ministore_$(date +%Y%m%d_%H%M%S).sql"

echo "------------------------------------------------"
echo "🚀 EXPORTADOR DE DATOS - MINISTORE"
echo "------------------------------------------------"
echo "Generando backup de la base de datos: $DB_NAME..."

# Intentar primero vía Docker (Si el contenedor está corriendo)
if docker ps | grep -q "MiniStore_DB"; then
    echo "📦 Detectado contenedor Docker MiniStore_DB. Exportando desde el contenedor..."
    docker exec MiniStore_DB mysqldump -u root -prootpassword --no-create-info --complete-insert --skip-triggers "$DB_NAME" > "$OUTPUT_FILE"
else
    echo "🖥️  No se detectó el contenedor. Intentando via localhost:$DB_PORT..."
    mysqldump -h 127.0.0.1 -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" --no-create-info --complete-insert --skip-triggers "$DB_NAME" > "$OUTPUT_FILE"
fi

if [ $? -eq 0 ]; then
    echo "✅ ¡Éxito! El archivo se ha guardado en tu carpeta de Descargas:"
    echo "📍 $OUTPUT_FILE"
else
    echo "❌ Hubo un error al generar el backup. Verifica que MySQL esté corriendo y los datos sean correctos."
fi

echo "------------------------------------------------"
read -p "Presiona Enter para salir..."
