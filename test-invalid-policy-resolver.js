import { ResolverRole } from './dist/roles/resolver/resolver.js';

async function run() {
  const role = new ResolverRole();
  const context = {
    project: { name: 'test' },
    additionalContext: '{"artifacts":[{"type":"decision","metadata":{"type":"requires-resolution","target":"node-assumption"}}], "rules": [{"effect": "block", "resource": "console.log"}]}'
  };
  const result = await role.execute(context);
  console.log(JSON.stringify(result, null, 2));
}

run();
