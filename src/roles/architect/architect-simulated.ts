import { logger } from '../../utils/logger.js'
import type { Context } from '../../core/contracts/context-builder.js'
import type { RoleOutput, RoleType } from '../../core/contracts/role-runner.js'
import type { KnowledgeArtifact } from '../../core/contracts/memory-writer.js'

/**
 * Simulated Architect Role.
 * Analyzes project architecture, identifies patterns and design concerns.
 *
 * Purpose: Understand what information Architect needs from Context.
 */
export class ArchitectRoleSimulated {
  async execute(context: Context): Promise<RoleOutput> {
    logger.info({
      msg: 'Architect role executing (simulated)',
      project: context.project.name,
      objective: context.objective,
    })

    // CONSUMPTION TRACKING
    const consumed = {
      context_fields: [] as string[],
      data_accessed: [] as string[],
    }

    // Access: objective
    consumed.context_fields.push('objective')
    logger.debug({ msg: 'Architect analyzing', objective: context.objective })

    // Access: project.name
    consumed.context_fields.push('project.name')
    const projectName = context.project.name

    // Access: project.structure
    consumed.context_fields.push('project.structure')
    consumed.data_accessed.push('analyzing directory structure for layering')
    const dirCount = Object.keys(context.project.structure).length

    // Access: project.mainFramework
    consumed.context_fields.push('project.mainFramework')
    if (context.project.mainFramework) {
      consumed.data_accessed.push(`framework detected: ${context.project.mainFramework}`)
    }

    // Access: technologies
    consumed.context_fields.push('technologies')
    consumed.data_accessed.push(`tech stack: ${context.technologies.join(', ')}`)

    // Access: project.path
    consumed.context_fields.push('project.path')
    consumed.data_accessed.push(`analyzing from: ${context.project.path}`)

    // Access: relevantFiles (reading ARCHITECTURE.md, package.json, tsconfig)
    consumed.context_fields.push('relevantFiles')
    const archFile = context.relevantFiles.find((f) => f.name.includes('ARCHITECTURE') || f.name.includes('architecture'))
    if (archFile) {
      consumed.data_accessed.push('found architecture documentation')
    }

    // NOT accessed: constraints (architecture role defines its own)
    // NOT accessed: conventions (defines own patterns)
    // NOT accessed: currentTask (uses objective)
    // NOT accessed: packageManager (less relevant to architecture)
    // NOT accessed: scripts (less relevant to architecture)

    const artifacts: KnowledgeArtifact[] = [
      {
        type: 'pattern',
        description: `Architecture analysis for ${projectName}`,
        context: `Project structure has ${dirCount} entries. Framework: ${context.project.mainFramework || 'unknown'}. Technologies: ${context.technologies.join(', ')}`,
        relatedComponents: ['ProjectLoader', 'ContextBuilder'],
      },
    ]

    const result: RoleOutput = {
      role: 'architect' as RoleType,
      executedAt: new Date(),
      result: {
        status: 'analyzed',
        projectName,
        directoriesAnalyzed: dirCount,
        frameworkDetected: context.project.mainFramework || 'unknown',
        artifactsIdentified: artifacts.length,
      },
      artifacts,
      metadata: { consumed },  // For analysis
    }

    logger.info({
      msg: 'Architect role analysis complete (simulated)',
      consumedFields: consumed.context_fields.length,
    })
    return result
  }
}
