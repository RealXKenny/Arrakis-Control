FROM node:26-alpine

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    pkgconfig \
    fontconfig \
    ttf-dejavu \
    font-noto-emoji

RUN fc-cache -f

COPY package.json ./

RUN npm install --omit=dev

COPY src ./src
RUN if [ -f src/dashboard/frontend/package.json ]; then cd src/dashboard/frontend && npm install --no-audit --no-fund && npm run build; fi
COPY docs ./docs
COPY VERSION ./VERSION
COPY CHANGELOG.json ./CHANGELOG.json

ARG BOT_VERSION

ENV BOT_VERSION=${BOT_VERSION}

LABEL org.opencontainers.image.title="Arrakis Control" \
      org.opencontainers.image.version="${BOT_VERSION}"

CMD ["node", "src/index.js"]
