import { WorkflowEngine } from './dist/core/workflow-engine/index.js';

async function run() {
  const engine = new WorkflowEngine();
  const context = '{"artifacts":[{"type":"decision","metadata":{"type":"requires-resolution","target":"node-assumption"}}], "rules": [{"effect": "block", "resource": "console.log"}], "constraints": [{"type": "forbid", "target": "node-assumption"}, {"type": "allow", "target": "node-assumption"}]}';
  await engine.execute('.', context, ['dev']);
}

run();
