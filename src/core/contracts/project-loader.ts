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

export interface ProjectMetadata {
  path: string
  name: string
  structure: DirectoryStructure
  files: RelevantFiles
  technologies: string[]
  packageManager: 'npm' | 'pnpm' | 'yarn'
  scripts: ScriptMap
  mainFramework?: string
}

export interface IProjectLoader {
  load(projectPath: string): Promise<ProjectMetadata>
}
