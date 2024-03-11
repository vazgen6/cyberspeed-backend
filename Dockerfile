# Base image
FROM node:18-alpine

# Install Certbot
RUN apk update && apk add certbot

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package.json ./

# Install app dependencies
RUN yarn install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN yarn build

EXPOSE 80 443
