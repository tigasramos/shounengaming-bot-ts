# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Build TypeScript
RUN npm run build

# Start the bot
CMD ["npm", "start"]
