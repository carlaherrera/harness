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
    additionalContext: '{"artifacts":[{"type":"decision","metadata":{"type":"requires-resolution","target":"node-assumption"}}], "rules": [{"effect": "block", "resource": "console.log"}], "constraints": [{"type": "forbid", "target": "node-assumption"}, {"type": "allow", "target": "node-assumption"}]}'
  };
  
  // 1. Resolver detects conflict but ignores invalid policy
  const resolverResult = await resolver.execute(context);
  console.log("--- RESOLVER RESULT ---");
  console.log(JSON.stringify(resolverResult, null, 2));
  
  // 2. Dev runs with same context (conflict should still exist)
  const devResult = await dev.execute(context);
  console.log("--- DEV RESULT ---");
  console.log(JSON.stringify(devResult, null, 2));
}

run();
