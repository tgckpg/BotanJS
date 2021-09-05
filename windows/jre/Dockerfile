FROM astrojs/pyrt-nanoserver-1809:latest as base

ENV JAVA_HOME=C:\\openjdk-11
ENV JAVA_VERSION=11.0.12

RUN setx PATH "$Env:JAVA_HOME\bin`;$Env:Path" /M

COPY --from=openjdk:11-jre-nanoserver-1809 /openjdk-11 /openjdk-11
RUN echo Verifying install ... 	&& echo   java --version && java --version 	&& echo Complete.
