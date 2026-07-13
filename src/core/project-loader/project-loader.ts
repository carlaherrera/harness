import * as fs from 'fs/promises'
import * as path from 'path'
import { logger } from '../../utils/logger.js'
import type { ProjectMetadata, IProjectLoader, DirectoryStructure, RelevantFiles, ScriptMap, Observation } from '../contracts/project-loader.js'

export class ProjectLoader implements IProjectLoader {
  async load(projectPath: string): Promise<ProjectMetadata> {
    logger.info({ msg: 'Loading project', path: projectPath })

    const structure = await this.buildDirectoryStructure(projectPath)
    const files = await this.findRelevantFiles(projectPath)

    // Switch to pure observation: gather signals, do not infer meaning yet
    const observations = await this.gatherObservations(projectPath, files)

    // Stop assuming npm. If there's a lockfile, return it. Otherwise null.
    const packageManager = await this.detectPackageManager(projectPath)

    const scripts = await this.extractScripts(projectPath, files)

    // Clear out inferencing completely: just empty arrays
    const technologies: string[] = []
    const mainFramework = undefined

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
      observations,
    }

    logger.info({
      msg: 'Project identified',
      name,
      technologies,
      packageManager,
      scriptsCount: Object.keys(scripts).length,
      filesFound: Object.keys(files).length,
      observationsCount: observations.length
    })

    logger.debug({
      msg: 'Project metadata complete',
      structure: Object.keys(structure).length > 0 ? Object.keys(structure).slice(0, 10) : 'empty',
      files,
      scripts: Object.keys(scripts),
      observations
    })

    return result
  }

  private async gatherObservations(projectPath: string, files: RelevantFiles): Promise<Observation[]> {
    const observations: Observation[] = []

    const possibleSignals = ['composer.json', 'wp-config.php', 'package.json', 'index.php']

    for (const signal of possibleSignals) {
      try {
        await fs.access(path.join(projectPath, signal))
        observations.push({ type: 'file', value: signal })
      } catch {}
    }

    return observations
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
  ): Promise<'npm' | 'pnpm' | 'yarn' | null> {
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

    return null // Do not assume npm
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

    // Multi-signal detection

    // 1. Check for PHP (composer.json or index.php in a typical PHP app)
    try {
      await fs.access(path.join(projectPath, 'composer.json'))
      technologies.add('PHP')
    } catch {
      try {
        await fs.access(path.join(projectPath, 'index.php'))
        technologies.add('PHP')
      } catch {}
    }

    // 2. Check for WordPress
    try {
      await fs.access(path.join(projectPath, 'wp-config.php'))
      technologies.add('WordPress')
    } catch {}

    // 3. Check package.json for Node.js ecosystem
    if (files.packageJson) {
      technologies.add('Node.js')
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
