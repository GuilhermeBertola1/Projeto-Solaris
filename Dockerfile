# ---------- Etapa 1: compilar ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Baixa as dependências primeiro: enquanto o pom.xml não mudar,
# o Docker reaproveita esta camada e o build fica bem mais rápido.
COPY backend/pom.xml .
RUN mvn -B -q dependency:go-offline

COPY backend/src ./src
RUN mvn -B -q package -DskipTests

# ---------- Etapa 2: executar ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

# A aplicação não roda como root dentro do container.
RUN useradd --system --uid 1001 solaris

COPY --from=build /build/target/solaris-*.jar app.jar
COPY frontend ./frontend
RUN mkdir logs && chown solaris logs

USER solaris
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]