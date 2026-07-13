import * as fs from 'fs/promises'
import * as path from 'path'
import { logger } from '../../utils/logger.js'

export interface ExecutionRecord {
  id: string
  timestamp: string
  projectPath: string
  objective: string
  rolesExecuted: string[]
  artifactCount: number
  artifacts: Array<{
    role: string
    filename: string
  }>
  status: 'success' | 'failed'
  durationMs: number
  memoryLocation: string
}

export class ExecutionSnapshot {
  private readonly snapshotDir: string

  constructor(snapshotDir: string = './memory/snapshots') {
    this.snapshotDir = snapshotDir
  }

  async record(data: Omit<ExecutionRecord, 'id' | 'timestamp' | 'memoryLocation'>): Promise<ExecutionRecord> {
    const timestamp = new Date().toISOString()
    const id = `exec-${timestamp.replace(/[:.]/g, '-')}`

    const record: ExecutionRecord = {
      id,
      timestamp,
      memoryLocation: this.snapshotDir,
      ...data,
    }

    try {
      await fs.mkdir(this.snapshotDir, { recursive: true })

      const filename = `${id}.json`
      const filepath = path.join(this.snapshotDir, filename)

      await fs.writeFile(filepath, JSON.stringify(record, null, 2), 'utf-8')

      logger.debug({ msg: 'Execution snapshot recorded', id, filepath })
    } catch (error) {
      logger.error({
        msg: 'Failed to record execution snapshot',
        error: error instanceof Error ? error.message : String(error),
      })
    }

    return record
  }

  async listSnapshots(): Promise<ExecutionRecord[]> {
    try {
      await fs.mkdir(this.snapshotDir, { recursive: true })
      const files = await fs.readdir(this.snapshotDir)

      const snapshots: ExecutionRecord[] = []
      for (const file of files.filter((f) => f.endsWith('.json'))) {
        const content = await fs.readFile(path.join(this.snapshotDir, file), 'utf-8')
        snapshots.push(JSON.parse(content))
      }

      return snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (error) {
      logger.error({
        msg: 'Failed to list execution snapshots',
        error: error instanceof Error ? error.message : String(error),
      })
      return []
    }
  }

  async getLatest(): Promise<ExecutionRecord | null> {
    const snapshots = await this.listSnapshots()
    return snapshots.length > 0 ? snapshots[0] : null
  }
}
