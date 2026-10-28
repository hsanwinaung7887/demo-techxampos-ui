# Build အပိုင်း
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run အပိုင်း (Nginx Server သုံးပြီး Frontend ကို မောင်းမယ်)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# ✅ Custom nginx config copy (ဒီလိုင်း ထည့်)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]