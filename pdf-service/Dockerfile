FROM node:18-slim

# Install chromium and fonts
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && apt-get install -y chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Note: Build context is repo root, so paths must include subdirectory
COPY pdf-service/package.json .
COPY pdf-service/package-lock.json .
RUN npm install

COPY pdf-service/server-puppeteer.js .
COPY pdf-service/server-htmlpdf.js .
COPY pdf-service/server.js .
COPY pdf-service/templates ./templates

# Add user so we don't need --no-sandbox.
# same layer as npm install to keep re-chowned files from using up several hundred MBs more space
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

USER pptruser

EXPOSE 5100

CMD ["npm", "start"]

