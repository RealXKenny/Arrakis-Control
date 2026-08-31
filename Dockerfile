FROM node:26-alpine

WORKDIR /app

# Native dependencies required by canvas / Next.js dependencies
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

# ============================================================
# Root / Bot dependencies
# ============================================================

COPY package.json package-lock.json ./

RUN npm ci --omit=dev


# ============================================================
# Next.js Dashboard dependencies
# ============================================================

COPY src/dashboard/package.json \
     src/dashboard/package-lock.json \
     ./src/dashboard/

RUN npm --prefix src/dashboard ci


# ============================================================
# Application source
# ============================================================

COPY src ./src

COPY docs ./docs
COPY VERSION ./VERSION
COPY CHANGELOG.json ./CHANGELOG.json


# ============================================================
# Build Next.js dashboard
# ============================================================

RUN npm run dashboard:build


# ============================================================
# Runtime configuration
# ============================================================

ARG BOT_VERSION

ENV BOT_VERSION=${BOT_VERSION}
ENV NODE_ENV=production

LABEL org.opencontainers.image.title="Arrakis Control" \
      org.opencontainers.image.version="${BOT_VERSION}"

EXPOSE 3000

CMD ["npm", "start"]