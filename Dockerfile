# Development stage
FROM node:20-alpine AS development

ENV NODE_ENV=development
ARG PORT=3000
ENV PORT=${PORT}

EXPOSE 3000 9229

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

RUN apk update && apk add --no-cache git

USER node
WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm install

COPY --chown=node:node . .

CMD ["npm", "run", "start:watch"]

# Production stage
FROM node:20-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

USER node

COPY --chown=node:node --from=development /app .

RUN npm ci --only=production

EXPOSE 3000

CMD ["node", "index.js"]
