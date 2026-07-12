import { logger } from '../../utils/logger.js'
import type { Context } from '../../core/contracts/context-builder.js'
import type { RoleOutput, RoleType } from '../../core/contracts/role-runner.js'
import type { KnowledgeArtifact } from '../../core/contracts/memory-writer.js'

/**
 * Simulated Reviewer Role.
 * Reviews code quality, identifies issues and improvements.
 *
 * Purpose: Understand what information Reviewer needs from Context.
 */
export class ReviewerRoleSimulated {
  async execute(context: Context): Promise<RoleOutput> {
    logger.info({
      msg: 'Reviewer role executing (simulated)',
      project: context.project.name,
      objective: context.objective,
    })

    const consumed = {
      context_fields: [] as string[],
      data_accessed: [] as string[],
    }

    // Access: objective
    consumed.context_fields.push('objective')

    // Access: project.name
    consumed.context_fields.push('project.name')
    const projectName = context.project.name

    // Access: technologies (reviews against language conventions)
    consumed.context_fields.push('technologies')
    consumed.data_accessed.push(`reviewing code for: ${context.technologies.join(', ')}`)

    // Access: constraints (reviewer is interested in problems/gaps)
    consumed.context_fields.push('constraints')
    if (context.constraints.length > 0) {
      consumed.data_accessed.push(`considering constraints: ${context.constraints.length} found`)
    }

    // Access: conventions (reviewer checks alignment with project conventions)
    consumed.context_fields.push('conventions')
    const hasConventions = Object.keys(context.conventions).length > 0
    if (hasConventions) {
      consumed.data_accessed.push('checking alignment with conventions')
    }

    // Access: project.scripts (reviewer checks if CI/test scripts exist)
    consumed.context_fields.push('project.scripts')
    const hasTests = !!context.project.scripts.test
    consumed.data_accessed.push(`test script present: ${hasTests}`)

    // Access: relevantFiles (reads CLAUDE.md, package.json for quality standards)
    consumed.context_fields.push('relevantFiles')
    const claudeMd = context.relevantFiles.find((f) => f.name === 'CLAUDE.md')
    if (claudeMd) {
      consumed.data_accessed.push('found project guidelines')
    }

    // NOT accessed: project.path (doesn't need filesystem)
    // NOT accessed: project.structure (less relevant to code review)
    // NOT accessed: project.mainFramework (covered by technologies)
    // NOT accessed: packageManager (less relevant to code review)
    // NOT accessed: currentTask (uses objective)

    const artifacts: KnowledgeArtifact[] = [
      {
        type: 'review',
        description: `Code review for ${projectName}`,
        context: `Review against technologies: ${context.technologies.join(', ')}. Constraints to consider: ${context.constraints.length}. Conventions enforced: ${Object.keys(context.conventions).length}`,
        relatedComponents: ['ContextBuilder', 'DevRole'],
      },
    ]

    const result: RoleOutput = {
      role: 'reviewer' as RoleType,
      executedAt: new Date(),
      result: {
        status: 'reviewed',
        projectName,
        technologiesReviewed: context.technologies.length,
        constraintsCovered: context.constraints.length,
        conventionsChecked: Object.keys(context.conventions).length,
        artifactsIdentified: artifacts.length,
      },
      artifacts,
      metadata: { consumed },
    }

    logger.info({
      msg: 'Reviewer role analysis complete (simulated)',
      consumedFields: consumed.context_fields.length,
    })
    return result
  }
}
