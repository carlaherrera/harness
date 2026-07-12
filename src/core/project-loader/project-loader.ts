import * as fs from 'fs/promises'
import * as path from 'path'
import { logger } from '../../utils/logger.js'
import type { ProjectMetadata, IProjectLoader, DirectoryStructure, RelevantFiles, ScriptMap } from '../contracts/project-loader.js'

export class ProjectLoader implements IProjectLoader {
  async load(projectPath: string): Promise<ProjectMetadata> {
    logger.info({ msg: 'Loading project', path: projectPath })

    const structure = await this.buildDirectoryStructure(projectPath)
    const files = await this.findRelevantFiles(projectPath)
    const packageManager = await this.detectPackageManager(projectPath)
    const scripts = await this.extractScripts(projectPath, files)
    const technologies = await this.detectTechnologies(projectPath, files)
    const mainFramework = this.detectMainFramework(technologies)
    const name = path.basename(projectPath)

    const result: ProjectMetadata = {
      path: projectPath,
      name,
      structure,
      files,
      technologies,
      packageManager,
      scripts,
      mainFramework,
    }

    logger.info({
      msg: 'Project identified',
      name,
      technologies,
      packageManager,
      scriptsCount: Object.keys(scripts).length,
      filesFound: Object.keys(files).length,
    })
    return result
  }

  private async buildDirectoryStructure(
    projectPath: string,
    maxDepth: number = 2,
    currentDepth: number = 0
  ): Promise<DirectoryStructure> {
    const structure: DirectoryStructure = {}

    if (currentDepth >= maxDepth) return structure

    try {
      const entries = await fs.readdir(projectPath, { withFileTypes: true })

      for (const entry of entries) {
        // Skip hidden dirs and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') {
          continue
        }

        const fullPath = path.join(projectPath, entry.name)
        const relativePath = path.relative(projectPath, fullPath)

        if (entry.isDirectory()) {
          structure[relativePath] = 'directory'
          const subStructure = await this.buildDirectoryStructure(
            fullPath,
            maxDepth,
            currentDepth + 1
          )
          Object.assign(structure, subStructure)
        } else {
          structure[relativePath] = 'file'
        }
      }
    } catch {
      // Directory not readable
    }

    return structure
  }

  private async findRelevantFiles(projectPath: string): Promise<RelevantFiles> {
    const files: RelevantFiles = { others: [] }

    const filesToCheck = [
      { name: 'package.json', key: 'packageJson' },
      { name: 'tsconfig.json', key: 'tsConfig' },
      { name: 'CLAUDE.md', key: 'claudeMd' },
      { name: 'README.md', key: 'readme' },
    ]

    for (const { name, key } of filesToCheck) {
      const filePath = path.join(projectPath, name)
      try {
        await fs.access(filePath)
        ;(files as unknown as Record<string, string | undefined>)[key] = name
      } catch {
        // File doesn't exist
      }
    }

    return files
  }

  private async detectPackageManager(
    projectPath: string
  ): Promise<'npm' | 'pnpm' | 'yarn'> {
    const lockFiles = ['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json']

    for (const lockFile of lockFiles) {
      try {
        const filePath = path.join(projectPath, lockFile)
        await fs.access(filePath)

        if (lockFile === 'pnpm-lock.yaml') return 'pnpm'
        if (lockFile === 'yarn.lock') return 'yarn'
        if (lockFile === 'package-lock.json') return 'npm'
      } catch {
        // File doesn't exist
      }
    }

    return 'npm'
  }

  private async extractScripts(
    projectPath: string,
    files: RelevantFiles
  ): Promise<ScriptMap> {
    const scripts: ScriptMap = {}

    if (files.packageJson) {
      try {
        const pkgPath = path.join(projectPath, files.packageJson)
        const content = await fs.readFile(pkgPath, 'utf-8')
        const pkg = JSON.parse(content)

        if (pkg.scripts) {
          Object.assign(scripts, pkg.scripts)
        }
      } catch {
        // Could not parse package.json
      }
    }

    return scripts
  }

  private async detectTechnologies(
    projectPath: string,
    files: RelevantFiles
  ): Promise<string[]> {
    const technologies: Set<string> = new Set()

    // Check package.json
    if (files.packageJson) {
      try {
        const pkgPath = path.join(projectPath, files.packageJson)
        const content = await fs.readFile(pkgPath, 'utf-8')
        const pkg = JSON.parse(content)

        const deps = { ...pkg.dependencies, ...pkg.devDependencies }

        if (deps['react']) technologies.add('React')
        if (deps['next']) technologies.add('Next.js')
        if (deps['typescript']) technologies.add('TypeScript')
        if (deps['express']) technologies.add('Express')
        if (deps['vue']) technologies.add('Vue')
        if (deps['svelte']) technologies.add('Svelte')
      } catch {
        // Could not parse package.json
      }
    }

    // Check for TypeScript config
    if (files.tsConfig) {
      if (!technologies.has('TypeScript')) {
        technologies.add('TypeScript')
      }
    }

    return Array.from(technologies)
  }

  private detectMainFramework(technologies: string[]): string | undefined {
    if (technologies.includes('Next.js')) return 'Next.js'
    if (technologies.includes('React')) return 'React'
    if (technologies.includes('Vue')) return 'Vue'
    if (technologies.includes('Svelte')) return 'Svelte'
    if (technologies.includes('Express')) return 'Express'

    return undefined
  }
}
