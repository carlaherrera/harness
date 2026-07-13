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

        // Normalize all constraints into a single array
        const unifiedConstraints: any[] = [];

        // 1. From context constraints array
        if (parsedContext.constraints && Array.isArray(parsedContext.constraints)) {
          unifiedConstraints.push(...parsedContext.constraints);
        }

        // 2. From Architect decision artifacts
        if (parsedContext.artifacts && Array.isArray(parsedContext.artifacts)) {
          const decisions = parsedContext.artifacts.filter((a: any) => a.type === 'decision' && a.metadata);
          for (const decision of decisions) {
            unifiedConstraints.push(decision.metadata);
          }
        }

        // 3. From "rules" format
        if (parsedContext.rules && Array.isArray(parsedContext.rules)) {
          for (const rule of parsedContext.rules) {
            if (rule.effect === 'block' && rule.resource === 'console.log') {
              unifiedConstraints.push({ type: 'forbid', target: 'console.log' });
            }
          }
        }

        // Deduplicate
        const uniqueConstraints = unifiedConstraints.filter((c, index, self) =>
          index === self.findIndex((t) => t.type === c.type && t.target === c.target)
        );

        const hasForbidConsole = uniqueConstraints.some((c: any) => c.type === 'forbid' && c.target === 'console.log');
        const hasAllowConsole = uniqueConstraints.some((c: any) => c.type === 'allow' && c.target === 'console.log');

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

        for (const constraint of uniqueConstraints) {
          if (constraint.type === 'forbid' && constraint.target === 'console.log') {
            logger.info({ msg: 'Applying structured constraint: forbid console.log' })
            artifacts.push({
              type: 'violation-check',
              description: 'console.log usage check activated (normalized)',
              context: `Detected via normalized constraints.`,
              relatedComponents: ['DevRole'],
            })
          }

          if (constraint.type === 'require' && constraint.target === 'logger') {
            logger.info({ msg: 'Applying structured constraint: require logger' })
            artifacts.push({
              type: 'requirement-check',
              description: 'logger usage requirement activated (normalized)',
              context: `Detected via normalized constraints.`,
              relatedComponents: ['DevRole'],
            })
          }
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
