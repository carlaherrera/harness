import { logger } from '../../utils/logger.js'
import type { IWorkflowEngine } from '../contracts/workflow-engine.js'
import type { RoleType } from '../contracts/role-runner.js'
import { ProjectLoader } from '../project-loader/index.js'
import { ContextBuilder } from '../context-builder/index.js'
import { RoleRunner } from '../role-runner/index.js'
import { MemoryWriter } from '../memory-writer/index.js'
import { ExecutionSnapshot } from '../execution-snapshot/index.js'
import { KnowledgeRegistry } from '../knowledge-registry/index.js'

export class WorkflowEngine implements IWorkflowEngine {
  private readonly executionSnapshot: ExecutionSnapshot
  private readonly knowledgeRegistry: KnowledgeRegistry
  private contextualArtifact: string | null = null

  constructor() {
    this.executionSnapshot = new ExecutionSnapshot()
    this.knowledgeRegistry = new KnowledgeRegistry()
  }

  async executeWithContext(
    projectPath: string,
    objective: string,
    roles: RoleType | RoleType[] = 'dev',
    artifactFilename: string
  ): Promise<void> {
    logger.info({
      msg: '📖 Loading contextual artifact for manual knowledge reuse',
      filename: artifactFilename,
    })

    const content = await this.knowledgeRegistry.loadArtifactContent(artifactFilename)
    if (content) {
      this.contextualArtifact = content
      logger.info({ msg: '✓ Artifact loaded successfully', filename: artifactFilename, size: content.length })
    } else {
      logger.warn({ msg: '⚠ Artifact not found or unreadable', filename: artifactFilename })
    }

    await this.execute(projectPath, objective, roles)
  }

  async execute(projectPath: string, objective: string, roles: RoleType | RoleType[] = 'dev'): Promise<void> {
    const startTime = Date.now()
    const roleList = Array.isArray(roles) ? roles : [roles]

    try {
      logger.info({
        msg: '▶ PIPELINE START',
        projectPath,
        objective,
        roles: roleList,
        timestamp: new Date().toISOString(),
      })

      // Stage 1: Project Loading
      logger.info({ msg: '  [1/4] ProjectLoader' })
      const projectLoader = new ProjectLoader()
      const metadata = await projectLoader.load(projectPath)

      // Stage 2: Context Building
      logger.info({ msg: '  [2/4] ContextBuilder' })
      const contextBuilder = new ContextBuilder()
      const context = await contextBuilder.build(metadata, objective)

      // Inject contextual artifact if loaded
      if (this.contextualArtifact) {
        context.additionalContext = this.contextualArtifact
      }

      // Stage 3: Sequential Role Execution
      logger.info({ msg: '  [3/4] RoleRunner' })
      const roleRunner = new RoleRunner()
      const memoryWriter = new MemoryWriter()

      const collectedArtifacts: Array<{ role: string; filename: string }> = []

      for (const role of roleList) {
        logger.info({ msg: `    ├─ Executing: ${role.toUpperCase()}` })
        const roleStartTime = Date.now()
        const roleOutput = await roleRunner.run(context, role)
        const roleDurationMs = Date.now() - roleStartTime

        // Stage 4: Memory Persistence (after each role)
        const artifacts = roleOutput.artifacts || []
        if (artifacts.length > 0) {
          await memoryWriter.write(artifacts)
          logger.info({
            msg: `    └─ ${role.toUpperCase()} done`,
            artifactCount: artifacts.length,
            durationMs: roleDurationMs,
          })

          // Register artifacts in knowledge registry
          for (const artifact of artifacts) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            const filename = `${artifact.type}-${timestamp}.md`
            await this.knowledgeRegistry.register(artifact, filename, 'execution')
            collectedArtifacts.push({ role, filename })
          }
        } else {
          logger.info({
            msg: `    └─ ${role.toUpperCase()} done (no artifacts)`,
            durationMs: roleDurationMs,
          })
        }
      }

      // Record execution snapshot
      const durationMs = Date.now() - startTime
      logger.info({ msg: '  [4/4] ExecutionSnapshot' })
      const snapshot = await this.executionSnapshot.record({
        projectPath,
        objective,
        rolesExecuted: roleList,
        artifactCount: collectedArtifacts.length,
        artifacts: collectedArtifacts,
        status: 'success',
        durationMs,
      })

      logger.info({
        msg: '◀ PIPELINE COMPLETE',
        status: 'success',
        rolesExecuted: roleList.length,
        totalArtifacts: collectedArtifacts.length,
        durationMs,
        snapshotId: snapshot.id,
      })
    } catch (error) {
      const durationMs = Date.now() - startTime
      logger.error({
        msg: '◀ PIPELINE FAILED',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        durationMs,
      })

      // Record failed execution
      await this.executionSnapshot.record({
        projectPath,
        objective,
        rolesExecuted: roleList,
        artifactCount: 0,
        artifacts: [],
        status: 'failed',
        durationMs,
      })

      throw error
    }
  }
}
