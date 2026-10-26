# syntax=docker/dockerfile:1
FROM node:24.19.0-bookworm-slim
WORKDIR /app
COPY --chown=node:node package.json package-lock.json ./
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    npm ci --ignore-scripts --strict-ssl=true
COPY --chown=node:node src ./src
COPY --chown=node:node public ./public
COPY --chown=node:node scripts/probe.ts scripts/doctor.ts ./scripts/
RUN mkdir runtime && chown node:node runtime
USER node
CMD ["npm","start"]
