FROM node:19-alpine

WORKDIR /app
COPY package.json .
COPY .npmrc .
# RUN npm config set registry http://localhost:4873
RUN npm config set @amirzhan:registry https://npm.pkg.github.com
RUN npm install --only=prod
# RUN npm install @tickets/common@0.0.4 --registry http://localhost:4873 --verbose


COPY . .

CMD ["npm", "start"]