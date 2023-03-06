FROM node:18

RUN apt-get update
RUN apt-get install -y vim chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 --no-install-recommends

WORKDIR /home/app
COPY . .

RUN rm -rf /home/app/config
RUN rm -rf /home/app/logs
RUN rm -rf /home/app/node_modules/
RUN chown -R node:node /home/app
RUN mkdir /home/app/logs

USER node

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium

RUN npm i
RUN npm i pm2 -g

CMD ["pm2-runtime", "index.js", "--node-args='--max-old-space-size=4096'"]
