# Single image: Spring Boot serves the API (/api/**) and the built frontend (static files).

# 1) Build the frontend
FROM node:20-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_URL=/api
RUN npm run build

# 2) Build the backend with the frontend bundled into its static resources
FROM maven:3.9-eclipse-temurin-21-alpine AS backend
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src src
COPY --from=frontend /frontend/dist src/main/resources/static
RUN mvn package -DskipTests -B

# 3) Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
