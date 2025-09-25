# Stage 1: build with Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy project files needed for build
COPY pom.xml ./
COPY src ./src

# Build the jar (skip tests for faster image build)
RUN mvn -DskipTests package

# Stage 2: runtime (Debian-based Temurin JRE)
FROM eclipse-temurin:17-jre
WORKDIR /app

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy jar from build stage
COPY --from=build /app/target/*.jar /app/app.jar

# Do NOT hardcode secrets here; pass them at runtime or in Render env
ENV SERVER_PORT=4000
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:${SERVER_PORT}/health || exit 1

ENTRYPOINT ["java","-jar","/app/app.jar"]
