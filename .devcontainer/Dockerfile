# GWS Backend — imagen de desarrollo para Codespaces / devcontainer (E9)
# Node 20 LTS + PostgreSQL 16 (servida por docker-compose del repo).
FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bookworm

# Herramientas base (curl, git, openssl ya presentes en la imagen base).
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# CLI global (opcional, para typeorm en consola).
RUN npm install -g typeorm@0.3.20
