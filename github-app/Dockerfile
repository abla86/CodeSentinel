FROM node:22-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm install
RUN npm run github-app:check

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY src ./src
RUN npm install --omit=dev
EXPOSE 8787
CMD ["node", "--import", "tsx/esm", "src/server.ts"]
