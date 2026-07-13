#!/usr/bin/env node

import { Command } from 'commander'
import { WorkflowEngine } from './core/workflow-engine/index.js'
import type { RoleType } from './core/contracts/role-runner.js'

const program = new Command()

program
  .name('harness')
  .description('Orchestration engine for organizational roles')
  .version('0.1.0')

program
  .command('dev [projectPath]')
  .description('Run the Dev role on a project')
  .option('-o, --objective <objective>', 'Objective for the Dev role', 'Analyze project structure')
  .option('--artifact <filename>', 'Load previous artifact as context (manual knowledge reuse)')
  .action(async (projectPath = process.cwd(), options) => {
    try {
      const engine = new WorkflowEngine()
      if (options.artifact) {
        await engine.executeWithContext(projectPath, options.objective, 'dev', options.artifact)
      } else {
        await engine.execute(projectPath, options.objective, 'dev')
      }
    } catch (error) {
      process.exit(1)
    }
  })

program
  .command('architect [projectPath]')
  .description('Run the Architect role on a project')
  .option('-o, --objective <objective>', 'Objective for the Architect role', 'Analyze project architecture')
  .option('--artifact <filename>', 'Load previous artifact as context (manual knowledge reuse)')
  .action(async (projectPath = process.cwd(), options) => {
    try {
      const engine = new WorkflowEngine()
      if (options.artifact) {
        await engine.executeWithContext(projectPath, options.objective, 'architect', options.artifact)
      } else {
        await engine.execute(projectPath, options.objective, 'architect')
      }
    } catch (error) {
      process.exit(1)
    }
  })

program
  .command('multi [projectPath]')
  .description('Run multiple roles sequentially on a project')
  .option('-o, --objective <objective>', 'Objective for analysis', 'Analyze project')
  .option('-r, --roles <roles...>', 'Roles to execute in sequence', ['dev'])
  .action(async (projectPath = process.cwd(), options) => {
    try {
      const roles = options.roles as RoleType[]
      const engine = new WorkflowEngine()
      await engine.execute(projectPath, options.objective, roles)
    } catch (error) {
      process.exit(1)
    }
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
