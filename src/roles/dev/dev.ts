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

    // Detect additional context handoff
    if (context.additionalContext) {
      logger.info({ msg: 'DEV RECEIVED CONTEXT' })
      artifacts.push({
        type: 'handoff-detected',
        description: 'Context received via handoff',
        context: context.additionalContext.slice(0, 150) + '...', // Include snippet
        relatedComponents: ['DevRole'],
      })

      // Experiment 4: React to conceptual rules regardless of schema
      try {
        const parsedContext = JSON.parse(context.additionalContext);

        // Handle "constraints" format
        if (parsedContext.constraints && Array.isArray(parsedContext.constraints)) {
          const hasForbidConsole = parsedContext.constraints.some((c: any) => c.type === 'forbid' && c.target === 'console.log');
          const hasAllowConsole = parsedContext.constraints.some((c: any) => c.type === 'allow' && c.target === 'console.log');

          if (hasForbidConsole && hasAllowConsole) {
            logger.warn({ msg: 'Conflict detected: forbid vs allow console.log' })
            artifacts.push({
              type: 'conflict-detected',
              description: 'Execution halted due to conflicting constraints',
              context: 'forbid vs allow on console.log',
              relatedComponents: ['DevRole'],
            })
            return {
              role: 'dev' as RoleType,
              executedAt: new Date(),
              result: {
                status: 'conflict',
                projectName: context.project.name,
                technologiesCount: context.technologies.length,
                constraintsCount: context.constraints.length,
                filesAnalyzed: context.relevantFiles.length,
                artifactsIdentified: artifacts.length,
              },
              artifacts,
            }
          }

          for (const constraint of parsedContext.constraints) {
            if (constraint.type === 'forbid' && constraint.target === 'console.log') {
              logger.info({ msg: 'Applying structured constraint: forbid console.log' })
              artifacts.push({
                type: 'violation-check',
                description: 'console.log usage check activated (constraint format)',
                context: `Detected via constraints array.`,
                relatedComponents: ['DevRole'],
              })
            }
          }
        }

        // Handle "rules" format
        if (parsedContext.rules && Array.isArray(parsedContext.rules)) {
          for (const rule of parsedContext.rules) {
            if (rule.effect === 'block' && rule.resource === 'console.log') {
              logger.info({ msg: 'Applying structured rule: block console.log' })
              artifacts.push({
                type: 'violation-check',
                description: 'console.log usage check activated (rule format)',
                context: `Detected via rules array.`,
                relatedComponents: ['DevRole'],
              })
            }
          }
        }
        // Fallback for previous string experiment
        if (context.additionalContext.includes('Proibir uso de console.log')) {
          logger.info({ msg: 'Applying architect decision: Proibir uso de console.log' })

          // Simulate checking for violations in relevant files
          const filesWithConsoleLog = context.relevantFiles.filter(f => f.content.includes('console.log'))

          artifacts.push({
            type: 'violation-check',
            description: 'console.log usage check activated',
            context: `Found ${filesWithConsoleLog.length} files violating Architect decision.`,
            relatedComponents: ['DevRole'],
          })
        }
      } catch (e) {
        logger.error({ msg: 'Failed to process structured context', error: e instanceof Error ? e.message : String(e) })
        return {
          role: 'dev' as RoleType,
          executedAt: new Date(),
          result: {
            status: 'error',
            projectName: context.project.name,
            technologiesCount: context.technologies.length,
            constraintsCount: context.constraints.length,
            filesAnalyzed: context.relevantFiles.length,
            artifactsIdentified: artifacts.length,
          },
          artifacts,
        }
      }
    }

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
        status: 'success',
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
