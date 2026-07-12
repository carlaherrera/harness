import { logger } from '../../utils/logger.js'
import type { IWorkflowEngine } from '../contracts/workflow-engine.js'
import { ProjectLoader } from '../project-loader/index.js'
import { ContextBuilder } from '../context-builder/index.js'
import { RoleRunner } from '../role-runner/index.js'
import { MemoryWriter } from '../memory-writer/index.js'

export class WorkflowEngine implements IWorkflowEngine {
  async execute(projectPath: string, objective: string): Promise<void> {
    try {
      logger.info({ msg: 'Pipeline starting', projectPath, objective })

      // Stage 1: Project Loading
      const projectLoader = new ProjectLoader()
      const metadata = await projectLoader.load(projectPath)

      // Stage 2: Context Building
      const contextBuilder = new ContextBuilder()
      const context = await contextBuilder.build(metadata, objective)

      // Stage 3: Role Execution
      const roleRunner = new RoleRunner()
      const roleOutput = await roleRunner.run(context, 'dev')

      // Stage 4: Memory Persistence
      const memoryWriter = new MemoryWriter()
      const artifacts = roleOutput.artifacts || []
      await memoryWriter.write(artifacts)

      logger.info({ msg: 'Pipeline complete', status: 'success' })
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
