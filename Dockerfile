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

# Root / Bot dependencies
COPY package.json ./
RUN npm install --omit=dev

# Dashboard dependencies
COPY src/dashboard/package.json ./src/dashboard/
RUN npm --prefix src/dashboard install

# Application source
COPY src ./src

COPY docs ./docs
COPY VERSION ./VERSION
COPY CHANGELOG.json ./CHANGELOG.json

# Build Next.js dashboard
RUN npm run dashboard:build

ARG BOT_VERSION
ENV BOT_VERSION=${BOT_VERSION}
ENV NODE_ENV=production

LABEL org.opencontainers.image.title="Arrakis Control" \
      org.opencontainers.image.version="${BOT_VERSION}"

EXPOSE 3000

CMD ["npm", "start"]