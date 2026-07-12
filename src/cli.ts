#!/usr/bin/env node

import { Command } from 'commander'
import { WorkflowEngine } from './core/workflow-engine/index.js'

const program = new Command()

program
  .name('harness')
  .description('Orchestration engine for organizational roles')
  .version('0.1.0')

program
  .command('dev [projectPath]')
  .description('Run the Dev role on a project')
  .option('-o, --objective <objective>', 'Objective for the Dev role', 'Analyze project structure')
  .action(async (projectPath = process.cwd(), options) => {
    try {
      const engine = new WorkflowEngine()
      await engine.execute(projectPath, options.objective)
    } catch (error) {
      process.exit(1)
    }
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
