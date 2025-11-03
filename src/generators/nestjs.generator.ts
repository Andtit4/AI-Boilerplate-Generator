import * as path from 'path';
import { BaseGenerator } from './base.generator';

export class NestJSGenerator extends BaseGenerator {
  async generate(outputPath: string): Promise<void> {
    await this.generateBaseFiles(outputPath);

    for (const module of this.structure.modules) {
      await this.generateModule(outputPath, module);
    }

    if (this.structure.authentication) {
      await this.generateAuthModule(outputPath);
    }

    await this.generateDatabaseModule(outputPath);

    await this.generateAppModule(outputPath);
  }

  private async generateBaseFiles(outputPath: string): Promise<void> {
    // package.json
    const dependencies: Record<string, string> = {
      '@nestjs/common': '^10.0.0',
      '@nestjs/core': '^10.0.0',
      '@nestjs/platform-express': '^10.0.0',
      '@nestjs/config': '^3.1.1',
      '@nestjs/typeorm': '^10.0.0',
      'typeorm': '^0.3.17',
      'pg': '^8.11.3',
      'class-validator': '^0.14.0',
      'class-transformer': '^0.5.1',
      'reflect-metadata': '^0.1.13',
      'rxjs': '^7.8.1',
    };

    const devDependencies: Record<string, string> = {
      '@nestjs/cli': '^10.0.0',
      '@nestjs/schematics': '^10.0.0',
      '@nestjs/testing': '^10.0.0',
      '@types/express': '^4.17.17',
      '@types/jest': '^29.5.2',
      '@types/node': '^20.3.1',
      '@typescript-eslint/eslint-plugin': '^6.0.0',
      '@typescript-eslint/parser': '^6.0.0',
      'eslint': '^8.42.0',
      'eslint-config-prettier': '^9.0.0',
      'eslint-plugin-prettier': '^5.0.0',
      'jest': '^29.5.0',
      'prettier': '^3.0.0',
      'ts-jest': '^29.1.0',
      'ts-loader': '^9.4.3',
      'ts-node': '^10.9.1',
      'tsconfig-paths': '^4.2.0',
      'typescript': '^5.1.3',
    };

    if (this.options.includeSwagger) {
      dependencies['@nestjs/swagger'] = '^7.1.16';
    }

    if (this.structure.authentication?.type === 'jwt') {
      dependencies['@nestjs/jwt'] = '^10.2.0';
      dependencies['@nestjs/passport'] = '^10.0.3';
      dependencies['passport'] = '^0.7.0';
      dependencies['passport-jwt'] = '^4.0.1';
      dependencies['bcrypt'] = '^5.1.1';
      devDependencies['@types/passport-jwt'] = '^3.0.13';
      devDependencies['@types/bcrypt'] = '^5.0.2';
    }

    const packageJson = {
      name: this.structure.projectName,
      version: '1.0.0',
      description: this.structure.description,
      scripts: {
        'build': 'nest build',
        'format': 'prettier --write "src/**/*.ts"',
        'start': 'nest start',
        'start:dev': 'nest start --watch',
        'start:debug': 'nest start --debug --watch',
        'start:prod': 'node dist/main',
        'lint': 'eslint "{src,apps,libs,test}/**/*.ts" --fix',
        'test': 'jest',
        'test:watch': 'jest --watch',
        'test:cov': 'jest --coverage',
        'test:e2e': 'jest --config ./test/jest-e2e.json',
      },
      dependencies,
      devDependencies,
    };

    await this.writeFile(
      outputPath,
      'package.json',
      JSON.stringify(packageJson, null, 2)
    );

    // tsconfig.json
    const tsConfig = {
      compilerOptions: {
        module: 'commonjs',
        declaration: true,
        removeComments: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        allowSyntheticDefaultImports: true,
        target: 'ES2021',
        sourceMap: true,
        outDir: './dist',
        baseUrl: './',
        incremental: true,
        skipLibCheck: true,
        strictNullChecks: false,
        noImplicitAny: false,
        strictBindCallApply: false,
        forceConsistentCasingInFileNames: false,
        noFallthroughCasesInSwitch: false,
      },
    };

    await this.writeFile(
      outputPath,
      'tsconfig.json',
      JSON.stringify(tsConfig, null, 2)
    );

    // nest-cli.json
    const nestCli = {
      $schema: 'https://json.schemastore.org/nest-cli',
      collection: '@nestjs/schematics',
      sourceRoot: 'src',
      compilerOptions: {
        deleteOutDir: true,
      },
    };

    await this.writeFile(
      outputPath,
      'nest-cli.json',
      JSON.stringify(nestCli, null, 2)
    );

    // .env.example
    const envExample = `# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=${this.toSnakeCase(this.structure.projectName)}

${this.structure.authentication?.type === 'jwt' ? `# JWT
JWT_SECRET=your-secret-key-change-this
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
.DS_Store
`;

    await this.writeFile(outputPath, '.gitignore', gitignore);

    // main.ts
    await this.generateMainFile(outputPath);
  }

  private async generateMainFile(outputPath: string): Promise<void> {
    let mainContent = `import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
`;

    if (this.options.includeSwagger) {
      mainContent += `import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
`;
    }

    mainContent += `
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors();

  // Prefix global
  app.setGlobalPrefix('api');
`;

    if (this.options.includeSwagger) {
      mainContent += `
  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('${this.structure.projectName}')
    .setDescription('${this.structure.description}')
    .setVersion('1.0')`;

      if (this.structure.authentication?.type === 'jwt') {
        mainContent += `
    .addBearerAuth()`;
      }

      mainContent += `
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
`;
    }

    mainContent += `
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(\`Application is running on: http://localhost:\${port}\`);
`;

    if (this.options.includeSwagger) {
      mainContent += `  console.log(\`Swagger documentation: http://localhost:\${port}/api\`);
`;
    }

    mainContent += `}
bootstrap();
`;

    await this.writeFile(outputPath, 'src/main.ts', mainContent);
  }

  private async generateAppModule(outputPath: string): Promise<void> {
    const imports = ['ConfigModule', 'TypeOrmModule'];
    const moduleImports = this.structure.modules.map(
      m => `${this.toPascalCase(m.name)}Module`
    );

    if (this.structure.authentication) {
      moduleImports.push('AuthModule');
    }

    let content = `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
`;

    // Importer les modules
    for (const module of this.structure.modules) {
      const moduleName = this.toPascalCase(module.name);
      content += `import { ${moduleName}Module } from './${this.toKebabCase(module.name)}/${this.toKebabCase(module.name)}.module';
`;
    }

    if (this.structure.authentication) {
      content += `import { AuthModule } from './auth/auth.module';
`;
    }

    content += `
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: '${this.structure.database?.type || 'postgres'}',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || '${this.toSnakeCase(this.structure.projectName)}',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
    }),
    ${moduleImports.join(',\n    ')},
  ],
})
export class AppModule {}
`;

    await this.writeFile(outputPath, 'src/app.module.ts', content);
  }

  
  //Fonction pour générer les entités, DTOs etc...
  private async generateModule(outputPath: string, module: any): Promise<void> {
    const moduleName = this.toPascalCase(module.name);
    const moduleKebab = this.toKebabCase(module.name);
    const modulePath = `src/${moduleKebab}`;

    for (const entity of module.entities) {
      await this.generateEntity(outputPath, modulePath, entity, module);
    }

    for (const entity of module.entities) {
      await this.generateDTOs(outputPath, modulePath, entity);
    }

    await this.generateService(outputPath, modulePath, module);

    await this.generateController(outputPath, modulePath, module);

    await this.generateModuleFile(outputPath, modulePath, module);
  }

  private async generateEntity(
    outputPath: string,
    modulePath: string,
    entity: any,
    module: any
  ): Promise<void> {
    const entityName = this.toPascalCase(entity.name);
    const fileName = `${this.toKebabCase(entity.name)}.entity.ts`;

    let content = `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
`;

    if (this.options.includeSwagger) {
      content += `import { ApiProperty } from '@nestjs/swagger';
`;
    }

    content += `
@Entity('${this.toSnakeCase(entity.name)}')
export class ${entityName} {
  @PrimaryGeneratedColumn('uuid')`;

    if (this.options.includeSwagger) {
      content += `
  @ApiProperty()`;
    }

    content += `
  id: string;

`;

    for (const prop of entity.properties) {
      const typeMapping: any = {
        string: 'varchar',
        number: 'int',
        boolean: 'boolean',
        date: 'timestamp',
      };

      const columnType = typeMapping[prop.type] || 'varchar';
      const tsType = prop.type === 'date' ? 'Date' : prop.type;

      content += `  @Column({ type: '${columnType}'${prop.unique ? ', unique: true' : ''}${!prop.required ? ', nullable: true' : ''} })`;

      if (this.options.includeSwagger) {
        content += `
  @ApiProperty(${prop.description ? `{ description: '${prop.description}' }` : ''})`;
      }

      content += `
  ${prop.name}: ${tsType};

`;
    }

    content += `  @CreateDateColumn()`;
    if (this.options.includeSwagger) {
      content += `
  @ApiProperty()`;
    }
    content += `
  createdAt: Date;

  @UpdateDateColumn()`;
    if (this.options.includeSwagger) {
      content += `
  @ApiProperty()`;
    }
    content += `
  updatedAt: Date;
}
`;

    await this.writeFile(outputPath, `${modulePath}/entities/${fileName}`, content);
  }

  private async generateDTOs(
    outputPath: string,
    modulePath: string,
    entity: any
  ): Promise<void> {
    const entityName = this.toPascalCase(entity.name);
    
    let createContent = `import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsNotEmpty } from 'class-validator';
`;

    if (this.options.includeSwagger) {
      createContent += `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
`;
    }

    createContent += `
export class Create${entityName}Dto {
`;

    for (const prop of entity.properties) {
      const validators = [];
      const tsType = prop.type === 'date' ? 'Date' : prop.type;

      if (prop.required) {
        validators.push('@IsNotEmpty()');
      } else {
        validators.push('@IsOptional()');
      }

      if (prop.type === 'string') validators.push('@IsString()');
      else if (prop.type === 'number') validators.push('@IsNumber()');
      else if (prop.type === 'boolean') validators.push('@IsBoolean()');
      else if (prop.type === 'date') validators.push('@IsDate()');

      if (this.options.includeSwagger) {
        createContent += `  ${prop.required ? '@ApiProperty' : '@ApiPropertyOptional'}(${prop.description ? `{ description: '${prop.description}' }` : ''})
`;
      }

      createContent += `  ${validators.join('\n  ')}
  ${prop.name}: ${tsType};

`;
    }

    createContent += `}
`;

    await this.writeFile(
      outputPath,
      `${modulePath}/dto/create-${this.toKebabCase(entity.name)}.dto.ts`,
      createContent
    );

    let updateContent = `import { PartialType } from '@nestjs/mapped-types';
import { Create${entityName}Dto } from './create-${this.toKebabCase(entity.name)}.dto';

export class Update${entityName}Dto extends PartialType(Create${entityName}Dto) {}
`;

    await this.writeFile(
      outputPath,
      `${modulePath}/dto/update-${this.toKebabCase(entity.name)}.dto.ts`,
      updateContent
    );
  }

  private async generateService(
    outputPath: string,
    modulePath: string,
    module: any
  ): Promise<void> {
    const moduleName = this.toPascalCase(module.name);
    const primaryEntity = module.entities[0];
    const entityName = this.toPascalCase(primaryEntity.name);

    let content = `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${entityName} } from './entities/${this.toKebabCase(primaryEntity.name)}.entity';
import { Create${entityName}Dto } from './dto/create-${this.toKebabCase(primaryEntity.name)}.dto';
import { Update${entityName}Dto } from './dto/update-${this.toKebabCase(primaryEntity.name)}.dto';

@Injectable()
export class ${moduleName}Service {
  constructor(
    @InjectRepository(${entityName})
    private readonly ${this.toCamelCase(primaryEntity.name)}Repository: Repository<${entityName}>,
  ) {}

  async create(create${entityName}Dto: Create${entityName}Dto): Promise<${entityName}> {
    const ${this.toCamelCase(primaryEntity.name)} = this.${this.toCamelCase(primaryEntity.name)}Repository.create(create${entityName}Dto);
    return await this.${this.toCamelCase(primaryEntity.name)}Repository.save(${this.toCamelCase(primaryEntity.name)});
  }

  async findAll(): Promise<${entityName}[]> {
    return await this.${this.toCamelCase(primaryEntity.name)}Repository.find();
  }

  async findOne(id: string): Promise<${entityName}> {
    const ${this.toCamelCase(primaryEntity.name)} = await this.${this.toCamelCase(primaryEntity.name)}Repository.findOne({ where: { id } });
    if (!${this.toCamelCase(primaryEntity.name)}) {
      throw new NotFoundException(\`${entityName} with ID \${id} not found\`);
    }
    return ${this.toCamelCase(primaryEntity.name)};
  }

  async update(id: string, update${entityName}Dto: Update${entityName}Dto): Promise<${entityName}> {
    const ${this.toCamelCase(primaryEntity.name)} = await this.findOne(id);
    Object.assign(${this.toCamelCase(primaryEntity.name)}, update${entityName}Dto);
    return await this.${this.toCamelCase(primaryEntity.name)}Repository.save(${this.toCamelCase(primaryEntity.name)});
  }

  async remove(id: string): Promise<void> {
    const ${this.toCamelCase(primaryEntity.name)} = await this.findOne(id);
    await this.${this.toCamelCase(primaryEntity.name)}Repository.remove(${this.toCamelCase(primaryEntity.name)});
  }
}
`;

    await this.writeFile(
      outputPath,
      `${modulePath}/${this.toKebabCase(module.name)}.service.ts`,
      content
    );
  }

  private async generateController(
    outputPath: string,
    modulePath: string,
    module: any
  ): Promise<void> {
    const moduleName = this.toPascalCase(module.name);
    const primaryEntity = module.entities[0];
    const entityName = this.toPascalCase(primaryEntity.name);
    const routePath = this.toKebabCase(module.name);

    let content = `import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
`;

    if (this.options.includeSwagger) {
      content += `import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
`;
    }

    if (this.structure.authentication) {
      content += `import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
`;
    }

    content += `import { ${moduleName}Service } from './${this.toKebabCase(module.name)}.service';
import { ${entityName} } from './entities/${this.toKebabCase(primaryEntity.name)}.entity';
import { Create${entityName}Dto } from './dto/create-${this.toKebabCase(primaryEntity.name)}.dto';
import { Update${entityName}Dto } from './dto/update-${this.toKebabCase(primaryEntity.name)}.dto';

`;

    if (this.options.includeSwagger) {
      content += `@ApiTags('${routePath}')
`;
    }

    content += `@Controller('${routePath}')
`;

    if (this.structure.authentication) {
      content += `@UseGuards(JwtAuthGuard)
`;
    }

    content += `export class ${moduleName}Controller {
  constructor(private readonly ${this.toCamelCase(module.name)}Service: ${moduleName}Service) {}

  @Post()`;

    if (this.options.includeSwagger) {
      content += `
  @ApiOperation({ summary: 'Create a new ${entityName}' })
  @ApiResponse({ status: 201, description: 'The ${entityName} has been successfully created.', type: ${entityName} })`;
    }

    content += `
  async create(@Body() create${entityName}Dto: Create${entityName}Dto): Promise<${entityName}> {
    return await this.${this.toCamelCase(module.name)}Service.create(create${entityName}Dto);
  }

  @Get()`;

    if (this.options.includeSwagger) {
      content += `
  @ApiOperation({ summary: 'Get all ${entityName}s' })
  @ApiResponse({ status: 200, description: 'Return all ${entityName}s.', type: [${entityName}] })`;
    }

    content += `
  async findAll(): Promise<${entityName}[]> {
    return await this.${this.toCamelCase(module.name)}Service.findAll();
  }

  @Get(':id')`;

    if (this.options.includeSwagger) {
      content += `
  @ApiOperation({ summary: 'Get a ${entityName} by ID' })
  @ApiResponse({ status: 200, description: 'Return the ${entityName}.', type: ${entityName} })
  @ApiResponse({ status: 404, description: '${entityName} not found.' })`;
    }

    content += `
  async findOne(@Param('id') id: string): Promise<${entityName}> {
    return await this.${this.toCamelCase(module.name)}Service.findOne(id);
  }

  @Put(':id')`;

    if (this.options.includeSwagger) {
      content += `
  @ApiOperation({ summary: 'Update a ${entityName}' })
  @ApiResponse({ status: 200, description: 'The ${entityName} has been successfully updated.', type: ${entityName} })
  @ApiResponse({ status: 404, description: '${entityName} not found.' })`;
    }

    content += `
  async update(@Param('id') id: string, @Body() update${entityName}Dto: Update${entityName}Dto): Promise<${entityName}> {
    return await this.${this.toCamelCase(module.name)}Service.update(id, update${entityName}Dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)`;

    if (this.options.includeSwagger) {
      content += `
  @ApiOperation({ summary: 'Delete a ${entityName}' })
  @ApiResponse({ status: 204, description: 'The ${entityName} has been successfully deleted.' })
  @ApiResponse({ status: 404, description: '${entityName} not found.' })`;
    }

    content += `
  async remove(@Param('id') id: string): Promise<void> {
    return await this.${this.toCamelCase(module.name)}Service.remove(id);
  }
}
`;

    await this.writeFile(
      outputPath,
      `${modulePath}/${this.toKebabCase(module.name)}.controller.ts`,
      content
    );
  }

  private async generateModuleFile(
    outputPath: string,
    modulePath: string,
    module: any
  ): Promise<void> {
    const moduleName = this.toPascalCase(module.name);
    const primaryEntity = module.entities[0];
    const entityName = this.toPascalCase(primaryEntity.name);

    let content = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${moduleName}Controller } from './${this.toKebabCase(module.name)}.controller';
import { ${moduleName}Service } from './${this.toKebabCase(module.name)}.service';
import { ${entityName} } from './entities/${this.toKebabCase(primaryEntity.name)}.entity';

@Module({
  imports: [TypeOrmModule.forFeature([${entityName}])],
  controllers: [${moduleName}Controller],
  providers: [${moduleName}Service],
  exports: [${moduleName}Service],
})
export class ${moduleName}Module {}
`;

    await this.writeFile(
      outputPath,
      `${modulePath}/${this.toKebabCase(module.name)}.module.ts`,
      content
    );
  }

  private async generateAuthModule(outputPath: string): Promise<void> {
    if (this.structure.authentication?.type !== 'jwt') {
      return; // Pour l'instant, on ne supporte que JWT
    }

    const authPath = 'src/auth';

    const userEntity = `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
`;

    await this.writeFile(outputPath, `${authPath}/entities/user.entity.ts`, userEntity);

    const jwtStrategy = `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
`;

    await this.writeFile(outputPath, `${authPath}/strategies/jwt.strategy.ts`, jwtStrategy);

    const jwtGuard = `import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
`;

    await this.writeFile(outputPath, `${authPath}/guards/jwt-auth.guard.ts`, jwtGuard);

    // Auth DTOs
    const loginDto = `import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}
`;

    await this.writeFile(outputPath, `${authPath}/dto/login.dto.ts`, loginDto);

    const registerDto = `import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}
`;

    await this.writeFile(outputPath, `${authPath}/dto/register.dto.ts`, registerDto);

    // Auth Service
    const authService = `import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return this.generateToken(user);
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async validateUser(userId: string): Promise<User> {
    return await this.userRepository.findOne({ where: { id: userId } });
  }

  private generateToken(user: User): { access_token: string } {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
`;

    await this.writeFile(outputPath, `${authPath}/auth.service.ts`, authService);

    // Auth Controller
    const authController = `import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, description: 'Successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }
}
`;

    await this.writeFile(outputPath, `${authPath}/auth.controller.ts`, authController);

    // Auth Module
    const authModule = `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
`;

    await this.writeFile(outputPath, `${authPath}/auth.module.ts`, authModule);
  }

  private async generateDatabaseModule(outputPath: string): Promise<void> {
    // Pour TypeORM, la configuration est dans AppModule
    // On pourrait ajouter des migrations ici si nécessaire... Bref à revoir
  }
}

