import type { ProjectMetadata } from './project-loader'

export interface ConventionSet {
  namingConvention?: string
  codeStyle?: string
  testFramework?: string
  commitConvention?: string
}

export type Constraint = {
  type: 'forbid' | 'require' | 'allow'
  target: string
  source?: 'ArchitectRole' | 'ContextBuilder' | 'Unknown' | 'derived' | 'resolution'
  priority?: number
}

export interface FileContent {
  path: string
  name: string
  content: string
  relevance: 'high' | 'medium' | 'low'
}

export interface Context {
  objective: string
  project: ProjectMetadata
  technologies: string[]
  relevantFiles: FileContent[]
  constraints: string[]
  currentTask: string
  conventions: ConventionSet
  additionalContext?: string
}

export interface IContextBuilder {
  build(metadata: ProjectMetadata, objective: string): Promise<Context>
}
