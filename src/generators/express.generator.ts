import { BaseGenerator } from './base.generator';

export class ExpressGenerator extends BaseGenerator {
  async generate(outputPath: string): Promise<void> {
    await this.generateBaseFiles(outputPath);
  }

  private async generateBaseFiles(outputPath: string): Promise<void> {
    const dependencies: Record<string, string> = {
      express: '^4.18.2',
      'express-validator': '^7.0.1',
      cors: '^2.8.5',
      dotenv: '^16.3.1',
      pg: '^8.11.3',
      typeorm: '^0.3.17',
    };

    const devDependencies: Record<string, string> = {
      '@types/express': '^4.17.21',
      '@types/cors': '^2.8.17',
      '@types/node': '^20.11.0',
      typescript: '^5.3.3',
      'ts-node-dev': '^2.0.0',
      eslint: '^8.56.0',
      '@typescript-eslint/eslint-plugin': '^6.19.0',
      '@typescript-eslint/parser': '^6.19.0',
      jest: '^29.7.0',
      '@types/jest': '^29.5.11',
    };

    if (this.structure.authentication?.type === 'jwt') {
      dependencies['jsonwebtoken'] = '^9.0.2';
      dependencies['bcrypt'] = '^5.1.1';
      devDependencies['@types/jsonwebtoken'] = '^9.0.5';
      devDependencies['@types/bcrypt'] = '^5.0.2';
    }

    if (this.options.includeSwagger) {
      dependencies['swagger-ui-express'] = '^5.0.0';
      dependencies['swagger-jsdoc'] = '^6.2.8';
      devDependencies['@types/swagger-ui-express'] = '^4.1.6';
      devDependencies['@types/swagger-jsdoc'] = '^6.0.4';
    }

    const packageJson = {
      name: this.structure.projectName,
      version: '1.0.0',
      description: this.structure.description,
      main: 'dist/index.js',
      scripts: {
        build: 'tsc',
        start: 'node dist/index.js',
        dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
        lint: 'eslint src/**/*.ts',
        test: 'jest',
      },
      dependencies,
      devDependencies,
    };

    await this.writeFile(
      outputPath,
      'package.json',
      JSON.stringify(packageJson, null, 2)
    );

    const tsConfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'commonjs',
        lib: ['ES2022'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        moduleResolution: 'node',
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    };

    await this.writeFile(
      outputPath,
      'tsconfig.json',
      JSON.stringify(tsConfig, null, 2)
    );

    // .env.example
    const envExample = `PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=${this.toSnakeCase(this.structure.projectName)}

${this.structure.authentication?.type === 'jwt' ? `JWT_SECRET=your-secret-key-change-this
JWT_EXPIRATION=7d` : ''}
`;

    await this.writeFile(outputPath, '.env.example', envExample);

    // .gitignore
    const gitignore = `node_modules/
dist/
.env
.env.local
*.log
coverage/
`;

    await this.writeFile(outputPath, '.gitignore', gitignore);

    // index.ts de base
    let indexContent = `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(\`Server running on http://localhost:\${port}\`);
});
`;

    await this.writeFile(outputPath, 'src/index.ts', indexContent);
  }
}

