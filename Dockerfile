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
COPY docs ./docs
COPY VERSION ./VERSION

ARG BOT_VERSION

ENV BOT_VERSION=${BOT_VERSION}

LABEL org.opencontainers.image.title="Arrakis Control" \
      org.opencontainers.image.version="${BOT_VERSION}"

CMD ["node", "src/index.js"]
