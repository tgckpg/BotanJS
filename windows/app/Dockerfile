FROM astrojs/jre-nanoserver-1809:latest

RUN pip3 install Flask redis compressinja celery

RUN New-Item -ItemType "Directory" -Path /opt/utils; \
    New-Item -ItemType "Directory" -Path /app; \
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12; \
    Invoke-WebRequest -UseBasicParsing -Uri 'https://github.com/tgckpg/BotanJS/releases/download/compressors/closure.jar' -OutFile '/opt/utils/closure.jar' ; \
    Invoke-WebRequest -UseBasicParsing -Uri 'https://github.com/tgckpg/BotanJS/releases/download/compressors/yuicompressor.jar' -OutFile '/opt/utils/yuicompressor.jar' ;

EXPOSE 5000
WORKDIR /app
