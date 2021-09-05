FROM mcr.microsoft.com/powershell:nanoserver-1809

SHELL [ "pwsh", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';" ]

RUN [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12; \
    Invoke-WebRequest -UseBasicParsing -Uri 'https://github.com/tporadowski/redis/releases/download/v5.0.10/Redis-x64-5.0.10.zip' -OutFile 'Redis-x64-5.0.10.zip' ; \
    Expand-Archive Redis-x64-5.0.10.zip -dest 'C:\\Program Files\\Redis\\' ; \
    Remove-Item Redis-x64-5.0.10.zip -Force

User ContainerAdministrator
RUN setx Path "C:\Program` Files\Redis`;$Env:Path" /M;
User ContainerUser

WORKDIR 'C:\\Program Files\\Redis'

RUN Get-Content redis.windows.conf | Where { $_ -notmatch 'bind 127.0.0.1' } | Set-Content redis.openport.conf ; \
  Get-Content redis.openport.conf | Where { $_ -notmatch 'protected-mode yes' } | Set-Content redis.unprotected.conf ; \
  Add-Content redis.unprotected.conf 'protected-mode no' ; \
    Add-Content redis.unprotected.conf 'bind 0.0.0.0' ; \
  Get-Content redis.unprotected.conf

EXPOSE 6379

# Define our command to be run when launching the container
CMD .\\redis-server.exe .\\redis.unprotected.conf --port 6379 ; \
    Write-Host Redis Started... ; \
    while ($true) { Start-Sleep -Seconds 3600 }
