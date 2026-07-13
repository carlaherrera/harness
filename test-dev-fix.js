import { DevRole } from './dist/roles/dev/dev.js';

async function run() {
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
      ],
      resolution: {
        target: 'node-assumption',
        decision: 'forbid'
      }
    })
  };
  
  const devResult = await dev.execute(context);
  console.log("--- DEV RESULT ---");
  console.log(JSON.stringify(devResult, null, 2));
}
run();
