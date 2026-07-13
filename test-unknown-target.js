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
      artifacts: [],
      rules: [],
      constraints: [
        { type: "forbid", target: "campaign-budget" },
        { type: "allow", target: "campaign-budget" }
      ]
    })
  };
  
  const devResult = await dev.execute(context);
  console.log("--- DEV RESULT ---");
  console.log(JSON.stringify(devResult, null, 2));
}

run();
