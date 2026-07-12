import type { IWorkflowEngine } from '../contracts/workflow-engine.js'
import { ProjectLoader } from '../project-loader/index.js'
import { ContextBuilder } from '../context-builder/index.js'
import { RoleRunner } from '../role-runner/index.js'
import { MemoryWriter } from '../memory-writer/index.js'

export class WorkflowEngine implements IWorkflowEngine {
  async execute(projectPath: string, objective: string): Promise<void> {
    try {
      console.log('\n========== HARNESS v0 PIPELINE ==========\n')

      // Stage 1: Project Loading
      console.log('→ STAGE 1: PROJECT LOADING')
      const projectLoader = new ProjectLoader()
      const metadata = await projectLoader.load(projectPath)
      console.log('✓ Project loaded\n')

      // Stage 2: Context Building
      console.log('→ STAGE 2: CONTEXT BUILDING')
      const contextBuilder = new ContextBuilder()
      const context = await contextBuilder.build(metadata, objective)
      console.log('✓ Context built\n')

      // Stage 3: Role Execution
      console.log('→ STAGE 3: ROLE EXECUTION')
      const roleRunner = new RoleRunner()
      const roleOutput = await roleRunner.run(context, 'dev')
      console.log('✓ Role executed\n')

      // Stage 4: Memory Persistence
      console.log('→ STAGE 4: MEMORY PERSISTENCE')
      const memoryWriter = new MemoryWriter()
      const artifacts = roleOutput.artifacts || []
      await memoryWriter.write(artifacts)
      console.log('✓ Knowledge persisted\n')

      console.log('========== PIPELINE COMPLETE ==========\n')
    } catch (error) {
      console.error('\n❌ PIPELINE FAILED')
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }
}
