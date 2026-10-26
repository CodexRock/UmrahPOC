FROM node:24.19.0-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY src ./src
COPY public ./public
RUN mkdir runtime && chown node:node runtime
USER node
CMD ["npm","start"]
