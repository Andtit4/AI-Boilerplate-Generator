import * as fs from 'fs-extra';
import * as path from 'path';
import * as ejs from 'ejs';
import { APIStructure } from '../types';
import { GeneratorOptions } from '../services/generator.service';

export abstract class BaseGenerator {
  constructor(
    protected structure: APIStructure,
    protected options: GeneratorOptions
  ) {}

  abstract generate(outputPath: string): Promise<void>;

  protected async renderTemplate(
    templatePath: string,
    data: any
  ): Promise<string> {
    const fullPath = path.join(__dirname, '../templates', templatePath);
    const template = await fs.readFile(fullPath, 'utf-8');
    return ejs.render(template, data);
  }

  protected async writeFile(
    outputPath: string,
    filePath: string,
    content: string
  ): Promise<void> {
    const fullPath = path.join(outputPath, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content);
  }

  protected toPascalCase(str: string): string {
    return str
      .split(/[-_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  protected toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  protected toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  protected toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }
}


