FROM node:18

ARG DEBIAN_FRONTEND=noninteractive 
RUN groupmod -g 1001 node && usermod -u 1001 -g 1001 node
ARG GROUP_ID
ARG USER_ID
RUN addgroup --gid ${GROUP_ID:-1000} komodian
RUN adduser --disabled-password --gecos '' --uid ${USER_ID:-1000} --gid ${GROUP_ID:-1000} komodian
# changes gid, uid of default node user
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN apt-get update && apt-get install -y jq gnupg bash wget rsync unzip && \
        wget --quiet -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor >/etc/apt/trusted.gpg.d/google-archive.gpg && \
        echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >/etc/apt/sources.list.d/google.list && apt-get update && \
         apt-get install -y google-chrome-stable && rm -rf /var/lib/apt/lists/*

RUN yarn global add pm2

USER komodian
WORKDIR /home/komodian/kdf
COPY --chown=komodian:komodian ./ /home/komodian/kdf
RUN PATH=/usr/local/bin/:$PATH
RUN yarn install --frozen-lockfile
