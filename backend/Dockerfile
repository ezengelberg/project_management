# Use the official Node.js image
FROM node:20

# Set the working directory
WORKDIR /app

# # Copy package.json 
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install jewish-date --save
# Copy the rest of the backend code
COPY . .

# Expose the port for backend (4000)
EXPOSE 4000

# Define the command to run the application
# CMD ["node", "server.js"]
CMD ["npx", "nodemon", "--legacy-watch", "server.js"]