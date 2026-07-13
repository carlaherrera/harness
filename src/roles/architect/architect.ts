import { logger } from '../../utils/logger.js'
import type { Context } from '../../core/contracts/context-builder.js'
import type { RoleOutput, RoleType } from '../../core/contracts/role-runner.js'
import type { KnowledgeArtifact } from '../../core/contracts/memory-writer.js'

export class ArchitectRole {
  async execute(context: Context): Promise<RoleOutput> {
    logger.info({ msg: 'Architect role executing', project: context.project.name, objective: context.objective })

    const artifacts: KnowledgeArtifact[] = []

    // Analyze structure patterns
    logger.debug({
      msg: 'Analyzing project structure',
      technologies: context.technologies,
      filesCount: context.relevantFiles.length,
    })

    // Detect layering patterns from relevant files
    const sourceFiles = context.relevantFiles.filter((f) => f.relevance === 'high' || f.relevance === 'medium')
    const layeringPattern = this.analyzeLayering(sourceFiles)

    if (layeringPattern) {
      artifacts.push({
        type: 'convention',
        description: 'Project exhibits layered architecture pattern',
        context: `Detected from high-relevance files: ${layeringPattern.layers.join(' → ')}. Implies separation of concerns.`,
        relatedComponents: ['ProjectLoader', 'ContextBuilder'],
      })
    }

    // Detect technology stack coherence
    if (context.technologies.length > 0) {
      const stackCoherence = this.analyzeStackCoherence(context.technologies)

      artifacts.push({
        type: 'learning',
        description: `Technology stack exhibits ${stackCoherence} coherence`,
        context: `Technologies: ${context.technologies.join(', ')}. Coherence level informs architectural decisions.`,
        relatedComponents: ['ProjectLoader'],
      })
    }

    // Identify architectural constraints
    if (context.constraints.length > 0) {
      artifacts.push({
        type: 'learning',
        description: `Project has ${context.constraints.length} architectural constraint(s)`,
        context: `Constraints: ${context.constraints.join('; ')}. These shape valid architectural patterns.`,
        relatedComponents: ['ContextBuilder'],
      })
    }

    // Detect additional context handoff
    if (context.additionalContext) {
      try {
        const parsedContext = JSON.parse(context.additionalContext);
        if (parsedContext.constraints && Array.isArray(parsedContext.constraints)) {
          const hasForbidConsole = parsedContext.constraints.some((c: any) => c.type === 'forbid' && c.target === 'console.log');
          const hasAllowConsole = parsedContext.constraints.some((c: any) => c.type === 'allow' && c.target === 'console.log');

          if (hasForbidConsole && hasAllowConsole) {
            logger.warn({ msg: 'Architect conflict detected: forbid vs allow console.log' })
            artifacts.push({
              type: 'conflict-detected',
              description: 'Execution halted due to conflicting constraints',
              context: 'forbid vs allow on console.log',
              relatedComponents: ['ArchitectRole'],
            })
            return {
              role: 'architect' as RoleType,
              executedAt: new Date(),
              result: {
                status: 'conflict',
                projectName: context.project.name,
                technologiesCount: context.technologies.length,
                layersDetected: 0,
                constraintsCount: context.constraints.length,
                artifactsIdentified: artifacts.length,
              },
              artifacts,
            }
          }

          for (const constraint of parsedContext.constraints) {
            if (constraint.type === 'forbid' && constraint.target === 'console.log') {
              logger.info({ msg: 'Architect applying structured constraint: forbid console.log' })
              artifacts.push({
                type: 'architect-decision-check',
                description: 'console.log restriction acknowledged',
                context: `Constraint evaluated during architectural analysis.`,
                relatedComponents: ['ArchitectRole'],
              })
            }
          }
        }
      } catch (e) {
        logger.error({ msg: 'Failed to process structured context', error: e instanceof Error ? e.message : String(e) })
        return {
          role: 'architect' as RoleType,
          executedAt: new Date(),
          result: {
            status: 'error',
            projectName: context.project.name,
            technologiesCount: context.technologies.length,
            layersDetected: layeringPattern?.layers.length ?? 0,
            constraintsCount: context.constraints.length,
            artifactsIdentified: artifacts.length,
          },
          artifacts,
        }
      }
    }

    // Inject explicit decisions for the experiment
    artifacts.push({
      type: 'decision',
      description: 'DECISIONS:\n- Use Pino como logger padrão\n- Proibir uso de console.log\n- Centralizar configuração de logging\n- Padronizar níveis de log',
      context: 'Decisões arquiteturais obrigatórias e acionáveis para guiar a execução do Dev.',
      relatedComponents: ['Logger', 'DevRole'],
    })

    const result: RoleOutput = {
      role: 'architect' as RoleType,
      executedAt: new Date(),
      result: {
        status: 'success',
        projectName: context.project.name,
        technologiesCount: context.technologies.length,
        layersDetected: layeringPattern?.layers.length ?? 0,
        constraintsCount: context.constraints.length,
        artifactsIdentified: artifacts.length,
      },
      artifacts,
    }

    logger.info({
      msg: 'Architect role analysis complete',
      artifactsIdentified: artifacts.length,
      status: 'analyzed',
    })
    return result
  }

  private analyzeLayering(files: { path: string; name: string }[]): { layers: string[] } | null {
    const layers = new Set<string>()

    for (const file of files) {
      const parts = file.path.split('/')
      if (parts.length > 1) {
        const topLevel = parts[0]
        if (['src', 'lib', 'app', 'core', 'features', 'components', 'pages', 'api'].includes(topLevel)) {
          layers.add(topLevel)
        }
      }
    }

    return layers.size > 0 ? { layers: Array.from(layers) } : null
  }

  private analyzeStackCoherence(technologies: string[]): 'high' | 'medium' | 'low' {
    // Simple heuristic: frontend + backend + DB in same project = high coherence
    const hasFrontend = technologies.some((t) => ['React', 'Vue', 'Svelte', 'Angular'].includes(t))
    const hasBackend = technologies.some((t) => ['Node.js', 'Express', 'Fastify', 'Django', 'Flask'].includes(t))
    const hasDB = technologies.some((t) => ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL'].includes(t))

    if ((hasFrontend && hasBackend && hasDB) || (hasBackend && hasDB)) {
      return 'high'
    }
    if (hasFrontend && hasBackend) {
      return 'medium'
    }
    return 'low'
  }
}
