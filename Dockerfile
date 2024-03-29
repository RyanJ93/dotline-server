FROM node:20

WORKDIR /home/app
COPY . .

RUN rm -rf /home/app/node_modules
RUN rm -rf /home/app/storage
RUN rm -rf /home/app/config
RUN rm -rf /home/app/logs
RUN rm -rf /home/app/img

RUN chown -R node:node /home/app

RUN mkdir /home/app/storage
RUN mkdir /home/app/logs

RUN npm i pm2 -g

USER node

RUN npm i

CMD ["pm2-runtime", "index.js"]
