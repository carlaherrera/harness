import { logger } from '../../utils/logger.js'
import type { IWorkflowEngine } from '../contracts/workflow-engine.js'
import type { RoleType } from '../contracts/role-runner.js'
import { ProjectLoader } from '../project-loader/index.js'
import { ContextBuilder } from '../context-builder/index.js'
import { RoleRunner } from '../role-runner/index.js'
import { MemoryWriter } from '../memory-writer/index.js'

export class WorkflowEngine implements IWorkflowEngine {
  async execute(projectPath: string, objective: string, roles: RoleType | RoleType[] = 'dev'): Promise<void> {
    try {
      const roleList = Array.isArray(roles) ? roles : [roles]
      logger.info({ msg: 'Pipeline starting', projectPath, objective, roles: roleList })

      // Stage 1: Project Loading
      const projectLoader = new ProjectLoader()
      const metadata = await projectLoader.load(projectPath)

      // Stage 2: Context Building
      const contextBuilder = new ContextBuilder()
      const context = await contextBuilder.build(metadata, objective)

      // Stage 3: Sequential Role Execution
      const roleRunner = new RoleRunner()
      const memoryWriter = new MemoryWriter()

      for (const role of roleList) {
        logger.info({ msg: 'Executing role', role })
        const roleOutput = await roleRunner.run(context, role)

        // Stage 4: Memory Persistence (after each role)
        const artifacts = roleOutput.artifacts || []
        await memoryWriter.write(artifacts)
        logger.info({ msg: 'Role complete and artifacts persisted', role, artifactCount: artifacts.length })
      }

      logger.info({ msg: 'Pipeline complete', status: 'success', rolesExecuted: roleList })
    } catch (error) {
      logger.error({
        msg: 'Pipeline failed',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      throw error
    }
  }
}
