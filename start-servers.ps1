# Start both Python API and Next.js servers
Write-Host "Starting AVS Cipher application..." -ForegroundColor Green
Write-Host "This will start both the Python API server and Next.js web app" -ForegroundColor Yellow
Write-Host "Python API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Web App: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Start Python API in background
Write-Host "Starting Python API server..." -ForegroundColor Green
Start-Process -FilePath "python" -ArgumentList "backend\cipher_api.py" -WindowStyle Normal

# Wait a moment for API to start
Start-Sleep -Seconds 3

# Start Next.js dev server
Write-Host "Starting Next.js development server..." -ForegroundColor Green
npm run dev
