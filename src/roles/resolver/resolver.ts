import { promises as fs } from 'fs'
import { join } from 'path'
import { logger } from '../../utils/logger.js'
import type { Context } from '../../core/contracts/context-builder.js'
import type { RoleOutput, RoleType, ExecutionStatus } from '../../core/contracts/role-runner.js'

export class ResolverRole {
  async execute(context: Context): Promise<RoleOutput> {
    logger.info({ msg: 'Resolver role executing', project: context.project.name })

    const artifacts: any[] = [];
    const resolutions: Array<{target: string, decision: 'forbid' | 'allow' | 'require'}> = [];

    // Load external configuration
    let rules: Record<string, string> = {};
    try {
      const configPath = join(process.cwd(), 'resolution-rules.json');
      const content = await fs.readFile(configPath, 'utf-8');
      rules = JSON.parse(content);
    } catch (e) {
      logger.warn({ msg: 'No resolution-rules.json found or failed to parse' });
    }

    if (context.additionalContext) {
      try {
        const parsed = JSON.parse(context.additionalContext);

        // Find conflicts
        if (parsed.artifacts && Array.isArray(parsed.artifacts)) {
          const conflicts = parsed.artifacts.filter((a: any) =>
            a.type === 'decision' && a.metadata && a.metadata.type === 'requires-resolution'
          );

          for (const conflict of conflicts) {
            const target = conflict.metadata.target;
            let ruleApplied = false;

            if (rules[target] !== undefined) {
              const configuredDecision = rules[target];

              if (configuredDecision !== 'forbid' && configuredDecision !== 'allow' && configuredDecision !== 'require') {
                logger.error({ msg: `Invalid policy decision for ${target}: ${configuredDecision}. Expected 'forbid', 'allow', or 'require'. Ignoring rule.` });
              } else {
                logger.info({ msg: `Resolving conflict via config for ${target} -> ${configuredDecision}` })

                resolutions.push({
                  target: target,
                  decision: configuredDecision as 'forbid' | 'allow' | 'require'
                });

                artifacts.push({
                  type: 'decision',
                  description: 'Conflict resolved automatically via config',
                  context: `Set ${target} to ${configuredDecision}`,
                  relatedComponents: ['ResolverRole']
                });

                ruleApplied = true;
              }
            }

            if (!ruleApplied) {
              artifacts.push({
                type: 'unresolved-conflict',
                description: 'No resolution rule found',
                context: target,
                relatedComponents: ['ResolverRole']
              });
            }
          }
        }
      } catch (e) {
        // Ignore
      }
    }

    return {
      role: 'product' as RoleType, // Dummy role type
      executedAt: new Date(),
      result: {
        status: 'success' as ExecutionStatus,
        projectName: context.project.name,
        resolutions
      },
      artifacts
    };
  }
}
