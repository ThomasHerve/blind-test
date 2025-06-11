FROM node:22.13.1 as build-stage
SHELL ["/bin/bash", "-c"]
WORKDIR /app
COPY package*.json /app/
RUN npm install --legacy-peer-deps
RUN cp -r /usr/local/lib/node_modules/* node_modules
COPY ./ /app/
RUN npm run build --prod

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.17.1-alpine
#Copy ci-dashboard-dist
COPY --from=build-stage /app/dist/frontend/browser /usr/share/nginx/html
#Copy default nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf