import { ResolverRole } from './dist/roles/resolver/resolver.js';
import { DevRole } from './dist/roles/dev/dev.js';

async function run() {
  const resolver = new ResolverRole();
  const dev = new DevRole();
  
  const context = {
    project: { name: 'test', scripts: {} },
    technologies: [],
    relevantFiles: [],
    constraints: [],
    conventions: {},
    additionalContext: JSON.stringify({
      artifacts: [
        { type: "decision", metadata: { type: "requires-resolution", target: "node-assumption" } },
        { type: "decision", metadata: { type: "requires-resolution", target: "database-assumption" } }
      ],
      rules: [
        { effect: "block", resource: "console.log" }
      ],
      constraints: [
        { type: "forbid", target: "node-assumption" },
        { type: "allow", target: "node-assumption" },
        { type: "forbid", target: "database-assumption" },
        { type: "allow", target: "database-assumption" }
      ]
    })
  };
  
  const resolverResult = await resolver.execute(context);
  console.log("--- RESOLVER RESULT ---");
  console.log(JSON.stringify(resolverResult, null, 2));
  
  // Forward resolution verbatim to DevRole as the pipeline would
  const newContextStr = JSON.stringify({
    ...JSON.parse(context.additionalContext),
    resolution: resolverResult.result.resolution
  });
  
  console.log("--- CONTEXT FORWARDED TO DEV ---");
  console.log(JSON.stringify(JSON.parse(newContextStr), null, 2));
  
  context.additionalContext = newContextStr;
  
  const devResult = await dev.execute(context);
  console.log("--- DEV RESULT ---");
  console.log(JSON.stringify(devResult, null, 2));
}

run();
