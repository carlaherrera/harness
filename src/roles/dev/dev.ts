import { logger } from '../../utils/logger.js'
import type { Context } from '../../core/contracts/context-builder.js'
import type { RoleOutput, RoleType } from '../../core/contracts/role-runner.js'
import type { KnowledgeArtifact } from '../../core/contracts/memory-writer.js'

export class DevRole {
  async execute(context: Context): Promise<RoleOutput> {
    logger.info({ msg: 'Dev role executing', project: context.project.name, objective: context.objective })

    // Analyze project structure
    logger.debug({
      msg: 'Analyzing project',
      technologies: context.technologies,
      packageManager: context.project.packageManager,
      scripts: Object.keys(context.project.scripts),
    })

    // Report conventions
    if (Object.keys(context.conventions).length > 0) {
      logger.debug({ msg: 'Conventions detected', conventions: context.conventions })
    }

    // Report constraints
    if (context.constraints.length > 0) {
      logger.debug({ msg: 'Constraints identified', constraints: context.constraints })
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
    if (context.constraints.length > 0) {
      artifacts.push({
        type: 'learning',
        description: `Project has ${context.constraints.length} constraint(s)`,
        context: `Constraints: ${context.constraints.join('; ')}. Future development should address these.`,
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
        constraintsCount: context.constraints.length,
        filesAnalyzed: context.relevantFiles.length,
        artifactsIdentified: artifacts.length,
      },
      artifacts,
    }

    logger.info({
      msg: 'Dev role analysis complete',
      artifactsIdentified: artifacts.length,
      status: 'analyzed',
    })
    return result
  }
}
