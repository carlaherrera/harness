import type { Context } from '../../core/contracts/context-builder.js'
import type { RoleOutput, RoleType } from '../../core/contracts/role-runner.js'
import type { KnowledgeArtifact } from '../../core/contracts/memory-writer.js'

export class DevRole {
  async execute(context: Context): Promise<RoleOutput> {
    console.log(`[Dev Role] Executing for project: ${context.project.name}`)
    console.log(`[Dev Role] Objective: ${context.objective}`)

    // Analyze project structure
    console.log(`[Dev Role] Technologies: ${context.technologies.join(', ') || 'none'}`)
    console.log(`[Dev Role] Package manager: ${context.project.packageManager}`)
    console.log(`[Dev Role] Available scripts: ${Object.keys(context.project.scripts).join(', ') || 'none'}`)

    // Report conventions
    if (Object.keys(context.conventions).length > 0) {
      console.log('[Dev Role] Detected conventions:')
      for (const [key, value] of Object.entries(context.conventions)) {
        console.log(`  - ${key}: ${value}`)
      }
    }

    // Report constraints
    if (context.constraints.length > 0) {
      console.log('[Dev Role] Constraints:')
      for (const constraint of context.constraints) {
        console.log(`  - ${constraint}`)
      }
    }

    // Report loaded files
    console.log(`[Dev Role] Context includes ${context.relevantFiles.length} files:`)
    for (const file of context.relevantFiles) {
      console.log(`  - ${file.name} (${file.relevance})`)
    }

    // Extract knowledge artifacts: identify learned patterns
    const artifacts: KnowledgeArtifact[] = []

    // If project uses TypeScript, record that convention
    if (context.technologies.includes('TypeScript')) {
      artifacts.push({
        type: 'convention',
        description: 'Project uses TypeScript for type safety',
        context: `Detected in package.json and tsconfig.json. Implies strict type checking enabled.`,
        relatedComponents: ['ProjectLoader', 'ContextBuilder'],
      })
    }

    // If project uses specific package manager, record that
    if (context.project.packageManager === 'pnpm') {
      artifacts.push({
        type: 'convention',
        description: 'Project uses pnpm as package manager',
        context: `Detected pnpm-lock.yaml. Implies strict dependency resolution.`,
        relatedComponents: ['ProjectLoader'],
      })
    }

    // Record identified constraints as learning
    if (context.constraints.length > 0) {
      artifacts.push({
        type: 'learning',
        description: `Project has ${context.constraints.length} constraint(s)`,
        context: `Constraints: ${context.constraints.join('; ')}. Future development should address these.`,
        relatedComponents: ['ContextBuilder'],
      })
    }

    // Result: analysis summary
    const result: RoleOutput = {
      role: 'dev' as RoleType,
      executedAt: new Date(),
      result: {
        status: 'analyzed',
        projectName: context.project.name,
        technologiesCount: context.technologies.length,
        constraintsCount: context.constraints.length,
        filesAnalyzed: context.relevantFiles.length,
        artifactsIdentified: artifacts.length,
      },
      artifacts,
    }

    console.log(`[Dev Role] ✓ Analysis complete (${artifacts.length} artifacts identified)`)
    return result
  }
}
