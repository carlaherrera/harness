import { ResolverRole } from './dist/roles/resolver/resolver.js';
import { DevRole } from './dist/roles/dev/dev.js';
import { promises as fs } from 'fs';

async function runScenario(name, rulesConfig, initialContextStr) {
  console.log(`\n======================================================`);
  console.log(`=== SCENARIO: ${name}`);
  console.log(`======================================================\n`);
  
  await fs.writeFile('resolution-rules.json', JSON.stringify(rulesConfig, null, 2));
  
  const resolver = new ResolverRole();
  const dev = new DevRole();
  
  const context = {
    project: { name: 'test', scripts: {} },
    technologies: [],
    relevantFiles: [],
    constraints: [],
    conventions: {},
    additionalContext: initialContextStr
  };
  
  const resolverResult = await resolver.execute(context);
  console.log("--- RESOLVER RESULT ---");
  console.log(JSON.stringify(resolverResult, null, 2));
  
  const newContextStr = JSON.stringify({
    ...JSON.parse(context.additionalContext),
    resolutions: resolverResult.result.resolutions
  });
  
  context.additionalContext = newContextStr;
  
  const devResult = await dev.execute(context);
  console.log("--- DEV RESULT ---");
  console.log(JSON.stringify(devResult, null, 2));
}

async function runAll() {
  const commonContext = JSON.stringify({
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
  });

  await runScenario("A - Two valid resolutions", { "node-assumption": "forbid", "database-assumption": "allow" }, commonContext);
  await runScenario("B - Partial resolution", { "node-assumption": "forbid" }, commonContext);
  await runScenario("C - No valid rules", {}, commonContext);
  await runScenario("D - Invalid rule", { "node-assumption": 123 }, commonContext);
  
  await fs.writeFile('resolution-rules.json', '{}');
}

runAll();
