import * as fs from 'fs/promises'
import * as path from 'path'
import { logger } from '../../utils/logger.js'
import type { KnowledgeArtifact } from '../contracts/memory-writer.js'

export interface RegisteredKnowledge {
  id: string
  filename: string
  type: string
  description: string
  context: string
  timestamp: string
  source: string // 'execution' or 'manual'
}

export class KnowledgeRegistry {
  private readonly registryDir: string

  constructor(registryDir: string = './memory/registry') {
    this.registryDir = registryDir
  }

  async scan(): Promise<RegisteredKnowledge[]> {
    try {
      await fs.mkdir(this.registryDir, { recursive: true })

      const files = await fs.readdir(this.registryDir)
      const registry: RegisteredKnowledge[] = []

      for (const file of files.filter((f) => f.endsWith('.json'))) {
        const content = await fs.readFile(path.join(this.registryDir, file), 'utf-8')
        registry.push(JSON.parse(content))
      }

      logger.debug({ msg: 'Knowledge registry scanned', count: registry.length })
      return registry.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (error) {
      logger.error({
        msg: 'Failed to scan knowledge registry',
        error: error instanceof Error ? error.message : String(error),
      })
      return []
    }
  }

  async register(artifact: KnowledgeArtifact, filename: string, source: string = 'execution'): Promise<RegisteredKnowledge> {
    const id = `know-${filename.replace(/\.[^/.]+$/, '')}`
    const timestamp = new Date().toISOString()

    const entry: RegisteredKnowledge = {
      id,
      filename,
      type: artifact.type,
      description: artifact.description,
      context: artifact.context,
      timestamp,
      source,
    }

    try {
      await fs.mkdir(this.registryDir, { recursive: true })
      const filepath = path.join(this.registryDir, `${id}.json`)
      await fs.writeFile(filepath, JSON.stringify(entry, null, 2), 'utf-8')
      logger.debug({ msg: 'Knowledge registered', id, type: artifact.type })
    } catch (error) {
      logger.error({
        msg: 'Failed to register knowledge',
        error: error instanceof Error ? error.message : String(error),
      })
    }

    return entry
  }

  async findByType(type: string): Promise<RegisteredKnowledge[]> {
    const all = await this.scan()
    return all.filter((entry) => entry.type === type)
  }

  async findById(id: string): Promise<RegisteredKnowledge | null> {
    const all = await this.scan()
    return all.find((entry) => entry.id === id) || null
  }

  async loadArtifactContent(filename: string): Promise<string | null> {
    try {
      const cwd = process.cwd()
      const artifactPath = path.join(cwd, 'memory', filename)
      const content = await fs.readFile(artifactPath, 'utf-8')
      logger.debug({ msg: 'Artifact content loaded', filename, path: artifactPath })
      return content
    } catch (error) {
      logger.error({
        msg: 'Failed to load artifact content',
        filename,
        error: error instanceof Error ? error.message : String(error),
      })
      return null
    }
  }
}
