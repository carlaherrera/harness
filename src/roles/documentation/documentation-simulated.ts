import { logger } from '../../utils/logger.js'
import type { Context } from '../../core/contracts/context-builder.js'
import type { RoleOutput, RoleType } from '../../core/contracts/role-runner.js'
import type { KnowledgeArtifact } from '../../core/contracts/memory-writer.js'

/**
 * Simulated Documentation Role.
 * Generates or validates project documentation.
 *
 * Purpose: Understand what information Documentation needs from Context.
 */
export class DocumentationRoleSimulated {
  async execute(context: Context): Promise<RoleOutput> {
    logger.info({
      msg: 'Documentation role executing (simulated)',
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

    // Access: project.path
    consumed.context_fields.push('project.path')

    // Access: technologies (document what tech is used)
    consumed.context_fields.push('technologies')
    consumed.data_accessed.push(`documenting tech stack: ${context.technologies.join(', ')}`)

    // Access: project.mainFramework (document framework)
    consumed.context_fields.push('project.mainFramework')
    if (context.project.mainFramework) {
      consumed.data_accessed.push(`framework section: ${context.project.mainFramework}`)
    }

    // Access: project.scripts (document how to run project)
    consumed.context_fields.push('project.scripts')
    consumed.data_accessed.push(`documenting available scripts: ${Object.keys(context.project.scripts).length} found`)

    // Access: relevantFiles (READ content for documentation)
    consumed.context_fields.push('relevantFiles')
    const readme = context.relevantFiles.find((f) => f.name === 'README.md')
    if (readme) {
      consumed.data_accessed.push('found existing README')
    }
    const claudeMd = context.relevantFiles.find((f) => f.name === 'CLAUDE.md')
    if (claudeMd) {
      consumed.data_accessed.push('found project guidelines (CLAUDE.md)')
    }

    // Access: conventions (document conventions)
    consumed.context_fields.push('conventions')
    if (Object.keys(context.conventions).length > 0) {
      consumed.data_accessed.push(`documenting conventions: ${Object.keys(context.conventions).length}`)
    }

    // NOT accessed: project.structure (less relevant to documentation generation)
    // NOT accessed: constraints (documentation focuses on current state, not problems)
    // NOT accessed: packageManager (less relevant to end-user docs)
    // NOT accessed: currentTask (uses objective)

    const artifacts: KnowledgeArtifact[] = [
      {
        type: 'documentation',
        description: `Documentation for ${projectName}`,
        context: `Project uses: ${context.technologies.join(', ')}. Framework: ${context.project.mainFramework || 'none'}. Scripts available: ${Object.keys(context.project.scripts).join(', ')}`,
        relatedComponents: ['ProjectLoader', 'ContextBuilder'],
      },
    ]

    const result: RoleOutput = {
      role: 'documentation' as RoleType,
      executedAt: new Date(),
      result: {
        status: 'documented',
        projectName,
        technologiesDocumented: context.technologies.length,
        scriptsDocumented: Object.keys(context.project.scripts).length,
        conventionsDocumented: Object.keys(context.conventions).length,
        artifactsIdentified: artifacts.length,
      },
      artifacts,
      metadata: { consumed },
    }

    logger.info({
      msg: 'Documentation role analysis complete (simulated)',
      consumedFields: consumed.context_fields.length,
    })
    return result
  }
}
