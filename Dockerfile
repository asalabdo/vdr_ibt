FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .


FROM  node:18-alpine AS runtime
WORKDIR /app
COPY --from=build /app ./
ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm","start"]

