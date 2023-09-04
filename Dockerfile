FROM node:13 as build

ARG env

ARG build_number_tag

ENV REACT_APP_BUILDTAG=$build_number_tag

WORKDIR /app

COPY ./ /app/

RUN mv /app/.env.${env} /app/.env &&\
    npm cache clean --force  &&\
    npm install --no-package-lock --legacy-peer-deps &&\
    npm run build
    
FROM nginx:latest

COPY --from=build /app/ /usr/share/nginx/html

COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
