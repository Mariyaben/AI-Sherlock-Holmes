# Local deployment script for testing
param(
    [Parameter(Mandatory=$false)]
    [string]$GoogleApiKey = $env:GOOGLE_API_KEY,
    
    [Parameter(Mandatory=$false)]
    [switch]$Build = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Run = $false
)

Write-Host "🚀 Local Deployment Script for Sherlock Holmes AI" -ForegroundColor Green

# Check if Google API key is provided
if (-not $GoogleApiKey) {
    Write-Host "❌ Google API key is required. Set GOOGLE_API_KEY environment variable or use -GoogleApiKey parameter" -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker version --format "{{.Server.Version}}" | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop" -ForegroundColor Red
    exit 1
}

if ($Build) {
    Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
    
    # Build the Docker image
    docker build -t sherlock-holmes-ai:latest .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker image built successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker build failed" -ForegroundColor Red
        exit 1
    }
}

if ($Run) {
    Write-Host "🚀 Starting Sherlock Holmes AI..." -ForegroundColor Yellow
    
    # Stop existing container if running
    docker stop sherlock-holmes-ai 2>$null
    docker rm sherlock-holmes-ai 2>$null
    
    # Run the container
    docker run -d `
        --name sherlock-holmes-ai `
        -p 5000:5000 `
        -e GOOGLE_API_KEY=$GoogleApiKey `
        -e SECRET_KEY="local-secret-key-$(Get-Random)" `
        -e FLASK_ENV=production `
        -e CHROMA_DB_PATH="/app/chroma_db" `
        -e LOG_LEVEL=INFO `
        sherlock-holmes-ai:latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Sherlock Holmes AI is running!" -ForegroundColor Green
        Write-Host "🌐 Application URL: http://localhost:5000" -ForegroundColor Cyan
        Write-Host "📊 Health Check: http://localhost:5000/health" -ForegroundColor Cyan
        
        # Wait a moment for the app to start
        Start-Sleep -Seconds 10
        
        # Test the health endpoint
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Application is healthy and responding!" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Application started but health check returned status: $($response.StatusCode)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️ Application started but health check failed. It may still be starting up." -ForegroundColor Yellow
            Write-Host "💡 You can check logs with: docker logs sherlock-holmes-ai" -ForegroundColor Cyan
        }
        
        Write-Host "📋 Useful commands:" -ForegroundColor Cyan
        Write-Host "   View logs: docker logs sherlock-holmes-ai" -ForegroundColor White
        Write-Host "   Stop app:  docker stop sherlock-holmes-ai" -ForegroundColor White
        Write-Host "   Remove:    docker rm sherlock-holmes-ai" -ForegroundColor White
        
    } else {
        Write-Host "❌ Failed to start the application" -ForegroundColor Red
        exit 1
    }
}

# If no specific action requested, show help
if (-not $Build -and -not $Run) {
    Write-Host "📋 Usage Examples:" -ForegroundColor Cyan
    Write-Host "   Build image: .\deploy-local.ps1 -Build" -ForegroundColor White
    Write-Host "   Run app:     .\deploy-local.ps1 -Run" -ForegroundColor White
    Write-Host "   Build & Run: .\deploy-local.ps1 -Build -Run" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Make sure to set GOOGLE_API_KEY environment variable first!" -ForegroundColor Yellow
}
