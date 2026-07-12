export type ArtifactType =
  | 'decision'
  | 'principle'
  | 'pattern'
  | 'convention'
  | 'learning'

export interface KnowledgeArtifact {
  type: ArtifactType
  description: string
  context: string
  relatedComponents?: string[]
}

export interface IMemoryWriter {
  write(artifacts: KnowledgeArtifact[]): Promise<void>
}
