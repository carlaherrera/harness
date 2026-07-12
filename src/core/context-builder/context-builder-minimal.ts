import * as fs from 'fs/promises'
import * as path from 'path'
import { logger } from '../../utils/logger.js'
import type { Context, IContextBuilder, FileContent } from '../contracts/context-builder.js'
import type { ProjectMetadata } from '../contracts/project-loader.js'

/**
 * Experimental minimal ContextBuilder.
 * Organizes ONLY objective facts, NO interpretations.
 *
 * Removed:
 * - detectConventions()
 * - identifyConstraints()
 *
 * Purpose: Test if Dev Role can produce equivalent analysis from raw facts.
 */
export class ContextBuilderMinimal implements IContextBuilder {
  async build(metadata: ProjectMetadata, objective: string): Promise<Context> {
    logger.info({ msg: 'Building context (minimal)', objective })

    const relevantFiles = await this.readRelevantFiles(metadata)

    const result: Context = {
      objective,
      project: metadata,
      technologies: metadata.technologies,
      relevantFiles,
      constraints: [],  // EMPTY - not interpreted
      currentTask: objective,
      conventions: {},  // EMPTY - not interpreted
    }

    logger.info({
      msg: 'Context built (minimal)',
      filesLoaded: relevantFiles.length,
      conventionsDetected: 0,  // Always 0 - not interpreted
      constraintsIdentified: 0,  // Always 0 - not interpreted
    })
    return result
  }

  private async readRelevantFiles(metadata: ProjectMetadata): Promise<FileContent[]> {
    const files: FileContent[] = []

    const filesToRead = [
      { path: metadata.files.packageJson, relevance: 'high' as const },
      { path: metadata.files.tsConfig, relevance: 'high' as const },
      { path: metadata.files.claudeMd, relevance: 'high' as const },
      { path: metadata.files.readme, relevance: 'medium' as const },
    ].filter((f): f is { path: string; relevance: 'high' | 'medium' } => f.path !== undefined)

    for (const fileInfo of filesToRead) {
      try {
        const fullPath = path.join(metadata.path, fileInfo.path)
        const content = await fs.readFile(fullPath, 'utf-8')

        files.push({
          path: fileInfo.path,
          name: path.basename(fileInfo.path),
          content,
          relevance: fileInfo.relevance,
        })
      } catch {
        // File couldn't be read
      }
    }

    return files
  }
}
