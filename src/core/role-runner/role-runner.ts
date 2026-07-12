import type { Context } from '../contracts/context-builder.js'
import type { RoleType, RoleOutput, IRoleRunner } from '../contracts/role-runner.js'
import { DevRole } from '../../roles/dev/index.js'

export class RoleRunner implements IRoleRunner {
  async run(context: Context, role: RoleType): Promise<RoleOutput> {
    console.log(`[RoleRunner] Running role: ${role}`)

    switch (role) {
      case 'dev': {
        const devRole = new DevRole()
        return devRole.execute(context)
      }
      default: {
        throw new Error(`Unknown role: ${role}`)
      }
    }
  }
}
