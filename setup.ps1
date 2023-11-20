# Checking if npm is installed
$npmVersion = npm -v 

if (-not $npmVersion) {
    Write-Host "npm is not installed. Downloading npm..."

    # Installing npm
    Start-Process -FilePath "https://nodejs.org/dist/latest/win-x64/node.exe" -ArgumentList "/install /quiet /norestart" -Wait
}
else {
    Write-Host "npm is already installed. Proceeding..."

    # Installing dependencies
    npm run install:all

    # Starting server and clients
    npm run start:all
}