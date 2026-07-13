import { DevRole } from './dist/roles/dev/dev.js';

async function runScenario(name, constraintsList, resolutionsList) {
  console.log(`\n======================================================`);
  console.log(`=== SCENARIO: ${name}`);
  console.log(`======================================================\n`);
  
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
      constraints: constraintsList,
      resolutions: resolutionsList
    })
  };
  
  const devResult = await dev.execute(context);
  console.log("--- DEV RESULT ---");
  console.log(JSON.stringify(devResult, null, 2));
}

async function runAll() {
  await runScenario("A - Known engineering target", [
    { type: "forbid", target: "node-assumption" },
    { type: "allow", target: "node-assumption" }
  ], []);

  await runScenario("B - Unknown marketing target", [
    { type: "forbid", target: "campaign-budget" },
    { type: "allow", target: "campaign-budget" }
  ], []);

  await runScenario("C - Unknown target, no conflict", [
    { type: "allow", target: "campaign-budget" }
  ], []);

  await runScenario("D - Resolution applied", [
    { type: "forbid", target: "campaign-budget" },
    { type: "allow", target: "campaign-budget" }
  ], [
    { target: "campaign-budget", decision: "forbid" }
  ]);

  await runScenario("E - Two conflicting targets", [
    { type: "forbid", target: "campaign-budget" },
    { type: "allow", target: "campaign-budget" },
    { type: "forbid", target: "node-assumption" },
    { type: "allow", target: "node-assumption" }
  ], []);
}

runAll();
