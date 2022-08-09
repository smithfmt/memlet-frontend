FROM node:15.13-alpine
WORKDIR /intern-big-data-frontend
ENV PATH=./node_modules/.bin:$PATH
COPY . .
RUN npm run build
CMD ["npm", "start"]

