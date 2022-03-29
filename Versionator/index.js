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
const pipelinePromised = promisify(pipeline)
const existsChangelog = fs.existsSync(mdDir)
const newDir = existsChangelog ? `${root}/CHANGELOG2.md` : mdDir
const execRegex = require('../utils/execRegex')
const streamToString = require('../utils/streamToString')

class Versionator {
    commits = []
    oldContent = ''
    commitsOutput = []
    finalContent = ''
    mostRecentDate = ''

    async init() {
        await this.setOldContent()
        this.setMostRecentDate()
        this.setCommitsOutput()
        this.buildCommits()
    }

    async build() {
        
        await this.init()

        if (!this.hasCommitsOutput() && this.isAllInvalidCommits()) {
            console.log(chalk.black.bgYellow.bold('Changelog is already updated with most recent commits!'))
            return
        }

        this.buildChangelogContent()
        console.log(this.finalContent)
        await this.runPipelines()

        if (existsChangelog) {
            await unlinkPromised(mdDir)
            await renamePromised(`${root}/CHANGELOG2.md`, mdDir)
        }

        console.table(this.commits)
        console.log(chalk.black.bgGreen.bold('Changelog update succesfully!'))
    }
    
    hasCommitsOutput() {
        return this.commitsOutput.filter((a) => a !== '').length > 0
    }

    isAllInvalidCommits() {
        return this.commits.every((c) => !c.type)
    }

    setCommitsOutput() {
        const text = this.oldContent.split('\n').join('')
        
        const foundDate = existsChangelog ? new Date(/@(.+?)@/m.exec(text)[1]) : ''
        const validDate = foundDate && foundDate !== ''

        if (validDate) foundDate.setSeconds(foundDate.getSeconds() + 1)

        const log = validDate ? `git log --since="${foundDate.toISOString()}" --format=date={%as}author={%an}%s--DIVISOR--%h--DELIMITER--` : `git log --format=date={%as}author={%an}%s--DIVISOR--%h--DELIMITER--` 
        const output = child.execSync(log).toString().split('--DELIMITER--\n')
        this.commitsOutput = output
    }

    setMostRecentDate() {
        const date = child.execSync('git log -1 --format=%aI').toString()
        this.mostRecentDate = date
    }

    async setOldContent() {
        const readableOldChangelog = existsChangelog ? fs.createReadStream(mdDir, 'utf8') : new Readable({
            read() {
                this.push(null)
            }
        })
        const result = await streamToString(readableOldChangelog)
        this.oldContent = result
    }
    
    buildCommits() {
        const result = this.commitsOutput.map((c) => {
            const [bodyRaw, tag] = c.split('--DIVISOR--')
            
            const type = execRegex(tag, /(feat|refactor|fix|docs|chore|perf|test)(\(.+\))?:/.exec(bodyRaw))
            const issue = execRegex(tag, /\(#(.+)\)/.exec(bodyRaw))
            const date = execRegex(tag, /date={(.+?)}/.exec(bodyRaw))
            const author = execRegex(tag, /author={(.+?)}/.exec(bodyRaw))
            
            const body = bodyRaw.replace(type[0], '').replace(issue[0], '').replace(date[0], '').replace(author[0], '').trim()
            
            return {body, tag, type: type[1], issue: issue[1], date: date[1], author: author[1], target: targets[type[1]]}
            
        }).filter(i => i.tag)

        this.commits = result
    }

    isValidCommits() {
        if (this.commits.every((c) => !c.type)) {
            console.log(chalk.black.bgYellow.bold('Changelog is already updated with most recent commits!'))
            return false
        }

        return true
    }

    buildChangelogContent() {
        this.commits.forEach((c) => c.type && ContentBuilder[c.type](ContentBuilder.build(c)))
        Object.values(targets).forEach((t) =>  ContentBuilder[t].length > 1 ? this.finalContent += ContentBuilder[t].join('\n') : null)
    }

    async runPipelines() {
        const date = this.mostRecentDate
        const finalContent = this.finalContent
        const oldContent = this.oldContent

        const readableNewVersion = new Readable({
            read() {
                this.push(`<!-- @${date}@ -->\n## Versão ${version} \n`)
                this.push(null)
            }
        })
        
        const readableNewContent = new Readable({
            read() {
                this.push(finalContent)
                this.push(null)
            }
        })
        
        const readableOldContent = new Readable({
            read() {
                this.push(oldContent)
                this.push(null)
            }
        })
        
        await pipelinePromised(readableNewVersion, fs.createWriteStream(newDir, {
            flags: 'a+',
            encoding: 'utf8'
        }))
        
        await pipelinePromised(readableNewContent, fs.createWriteStream(newDir, {
            flags: 'a+',
            encoding: 'utf8'
        }))
        
        await pipelinePromised(readableOldContent, fs.createWriteStream(newDir, {
            flags: 'a+',
            encoding: 'utf8'
        }))
    }
}

module.exports = Versionator