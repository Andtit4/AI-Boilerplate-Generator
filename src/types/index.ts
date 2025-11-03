export interface GenerateOptions {
  description?: string;
  output: string;
  framework: 'nestjs' | 'express';
  docker: boolean;
  swagger: boolean;
}

export interface APIStructure {
  projectName: string;
  description: string;
  modules: Module[];
  authentication?: AuthConfig;
  database?: DatabaseConfig;
}

export interface Module {
  name: string;
  description: string;
  entities: Entity[];
  endpoints: Endpoint[];
}

export interface Entity {
  name: string;
  properties: Property[];
}

export interface Property {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  description?: string;
}

export interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  authentication?: boolean;
  requestBody?: any;
  responseType?: string;
}

export interface AuthConfig {
  type: 'jwt' | 'oauth' | 'session';
  providers?: string[];
}

export interface DatabaseConfig {
  type: 'postgres' | 'mysql' | 'mongodb' | 'sqlite';
  orm: 'typeorm' | 'prisma' | 'mongoose';
}

export interface MistralResponse {
  structure: APIStructure;
  additionalFiles?: { [key: string]: string };
}

