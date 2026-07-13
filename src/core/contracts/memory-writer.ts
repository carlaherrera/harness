export type ArtifactType =
  | 'decision'
  | 'principle'
  | 'pattern'
  | 'convention'
  | 'learning'
  | 'handoff-detected'
  | 'violation-check'
  | 'requirement-check'
  | 'architect-decision-check'
  | 'conflict-detected'

export interface KnowledgeArtifact {
  type: ArtifactType
  description: string
  context: string
  relatedComponents?: string[]
  metadata?: unknown
}

export interface IMemoryWriter {
  write(artifacts: KnowledgeArtifact[]): Promise<void>
}
