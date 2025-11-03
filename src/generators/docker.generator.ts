import { BaseGenerator } from './base.generator';

export class DockerGenerator extends BaseGenerator {
  async generate(outputPath: string): Promise<void> {
    await this.generateDockerfile(outputPath);
    await this.generateDockerCompose(outputPath);
    await this.generateDockerignore(outputPath);
  }

  private async generateDockerfile(outputPath: string): Promise<void> {
    const dockerfile = `# Base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Build the application
FROM base AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
`;

    await this.writeFile(outputPath, 'Dockerfile', dockerfile);
  }

  private async generateDockerCompose(outputPath: string): Promise<void> {
    const dbType = this.structure.database?.type || 'postgres';
    
    let dockerCompose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=${dbType === 'postgres' ? '5432' : dbType === 'mysql' ? '3306' : '27017'}
      - DB_USERNAME=\${DB_USERNAME:-${dbType === 'mongodb' ? 'root' : 'postgres'}}
      - DB_PASSWORD=\${DB_PASSWORD:-${dbType === 'mongodb' ? 'example' : 'postgres'}}
      - DB_DATABASE=\${DB_DATABASE:-${this.toSnakeCase(this.structure.projectName)}}
`;

    if (this.structure.authentication?.type === 'jwt') {
      dockerCompose += `      - JWT_SECRET=\${JWT_SECRET:-change-this-secret}
      - JWT_EXPIRATION=\${JWT_EXPIRATION:-7d}
`;
    }

    dockerCompose += `    depends_on:
      - db
    networks:
      - app-network

`;

    if (dbType === 'postgres') {
      dockerCompose += `  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=\${DB_USERNAME:-postgres}
      - POSTGRES_PASSWORD=\${DB_PASSWORD:-postgres}
      - POSTGRES_DB=\${DB_DATABASE:-${this.toSnakeCase(this.structure.projectName)}}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres_data:
`;
    } else if (dbType === 'mysql') {
      dockerCompose += `  db:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=\${DB_PASSWORD:-mysql}
      - MYSQL_DATABASE=\${DB_DATABASE:-${this.toSnakeCase(this.structure.projectName)}}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network

volumes:
  mysql_data:
`;
    } else if (dbType === 'mongodb') {
      dockerCompose += `  db:
    image: mongo:7
    environment:
      - MONGO_INITDB_ROOT_USERNAME=\${DB_USERNAME:-root}
      - MONGO_INITDB_ROOT_PASSWORD=\${DB_PASSWORD:-example}
      - MONGO_INITDB_DATABASE=\${DB_DATABASE:-${this.toSnakeCase(this.structure.projectName)}}
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - app-network

volumes:
  mongo_data:
`;
    }

    dockerCompose += `
networks:
  app-network:
    driver: bridge
`;

    await this.writeFile(outputPath, 'docker-compose.yml', dockerCompose);
  }

  private async generateDockerignore(outputPath: string): Promise<void> {
    const dockerignore = `node_modules
dist
.git
.gitignore
.env
.env.local
*.log
coverage
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.vscode
.idea
`;

    await this.writeFile(outputPath, '.dockerignore', dockerignore);
  }
}


