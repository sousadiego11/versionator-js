const ContentBuilder = require('../ContentBuilder')
const targets = require('../utils/targets')
const { dirname } = require('path');
const root = dirname(require.main.filename);
const fs = require('fs')
const chalk = require('chalk')
const child = require('child_process');
const { Readable, pipeline } = require('stream');
const { promisify } = require('util');
const version = require(`${root}/package.json`).version
const mdDir = `${root}/CHANGELOG.md`
const unlinkPromised = promisify(fs.unlink)
const renamePromised = promisify(fs.rename)
const readFilePromised = promisify(fs.readFile)
const pipelinePromised = promisify(pipeline)
const existsChangelog = fs.existsSync(mdDir)
const newDir = existsChangelog ? `${root}/CHANGELOG2.md` : mdDir
const promisedExec = require('../utils/promisedExec');

class Versionator {

    async build() {
        await this.setHeader()
        await this.setNewContent()
        await this.setPreviousContent()
        await this.handleFinish()
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

    async getLog() {
        let log
        
        const data = existsChangelog && await readFilePromised(mdDir)
        const text = data?.toString('utf8').split('\n').join('')
        const foundDate = existsChangelog && data.toString('utf8') ? new Date(/@(.+?)@/m.exec(text)[1]) : false
        
        if (foundDate) foundDate.setSeconds(foundDate.getSeconds() + 1)
        
        log = foundDate ? `git log --since="${foundDate.toISOString()}" --format=date={%as}author={%an}%s--DIVISOR--%h--DELIMITER--` : `git log --format=date={%as}author={%an}%s--DIVISOR--%h--DELIMITER--`
        return log
    }

    async handleFinish() {
        if (existsChangelog) {
            await unlinkPromised(mdDir)
            await renamePromised(`${root}/CHANGELOG2.md`, mdDir)
        }
    }
    
    async setHeader() {
        const date = child.execSync('git log -1 --format=%aI').toString()
        const readableNewVersion = new Readable({
            read() {
                this.push(`<!-- @${date}@ -->\n## Versão ${version} \n`)
                this.push(null)
            }
        })

        await pipelinePromised(readableNewVersion, fs.createWriteStream(newDir, {
            flags: 'a+',
            encoding: 'utf8'
        }))
    }

    async setNewContent() {
        const log = await this.getLog()
        await promisedExec(log, this.transformLogs)
        const finalContent = this.buildFinalContent()

        const readableNewContent = new Readable({
            read() {
                this.push(finalContent)
                this.push(null)
            }
        })

        await pipelinePromised(readableNewContent, fs.createWriteStream(newDir, {
            flags: 'a+',
            encoding: 'utf8'
        }))
    }
    
    async setPreviousContent() {
        const readableOldChangelog = existsChangelog ? fs.createReadStream(mdDir, 'utf8') : new Readable({
            read() {
                this.push(null)
            }
        })

        await pipelinePromised(readableOldChangelog, fs.createWriteStream(newDir, {
            flags: 'a+',
            encoding: 'utf8'
        }))
    }
}

module.exports = Versionator