FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm install && npm run github-app:check
EXPOSE 8787
CMD ["node", "--import", "tsx/esm", "src/server.ts"]
