FROM node:18.13.0

WORKDIR /usr/aya-test/api

COPY package.json .

RUN npm i

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
