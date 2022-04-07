import chalk from 'chalk'
import { execSync } from 'child_process'
import { createReadStream, createWriteStream, readFile, rename, unlink, writeFileSync } from 'fs'
import { pipeline, Readable } from 'stream'
import { promisify } from 'util'

import ContentBuilder from '../ContentBuilder/index.js'
import root from '../utils/getRootPath.js'
import promisedExec from '../utils/promisedExec.js'
import promisedReadline from '../utils/promisedReadline.js'
import targets from '../utils/targets.js'
import { cfgDir, configs } from '../utils/configs.js';

const { version, existsChangelog, newDir, mdDir, commitsDir } = configs
const { black } = chalk

const unlinkPromised = promisify(unlink)
const renamePromised = promisify(rename)
const readFilePromised = promisify(readFile)
const pipelinePromised = promisify(pipeline)


class Versionator {
    hasContents = false
    configured = false

    async build() {
        this.existsConfig() 
        
        if (this.configured) {
            await this.setNewContent()
            await this.setPreviousContent()
            await this.handleFinish()
        }
    }
    
    buildFinalContent() {
        let finalContent = ''
        Object.values(targets).forEach((t) =>  ContentBuilder[t].length > 1 ? finalContent += ContentBuilder[t].join('\n') : null)
        
        return finalContent
    }

    transformLogs(output) {
        const commits = ContentBuilder.buildCommits(output.split('--DELIMITER--\n'))
        commits.forEach((c) => c.type && ContentBuilder[c.type](ContentBuilder.build(c)))
    }

    async existsConfig() {
        const configuring = process.argv[2] === 'init'

        if (!commitsDir && !configuring) {
            console.log(black.bgYellow.bold("changelog.config.json not found, please run 'versionator-js init' to configure your workspace!"))
            return
        }
        if (configuring && !commitsDir) {   
            await promisedReadline(cfgDir)
            return
        }
        this.configured = true
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
                this.push(`<!-- @${date}@ -->\n# ${version} \n`)
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