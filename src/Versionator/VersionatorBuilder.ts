import chalk from 'chalk'
import { execSync } from 'child_process'
import { createReadStream, createWriteStream, readFile, rename, unlink } from 'fs'
import { pipeline, Readable } from 'stream'
import { promisify } from 'util'
import { ContentBuilder } from '../ContentBuilder'
import configs from '../utils/configs.js'
import root from '../utils/getRootPath.js'
import promisedExec from '../utils/promisedExec.js'
import targets from '../utils/targets.js'
import { IVersionatorBuilder } from './interfaces/IVersionatorBuilder.js'

const { version, existsChangelog, newDir, mdDir, isoStringRegex } = configs

const { black } = chalk

const unlinkPromised = promisify(unlink)
const renamePromised = promisify(rename)
const readFilePromised = promisify(readFile)
const pipelinePromised = promisify(pipeline)

export class VersionatorBuilder implements IVersionatorBuilder {
  hasContents = false

  buildFinalContent () {
    let finalContent = ''
    // @ts-expect-error
    // eslint-disable-next-line no-return-assign
    Object.values(targets).forEach((t) => ContentBuilder[t].length > 1 ? finalContent += ContentBuilder[t].join('\n') : null)

    return finalContent
  }

  transformLogs (output: string) {
    const commits = ContentBuilder.buildCommits(output.split('--DELIMITER--\n'))
    // @ts-expect-error
    commits.forEach((c) => c.type && ContentBuilder[c.type](ContentBuilder.build(c)))
  }

  async getLog () {
    const data = existsChangelog && await readFilePromised(mdDir)
    const text = data?.toString('utf8').split('\n').join('')
    const date = isoStringRegex.exec(text);
    const foundDate = existsChangelog && (date != null) ? new Date(date[0]) : false

    if (foundDate) foundDate.setSeconds(foundDate.getSeconds() + 1)

    return foundDate ? `git log --since="${foundDate.toISOString()}" --date=short --format=date={%ad}author={%an}%s--DIVISOR--%h--DELIMITER--` : 'git log --date=short --format=date={%ad}author={%an}%s--DIVISOR--%h--DELIMITER--'
  }

  async handleFinish () {
    if (existsChangelog) {
      await unlinkPromised(mdDir)
      await renamePromised(`${root}/CHANGELOG2.md`, mdDir)
    }
    if (this.hasContents) {
      console.log(black.bgGreen.bold('Changelog update succesfully!'))
    } else {
      console.log(black.bgYellow.bold('Changelog is already updated with most recent commits!'))
    }
  }

  async setHeader () {
    const date = execSync('git log -1 --format=%aI').toString()
    const readableNewVersion = Readable.from(`<!-- @${date}@ LATEST-VERSION(DONT REMOVE THIS LINE)-->\n# ${version} \n`)

    await pipelinePromised(readableNewVersion, createWriteStream(newDir, {
      flags: 'a+',
      encoding: 'utf8'
    }))
  }

  async setNewContent () {
    const log = await this.getLog()
    await promisedExec(log, this.transformLogs)
    const finalContent = this.buildFinalContent()

    if (finalContent) {
      await this.setHeader()
      this.hasContents = true
    }

    const readableNewContent = Readable.from(finalContent)
    await pipelinePromised(readableNewContent, createWriteStream(newDir, {
      flags: 'a+',
      encoding: 'utf8'
    }))
  }

  async setPreviousContent () {
    const readableOldChangelog = existsChangelog ? createReadStream(mdDir, 'utf8') : Readable.from('')

    await pipelinePromised(readableOldChangelog, createWriteStream(newDir, {
      flags: 'a+',
      encoding: 'utf8'
    }))
  }
}
