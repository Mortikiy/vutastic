FROM node

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --silent

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm","start"]
