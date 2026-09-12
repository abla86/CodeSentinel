FROM node:22-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm install && npm run github-app:check

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY --from=build /app/src ./src
RUN npm install --omit=dev
EXPOSE 8787
CMD ["node", "--import", "tsx/esm", "src/server.ts"]
