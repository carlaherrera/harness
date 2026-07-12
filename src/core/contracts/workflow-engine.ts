export interface IWorkflowEngine {
  execute(projectPath: string, objective: string): Promise<void>
}
