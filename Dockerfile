# Use a specific version of node-alpine for stability and predictability
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy only package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
