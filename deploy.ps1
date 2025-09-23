# PowerShell deployment script for Azure
param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$GoogleApiKey,
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "East US",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "dev"
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Azure deployment for Sherlock Holmes AI..." -ForegroundColor Green

# Check if Azure CLI is installed
try {
    $azVersion = az version --output tsv 2>$null
    Write-Host "✅ Azure CLI found: $azVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Please install it from https://aka.ms/installazurecliwindows" -ForegroundColor Red
    exit 1
}

# Check if logged in to Azure
try {
    $account = az account show --output tsv 2>$null
    if (-not $account) {
        Write-Host "🔐 Logging in to Azure..." -ForegroundColor Yellow
        az login
    } else {
        Write-Host "✅ Already logged in to Azure" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to authenticate with Azure" -ForegroundColor Red
    exit 1
}

# Generate a random secret key
$secretKey = -join ((65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

Write-Host "📦 Creating resource group: $ResourceGroupName" -ForegroundColor Yellow
az group create --name $ResourceGroupName --location $Location

Write-Host "🏗️ Deploying Azure infrastructure..." -ForegroundColor Yellow
$deploymentResult = az deployment group create `
    --resource-group $ResourceGroupName `
    --template-file azure-deploy.bicep `
    --parameters googleApiKey=$GoogleApiKey secretKey=$secretKey environment=$Environment `
    --output json

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Infrastructure deployment failed" -ForegroundColor Red
    exit 1
}

# Parse deployment outputs
$outputs = $deploymentResult | ConvertFrom-Json
$appServiceName = $outputs.properties.outputs.appServiceName.value
$appServiceUrl = $outputs.properties.outputs.appServiceUrl.value
$containerRegistryName = $outputs.properties.outputs.containerRegistryName.value
$containerRegistryLoginServer = $outputs.properties.outputs.containerRegistryLoginServer.value

Write-Host "✅ Infrastructure deployed successfully!" -ForegroundColor Green
Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "   App Service: $appServiceName" -ForegroundColor White
Write-Host "   App URL: $appServiceUrl" -ForegroundColor White
Write-Host "   Container Registry: $containerRegistryLoginServer" -ForegroundColor White

# Build and push Docker image
Write-Host "🐳 Building and pushing Docker image..." -ForegroundColor Yellow

# Login to container registry
az acr login --name $containerRegistryName

# Build and push the image
docker build -t $containerRegistryLoginServer/sherlock-holmes-ai:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

docker push $containerRegistryLoginServer/sherlock-holmes-ai:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed" -ForegroundColor Red
    exit 1
}

# Update App Service to use the new image
Write-Host "🔄 Updating App Service..." -ForegroundColor Yellow
az webapp config container set `
    --name $appServiceName `
    --resource-group $ResourceGroupName `
    --docker-custom-image-name "$containerRegistryLoginServer/sherlock-holmes-ai:latest"

# Restart the App Service
Write-Host "🔄 Restarting App Service..." -ForegroundColor Yellow
az webapp restart --name $appServiceName --resource-group $ResourceGroupName

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Your Sherlock Holmes AI is now live at: $appServiceUrl" -ForegroundColor Cyan
Write-Host "📊 You can monitor it in the Azure portal" -ForegroundColor Yellow

# Wait for deployment to be ready
Write-Host "⏳ Waiting for application to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Test the deployment
try {
    $response = Invoke-WebRequest -Uri "$appServiceUrl/health" -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application is healthy and responding!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Application deployed but health check returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Application deployed but health check failed. It may still be starting up." -ForegroundColor Yellow
}

Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Visit $appServiceUrl to test your application" -ForegroundColor White
Write-Host "   2. Check the Azure portal for monitoring and logs" -ForegroundColor White
Write-Host "   3. Set up custom domain if needed" -ForegroundColor White
Write-Host "   4. Configure SSL certificate" -ForegroundColor White
