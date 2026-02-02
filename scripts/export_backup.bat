@echo off
setlocal enabledelayedexpansion

:: --- CONFIGURACIÓN ---
set "DB_NAME=bisuteria_ventas"
set "DB_USER=user"
set "DB_PASS=password"
set "DB_PORT=3307"
set "TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "OUTPUT_FILE=%USERPROFILE%\Downloads\backup_ministore_%TIMESTAMP: =0%.sql"

echo ------------------------------------------------
echo 🚀 EXPORTADOR DE DATOS - MINISTORE (WINDOWS)
echo ------------------------------------------------
echo Generando backup de la base de datos: %DB_NAME%...

:: Intentar vía Docker primero
docker exec MiniStore_DB mysqldump -u root -prootpassword --no-create-info --complete-insert --skip-triggers %DB_NAME% > "%OUTPUT_FILE%" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo 🖥️  Contenedor no detectado o error en Docker. Intentando via localhost:%DB_PORT%...
    mysqldump -h 127.0.0.1 -P %DB_PORT% -u %DB_USER% -p %DB_PASS% --no-create-info --complete-insert --skip-triggers %DB_NAME% > "%OUTPUT_FILE%"
)

if %ERRORLEVEL% EQU 0 (
    echo ✅ ¡Éxito! El archivo se ha guardado en tu carpeta de Descargas:
    echo 📍 "%OUTPUT_FILE%"
) else (
    echo ❌ Hubo un error al generar el backup. 
    echo Verifica que 'mysqldump' esté en el PATH o que MySQL esté corriendo.
)

echo ------------------------------------------------
pause
