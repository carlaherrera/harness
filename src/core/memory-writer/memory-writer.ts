import * as fs from 'fs/promises'
import * as path from 'path'
import { logger } from '../../utils/logger.js'
import type { KnowledgeArtifact, IMemoryWriter } from '../contracts/memory-writer.js'

export class MemoryWriter implements IMemoryWriter {
  private readonly memoryDir: string

  constructor(memoryDir: string = './memory') {
    this.memoryDir = memoryDir
  }

  async write(artifacts: KnowledgeArtifact[]): Promise<void> {
    logger.info({ msg: 'Persisting artifacts', count: artifacts.length })

    if (artifacts.length === 0) {
      logger.info({ msg: 'No artifacts to persist' })
      return
    }

    try {
      // Ensure memory directory exists
      await fs.mkdir(this.memoryDir, { recursive: true })

      // Persist each artifact
      for (const artifact of artifacts) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `${artifact.type}-${timestamp}.md`
        const filepath = path.join(this.memoryDir, filename)

        const content = this.formatArtifact(artifact)
        await fs.writeFile(filepath, content, 'utf-8')

        logger.debug({ msg: 'Artifact persisted', filename, type: artifact.type })
      }

      logger.info({ msg: 'All artifacts persisted', count: artifacts.length })
    } catch (error) {
      throw new Error(
        `Failed to write memory artifacts: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  private formatArtifact(artifact: KnowledgeArtifact): string {
    const header = `# ${artifact.type.charAt(0).toUpperCase() + artifact.type.slice(1)}`

    const description = `**Description:** ${artifact.description}`

    const context = `**Context:** ${artifact.context}`

    const related =
      artifact.relatedComponents && artifact.relatedComponents.length > 0
        ? `**Related Components:** ${artifact.relatedComponents.join(', ')}`
        : ''

    const timestamp = `Generated: ${new Date().toISOString()}`

    return [header, '', description, '', context, related, '', timestamp].filter(Boolean).join('\n')
  }
}
