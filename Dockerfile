# --- Stage 1: Build Stage ---
FROM node:18-alpine AS build-stage

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code and build the app
COPY . .
RUN npm run build

# --- Stage 2: Production Stage ---
# Use Nginx to serve the static files created by Vite
FROM nginx:stable-alpine

# Copy the 'dist' folder from the build stage to Nginx's public folder
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80 (standard HTTP)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
