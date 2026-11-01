# Stage 1: Build the React application
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies, including Vite
RUN npm ci

# Copy application source
COPY . .

# Build the production frontend
RUN npm run build


# Stage 2: Serve the application using Nginx
FROM nginx:alpine AS production

# Copy React build output
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
