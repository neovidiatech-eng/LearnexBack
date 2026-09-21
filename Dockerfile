FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (production + prisma cli)
RUN npm install

# Generate Prisma Client
RUN npm run prisma:generate

# Copy the rest of the source code
COPY . .

# Expose port
EXPOSE 3015

# Run migrations, seed database, and start app
CMD ["sh", "-c", "npm run prisma:generate && npx prisma migrate deploy --schema=./prisma && npm run seed && npm start"]
