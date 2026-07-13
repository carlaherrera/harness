export interface DirectoryStructure {
  [path: string]: 'file' | 'directory'
}

export interface RelevantFiles {
  packageJson?: string
  tsConfig?: string
  claudeMd?: string
  readme?: string
  others: string[]
}

export interface ScriptMap {
  [name: string]: string
}

export interface Observation {
  type: string
  value: string
}

export interface ProjectMetadata {
  path: string
  name: string
  structure: DirectoryStructure
  files: RelevantFiles
  technologies: string[]
  packageManager: 'npm' | 'pnpm' | 'yarn' | null
  scripts: ScriptMap
  mainFramework?: string
  observations: Observation[]
}

export interface IProjectLoader {
  load(projectPath: string): Promise<ProjectMetadata>
}
