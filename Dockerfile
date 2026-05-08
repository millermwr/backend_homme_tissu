FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# On génère et on build ici, à l'intérieur de l'image
RUN npx prisma generate
RUN npm run build

EXPOSE 10000

# On lance directement le main
CMD ["node", "dist/main"]