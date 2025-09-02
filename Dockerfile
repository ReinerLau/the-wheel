FROM nginx

COPY dist /usr/share/nginx/html

COPY index.conf /etc/nginx/conf.d/default.conf