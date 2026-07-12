import type { Context } from './context-builder'
import type { KnowledgeArtifact } from './memory-writer'

export type RoleType = 'dev' | 'architect'

export interface RoleOutput {
  role: RoleType
  executedAt: Date
  result: unknown
  artifacts?: KnowledgeArtifact[]
}

export interface IRoleRunner {
  run(context: Context, role: RoleType): Promise<RoleOutput>
}
