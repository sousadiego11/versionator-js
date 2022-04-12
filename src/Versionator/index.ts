import chalk from 'chalk'
import { execSync } from 'child_process'
import { createReadStream, createWriteStream, readFile, rename, unlink } from 'fs'
import { pipeline, Readable } from 'stream'
import { promisify } from 'util'

import ContentBuilder from '../ContentBuilder/index.js'
import root from '../utils/getRootPath.js'
import promisedExec from '../utils/promisedExec.js'
import targets from '../utils/targets.js'
import configs from '../utils/configs.js';
import { terminalHandler } from '../utils/terminalHandler.js'

const { version, existsChangelog, newDir, mdDir } = configs

//@ts-ignore
const { black } = chalk

const unlinkPromised = promisify(unlink)
const renamePromised = promisify(rename)
const readFilePromised = promisify(readFile)
const pipelinePromised = promisify(pipeline)


class Versionator {
    hasContents = false

    async build() {
        const configuredWorkspace = await terminalHandler() 
        
        if (configuredWorkspace) {
            await this.setNewContent()
            await this.setPreviousContent()
            await this.handleFinish()
        }
    }
    
    buildFinalContent() {
        let finalContent = ''
        //@ts-ignore
        Object.values(targets).forEach((t) =>  ContentBuilder[t].length > 1 ? finalContent += ContentBuilder[t].join('\n') : null)
        
        return finalContent
    }

    transformLogs(output: string) {
        const commits = ContentBuilder.buildCommits(output.split('--DELIMITER--\n'))
        //@ts-ignore
        commits.forEach((c) => c.type && ContentBuilder[c.type](ContentBuilder.build(c)))
    }

    async getLog() {
        let log
        
        const data = existsChangelog && await readFilePromised(mdDir)
        const text = data?.toString('utf8').split('\n').join('')
        const date = /@(.+?)@/m.exec(text)
        const foundDate = existsChangelog && date ? new Date(date[1]) : false
        
        if (foundDate) foundDate.setSeconds(foundDate.getSeconds() + 1)
        
        log = foundDate ? `git log --since="${foundDate.toISOString()}" --format=date={%as}author={%an}%s--DIVISOR--%h--DELIMITER--` : `git log --format=date={%as}author={%an}%s--DIVISOR--%h--DELIMITER--`
        return log
    }

    async handleFinish() {
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
    
    async setHeader() {
        const date = execSync('git log -1 --format=%aI').toString()
        const readableNewVersion = new Readable({
            read() {
                this.push(`<!-- @${date}@ LATEST-VERSION(DONT REMOVE THIS LINE)-->\n# ${version} \n`)
                this.push(null)
            }
        })

        await pipelinePromised(readableNewVersion, createWriteStream(newDir, {
            flags: 'a+',
            encoding: 'utf8'
        }))
    }

    async setNewContent() {
        const log = await this.getLog()
        await promisedExec(log, this.transformLogs)
        const finalContent = this.buildFinalContent()

        if (finalContent) {
            await this.setHeader()
            this.hasContents = true
        }

        const readableNewContent = new Readable({
            read() {
                this.push(finalContent)
                this.push(null)
            }
        })

        await pipelinePromised(readableNewContent, createWriteStream(newDir, {
            flags: 'a+',
            encoding: 'utf8'
        }))
    }
    
    async setPreviousContent() {
        const readableOldChangelog = existsChangelog ? createReadStream(mdDir, 'utf8') : new Readable({
            read() {
                this.push(null)
            }
        })

        await pipelinePromised(readableOldChangelog, createWriteStream(newDir, {
            flags: 'a+',
            encoding: 'utf8'
        }))
    }
}

export default Versionator