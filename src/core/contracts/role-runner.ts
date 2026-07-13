import type { Context } from './context-builder'
import type { KnowledgeArtifact } from './memory-writer'

export type RoleType = 'dev' | 'architect'

export type ExecutionStatus = 'success' | 'conflict' | 'error'

export interface RoleOutput {
  role: RoleType
  executedAt: Date
  result: {
    status: ExecutionStatus
    [key: string]: unknown
  }
  artifacts?: KnowledgeArtifact[]
}

export interface IRoleRunner {
  run(context: Context, role: RoleType): Promise<RoleOutput>
}
