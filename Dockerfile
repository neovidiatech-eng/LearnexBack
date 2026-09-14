FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (production + prisma cli)
RUN npm install

# Generate Prisma Client
RUN ./node_modules/.bin/prisma generate

# Copy the rest of the source code
COPY . .

# Expose port
EXPOSE 3015

# Run migrations and start app
CMD ["sh", "-c", "./node_modules/.bin/prisma generate && ./node_modules/.bin/prisma migrate deploy && npm start"]
