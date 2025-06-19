# Use the official K6 image from DockerHub
FROM grafana/k6:latest

# Set the working directory inside the container
WORKDIR /app

# Copy your K6 test script into the container
COPY entrypoint.sh .
COPY /scripts/LoginTests .
COPY /scripts/userCreationTest .
COPY /scripts/projectLifeTests .

# Set the default command to run the K6 test
CMD ["bash", "entrypoint.sh"]
