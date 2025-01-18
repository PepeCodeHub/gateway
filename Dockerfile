FROM oven/bun:1

# Install curl
RUN apt-get update && apt-get install -y curl

# Set working directory inside the container
WORKDIR /app

# Copy package.json and lock file first to leverage Docker cache
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Expose the application's port
EXPOSE 8080

# Set the default command to start the application
CMD ["bun", "start"]