FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git

ARG GITLAB_TOKEN
RUN git config --global url."https://oauth2:${GITLAB_TOKEN}@iutbg-gitlab.iutbourg.univ-lyon1.fr/".insteadOf "https://iutbg-gitlab.iutbourg.univ-lyon1.fr/"

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]