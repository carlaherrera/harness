import { logger } from '../../utils/logger.js'
import type { Context } from '../../core/contracts/context-builder.js'
import type { RoleOutput, RoleType } from '../../core/contracts/role-runner.js'
import type { KnowledgeArtifact } from '../../core/contracts/memory-writer.js'

/**
 * Experimental Dev Role.
 * Performs interpretation (conventions, constraints) that ContextBuilder used to do.
 *
 * Purpose: Test if Role can produce equivalent analysis from minimal Context.
 */
export class DevRoleExperimental {
  async execute(context: Context): Promise<RoleOutput> {
    logger.info({ msg: 'Dev role executing (experimental)', project: context.project.name, objective: context.objective })

    // Interpret conventions FROM raw facts
    const conventions = this.detectConventions(context)

    // Interpret constraints FROM raw facts
    const constraints = this.identifyConstraints(context)

    // Analyze project structure
    logger.debug({
      msg: 'Analyzing project',
      technologies: context.project.technologies,
      packageManager: context.project.packageManager,
      scripts: Object.keys(context.project.scripts),
    })

    // Report interpreted conventions
    if (Object.keys(conventions).length > 0) {
      logger.debug({ msg: 'Conventions detected (experimental)', conventions })
    }

    // Report interpreted constraints
    if (constraints.length > 0) {
      logger.debug({ msg: 'Constraints identified (experimental)', constraints })
    }

    // Report loaded files
    logger.debug({
      msg: 'Files analyzed',
      count: context.relevantFiles.length,
      files: context.relevantFiles.map((f) => ({ name: f.name, relevance: f.relevance })),
    })

    // Extract knowledge artifacts: identify learned patterns
    const artifacts: KnowledgeArtifact[] = []

    // If project uses TypeScript, record that convention
    if (context.technologies.includes('TypeScript')) {
      artifacts.push({
        type: 'convention',
        description: 'Project uses TypeScript for type safety',
        context: `Detected in package.json and tsconfig.json. Implies strict type checking enabled.`,
        relatedComponents: ['ProjectLoader', 'ContextBuilder'],
      })
    }

    // If project uses specific package manager, record that
    if (context.project.packageManager === 'pnpm') {
      artifacts.push({
        type: 'convention',
        description: 'Project uses pnpm as package manager',
        context: `Detected pnpm-lock.yaml. Implies strict dependency resolution.`,
        relatedComponents: ['ProjectLoader'],
      })
    }

    // Record identified constraints as learning
    if (constraints.length > 0) {
      artifacts.push({
        type: 'learning',
        description: `Project has ${constraints.length} constraint(s)`,
        context: `Constraints: ${constraints.join('; ')}. Future development should address these.`,
        relatedComponents: ['ContextBuilder'],
      })
    }

    // Result: analysis summary
    const result: RoleOutput = {
      role: 'dev' as RoleType,
      executedAt: new Date(),
      result: {
        status: 'analyzed',
        projectName: context.project.name,
        technologiesCount: context.technologies.length,
        constraintsCount: constraints.length,
        filesAnalyzed: context.relevantFiles.length,
        artifactsIdentified: artifacts.length,
      },
      artifacts,
    }

    logger.info({
      msg: 'Dev role analysis complete (experimental)',
      artifactsIdentified: artifacts.length,
      status: 'analyzed',
    })
    return result
  }

  private detectConventions(context: Context): Record<string, string> {
    const conventions: Record<string, string> = {}

    // From technologies (interpretation moved here)
    if (context.technologies.includes('TypeScript')) {
      conventions.codeStyle = 'TypeScript'
    }

    if (context.technologies.includes('React')) {
      conventions.namingConvention = 'camelCase (React: PascalCase components)'
    }

    if (context.technologies.includes('Next.js')) {
      conventions.namingConvention = 'App Router conventions'
    }

    // From CLAUDE.md if present
    const claudeMd = context.relevantFiles.find((f) => f.name === 'CLAUDE.md')
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
    const packageJson = context.relevantFiles.find((f) => f.name === 'package.json')
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

  private identifyConstraints(context: Context): string[] {
    const constraints: string[] = []

    // Interpretation moved here (was in ContextBuilder)
    if (!context.technologies.length) {
      constraints.push('No known technologies detected')
    }

    if (!context.project.scripts.test) {
      constraints.push('No test script defined')
    }

    if (!context.project.scripts.build) {
      constraints.push('No build script defined')
    }

    if (!context.project.scripts.dev && !context.project.scripts.start) {
      constraints.push('No dev/start script defined')
    }

    if (context.project.files.others.length === 0) {
      constraints.push('No additional relevant files found')
    }

    return constraints
  }
}
