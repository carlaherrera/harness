import * as fs from 'fs/promises'
import * as path from 'path'
import type { Context, IContextBuilder, ConventionSet, FileContent } from '../contracts/context-builder.js'
import type { ProjectMetadata } from '../contracts/project-loader.js'

export class ContextBuilder implements IContextBuilder {
  async build(metadata: ProjectMetadata, objective: string): Promise<Context> {
    console.log(`[ContextBuilder] Building context for objective: ${objective}`)

    const relevantFiles = await this.readRelevantFiles(metadata)
    const conventions = this.detectConventions(metadata, relevantFiles)
    const constraints = this.identifyConstraints(metadata)

    const result: Context = {
      objective,
      project: metadata,
      technologies: metadata.technologies,
      relevantFiles,
      constraints,
      currentTask: objective,
      conventions,
    }

    console.log(
      `[ContextBuilder] Loaded ${relevantFiles.length} files, identified ${Object.keys(conventions).length} conventions, ${constraints.length} constraints`
    )
    console.log('[ContextBuilder] ✓ Context built')
    return result
  }

  private async readRelevantFiles(metadata: ProjectMetadata): Promise<FileContent[]> {
    const files: FileContent[] = []

    const filesToRead = [
      { path: metadata.files.packageJson, relevance: 'high' as const },
      { path: metadata.files.tsConfig, relevance: 'high' as const },
      { path: metadata.files.claudeMd, relevance: 'high' as const },
      { path: metadata.files.readme, relevance: 'medium' as const },
    ].filter((f): f is { path: string; relevance: 'high' | 'medium' } => f.path !== undefined)

    for (const fileInfo of filesToRead) {
      try {
        const fullPath = path.join(metadata.path, fileInfo.path)
        const content = await fs.readFile(fullPath, 'utf-8')

        files.push({
          path: fileInfo.path,
          name: path.basename(fileInfo.path),
          content,
          relevance: fileInfo.relevance,
        })
      } catch {
        // File couldn't be read
      }
    }

    return files
  }

  private detectConventions(
    metadata: ProjectMetadata,
    files: FileContent[]
  ): ConventionSet {
    const conventions: ConventionSet = {}

    // From technologies
    if (metadata.technologies.includes('TypeScript')) {
      conventions.codeStyle = 'TypeScript'
    }

    if (metadata.technologies.includes('React')) {
      conventions.namingConvention = 'camelCase (React: PascalCase components)'
    }

    if (metadata.technologies.includes('Next.js')) {
      conventions.namingConvention = 'App Router conventions'
    }

    // From CLAUDE.md if present
    const claudeMd = files.find((f) => f.name === 'CLAUDE.md')
    if (claudeMd) {
      if (claudeMd.content.includes('Conventional Commits')) {
        conventions.commitConvention = 'Conventional Commits'
      }

      if (claudeMd.content.includes('pytest')) {
        conventions.testFramework = 'pytest'
      }

      if (claudeMd.content.includes('vitest')) {
        conventions.testFramework = 'vitest'
      }
    }

    // From package.json if present
    const packageJson = files.find((f) => f.name === 'package.json')
    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson.content)

        if (pkg.scripts) {
          if (pkg.scripts.test?.includes('vitest')) {
            conventions.testFramework = 'vitest'
          }
          if (pkg.scripts.test?.includes('jest')) {
            conventions.testFramework = 'jest'
          }
        }
      } catch {
        // Could not parse
      }
    }

    return conventions
  }

  private identifyConstraints(metadata: ProjectMetadata): string[] {
    const constraints: string[] = []

    if (!metadata.technologies.length) {
      constraints.push('No known technologies detected')
    }

    if (!metadata.scripts.test) {
      constraints.push('No test script defined')
    }

    if (!metadata.scripts.build) {
      constraints.push('No build script defined')
    }

    if (!metadata.scripts.dev && !metadata.scripts.start) {
      constraints.push('No dev/start script defined')
    }

    if (metadata.files.others.length === 0) {
      constraints.push('No additional relevant files found')
    }

    return constraints
  }
}
