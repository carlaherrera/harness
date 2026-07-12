import type { RoleType } from './role-runner'

export interface IWorkflowEngine {
  execute(projectPath: string, objective: string, roles?: RoleType | RoleType[]): Promise<void>
}
