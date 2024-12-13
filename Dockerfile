#Sample Dockerfile for NodeJS Apps

FROM node:22

WORKDIR /app

COPY ["package*.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "node", "app.js" ]