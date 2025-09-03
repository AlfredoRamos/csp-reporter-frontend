# ---[ Arguments ]---
ARG NODE_VERSION=24.5-alpine

# ---[ Frontend ]---
FROM node:${NODE_VERSION} AS frontend-build
LABEL org.opencontainers.image.authors="Alfredo Ramos <alfredoramos@duck.com>"

# Vite build arguments
ARG VITE_APP_TITLE
ARG VITE_APP_DESC
ARG VITE_APP_DOMAIN
ARG VITE_API_HOST
ARG VITE_ENABLE_USER_REGISTER
ARG VITE_LOCALE
ARG VITE_TIMEZONE
ARG VITE_HCAPTCHA_SIZE
ARG VITE_MIN_PASSWORD_LENGTH
ARG VITE_GOOGLE_ANALYTICS
ARG VITE_COMPANY_NAME
ARG VITE_COMPANY_URL
ARG VITE_FACEBOOK_LOCALE
ARG VITE_TWITTER_AUTHOR
ARG VITE_WHATSAPP_PHONE
ENV \
	VITE_APP_TITLE=${VITE_APP_TITLE} \
	VITE_APP_DESC=${VITE_APP_DESC} \
	VITE_APP_DOMAIN=${VITE_APP_DOMAIN} \
	VITE_API_HOST=${VITE_API_HOST} \
	VITE_ENABLE_USER_REGISTER=${VITE_ENABLE_USER_REGISTER} \
	VITE_LOCALE=${VITE_LOCALE} \
	VITE_TIMEZONE=${VITE_TIMEZONE} \
	VITE_HCAPTCHA_SIZE=${VITE_HCAPTCHA_SIZE} \
	VITE_MIN_PASSWORD_LENGTH=${VITE_MIN_PASSWORD_LENGTH} \
	VITE_GOOGLE_ANALYTICS=${VITE_GOOGLE_ANALYTICS} \
	VITE_COMPANY_NAME=${VITE_COMPANY_NAME} \
	VITE_COMPANY_URL=${VITE_COMPANY_URL} \
	VITE_FACEBOOK_LOCALE=${VITE_FACEBOOK_LOCALE} \
	VITE_TWITTER_AUTHOR=${VITE_TWITTER_AUTHOR} \
	VITE_WHATSAPP_PHONE=${VITE_WHATSAPP_PHONE}

# Install OS dependencies
RUN set -eux; \
	apk upgrade --no-cache

# Frontend setup
WORKDIR /srv/http/frontend
RUN set -eux; \
	rm -fR node_modules dist
COPY package.json package-lock.json ./
RUN set -eux; \
	npm ci --omit dev
COPY ./ ./
RUN --mount=type=secret,id=hcaptcha_site_key \
	VITE_HCAPTCHA_SITE_KEY=/run/secrets/hcaptcha_site_key \
	/bin/sh -c "set -eux; \
	npm run build"

# ---[ Application ]---
FROM nginx:mainline-alpine
LABEL org.opencontainers.image.authors="Alfredo Ramos <alfredoramos@duck.com>"

# Install OS dependencies
RUN set -eux; \
	apk upgrade --no-cache

# App setup
WORKDIR /srv/http/frontend
RUN set -eux; \
	addgroup -g 1500 -S http; \
	adduser -u 1500 -S -D -G http -H -h /srv/http http
COPY --from=frontend-build /srv/http/frontend/dist/ dist/

# Filesystem setup
RUN set -eux; \
	mkdir -p /var/cache/nginx/client_temp \
	/var/cache/nginx/proxy_temp \
	/var/cache/nginx/fastcgi_temp \
	/var/cache/nginx/uwsgi_temp \
	/var/cache/nginx/scgi_temp; \
	touch /var/run/nginx.pid; \
	chown -R http:http \
	/etc/nginx/ \
	/var/cache/nginx \
	/var/log/nginx \
	/var/run/nginx.pid \
	/run/nginx.pid

# Non-root user
USER http

# Start server
CMD ["nginx", "-g", "daemon off;"]
