# Docker with Next.js behind nginx with hot reload in develompent mode

All done just so I can use nginx on my windows 11 machine


## Required stuff on your machine

To run it you need node.js package manager and docker desktop.


## First create the next.js app by running:

```bash
npx create-next-app@latest .
```

## Then you need to edit next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```
It's not necessery, but I saw some mentioning next to this that it reduces the size of it from almost 1gb to something smaller

## Then you create Docker compose.yml
```yml
services:
  file-validation:
    build:
      context: .
      target: development
    container_name: file-validation-nginx-dev
    environment:
      NODE_ENV: development
      DOCKER_ENV: "true"
    command: [ "npm", "run", "dev"]
    develop:
      watch:
        - action: sync
          path: ./app
          target: /file-validation/app
        - action: sync
          path: ./next.config.ts
          target: ./file-validation/next.config.ts
        - action: rebuild
          path: ./package.json
        - action: sync
          path: /public/upload
          target: ./file-validation/public/upload
    restart: unless-stopped
  nginx:
    build: 
      context: ./nginx
    develop:
      watch:
        - action: sync+restart
          path: ./default.conf 
          target: /etc/nginx/conf.d/default.conf
    restart: unless-stopped
    ports:
     - 80:80
    depends_on:
      - file-validation
```

## The Docker file for nextjs
```Dockerfile
FROM node:22-alpine3.22 AS base

WORKDIR /file-validation

FROM base AS deps

COPY package.json ./

COPY package-lock.json ./

RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --no-audit --no-fund && \
    npm cache clean --force

FROM deps AS development

ENV NODE_ENV=development \
    NPM_CONFIG_LOGLEVEL=warn

COPY . .

EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED=1

CMD ["npm", "run", "dev"]
```
## Now you create the directory for the nginx
```bash
mkdir nginx
```

## Create another Dockerfile inside nginx directory

```Dockerfile
FROM nginx:alpine3.22 AS base

COPY ./default.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Then create default.conf for nginx to configure nginx
```conf
server {


    listen 80;
    server_tokens off;

location / {




    proxy_pass http://file-validation:3000;
    client_max_body_size 50M;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

}
```

## Now in root directory you do .dockerignore
```ignore
# Optimized .dockerignore for Node.js + React Todo App
# Based on actual project structure

# Version control
.git/
.github/
.gitignore

# Dependencies (installed in container)
node_modules/

# Build outputs (built in container)
dist/

# Environment files
.env*

# Development files
.vscode/
*.log
coverage/
.eslintcache

# OS files
.DS_Store
Thumbs.db

# Documentation
*.md
docs/

# Deployment configs
compose.yml
Taskfile.yml
nodejs-sample-kubernetes.yaml

# Non-essential configs (keep build configs)
*.config.js
!vite.config.ts
!esbuild.config.js
!tailwind.config.js
!postcss.config.js
!tsconfig.json

nginx
```


## Start the container with docker compose up --build --watch
```bash
docker compose up --build --watch
```
So after doing all that you should have app working with hot realod in development mode
