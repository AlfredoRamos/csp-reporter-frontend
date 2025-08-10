# ---[ Arguments ]---
ARG NODE_VERSION=24.5-alpine

# ---[ Frontend ]---
FROM node:${NODE_VERSION} AS frontend-build
LABEL org.opencontainers.image.authors="Alfredo Ramos <alfredoramos@duck.com>"

# Install OS dependencies
RUN apk upgrade --no-cache

# Frontend setup
WORKDIR /srv/http/frontend
RUN rm -fR node_modules dist
COPY package.json package-lock.json ./
RUN npm ci --omit dev
COPY ./ ./
RUN npm run build

# ---[ Application ]---
FROM nginx:mainline-alpine
LABEL org.opencontainers.image.authors="Alfredo Ramos <alfredoramos@duck.com>"

# Install OS dependencies
RUN apk upgrade --no-cache

# App setup
WORKDIR /srv/http/frontend
COPY --from=frontend-build /srv/http/frontend/dist/ dist/

# Filesystem setup
RUN mkdir -p /var/cache/nginx/client_temp \
	/var/cache/nginx/proxy_temp \
	/var/cache/nginx/fastcgi_temp \
	/var/cache/nginx/uwsgi_temp \
	/var/cache/nginx/scgi_temp && \
	touch /var/run/nginx.pid && \
	chown -R nginx:nginx /etc/nginx/ \
	/var/cache/nginx \
	/var/log/nginx \
	/var/run/nginx.pid /run/nginx.pid

# Non-root user
USER nginx

# Start server
CMD ["nginx", "-g", "daemon off;"]
