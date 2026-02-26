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

RUN npx next telemetry disable

CMD ["npm", "run", "dev"]