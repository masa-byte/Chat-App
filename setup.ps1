# Checking if npm is installed
$npmVersion = npm -v 
# Checking if nest is installed
$nestVersion = nest -v
# Checking if angular is installed
$ngVersion = ng version

if (-not $npmVersion) {
    Write-Host "npm is not installed. Downloading npm..."

    # Installing npm
    Start-Process -FilePath "https://nodejs.org/dist/latest/win-x64/node.exe" -ArgumentList "/install /quiet /norestart" -Wait
}
else {
    Write-Host "npm is already installed. Proceeding..."
    if (-not $nestVersion) {
        Write-Host "Nest is not installed. Downloading Nest..."

        # Installing Nest
        npm install -g @nestjs/cli
    }

    if (-not $ngVersion) {
        Write-Host "Angular is not installed. Downloading Angular..."

        # Installing Angular CLI
        npm install -g @angular/cli
    }
}

if ($npmVersion -and $nestVersion -and $ngVersion) {
    Write-Host "Eveything is already installed. Starting..."

    # Installing dependencies
    npm run install:all

    # Starting server and clients
    npm run start:all
}