FROM postman/newman:latest
RUN npm install -g newman-reporter-html@1.0.5

WORKDIR /etc/newman
COPY package.json .
RUN npm install

# Add debugging
RUN echo "Contents of /etc/newman:" && ls -la

ENTRYPOINT ["/bin/sh", "-c"]
