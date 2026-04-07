@echo off

set "ENCRYPTED_FILE=%~dp0mirageml-backend\.env.age"
set "DECRYPTED_FILE=%~dp0mirageml-backend\.env"
set "AGE_DIR=%~dp0age"
set "AGE_EXE=%AGE_DIR%\age\age.exe"

if not exist "%ENCRYPTED_FILE%" (
    echo ERROR: Encrypted .env.age not found at %ENCRYPTED_FILE%
    pause
    exit /b 1
)

if not exist "%AGE_EXE%" (
    echo Downloading age...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/FiloSottile/age/releases/download/v1.1.1/age-v1.1.1-windows-amd64.zip' -OutFile 'age.zip'"
    powershell -Command "Expand-Archive -Path age.zip -DestinationPath %AGE_DIR% -Force"
    del age.zip 2>nul
)

if not exist "%AGE_EXE%" (
    echo ERROR: Failed to download age
    pause
    exit /b 1
)

echo Decrypting .env...
powershell -Command "$key = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('QUdFLVNFQ1JFVC1LRVktMTZHREpOSFpVU1A0TjZLNUVFWEg5SzVFQTBLSllOSDRGSDVUVjNWWk1RU1E0S1hZUkhHTFNOU0hTQzg=')); Set-Content -Path 'key.txt' -Value $key -NoNewline"
age\age\age.exe --decrypt -i key.txt -o "%DECRYPTED_FILE%" -- "%ENCRYPTED_FILE%"
del key.txt 2>nul

if errorlevel 1 (
    echo ERROR: Failed to decrypt .env
    pause
    exit /b 1
)

echo SUCCESS: .env has been decrypted
echo .
echo Contents of .env:
type "%DECRYPTED_FILE%"
pause