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
const execRegex = require('../utils/execRegex')

class Versionator {
    commits = []
    commitsOutput = []
    finalContent = ''
    mostRecentDate = ''

    async init() {
        this.setMostRecentDate()
        await this.setCommitsOutput()
        this.buildCommits()
    }

    async build() {
        
        await this.init()
        
        if (!this.hasCommitsOutput() || this.isAllInvalidCommits()) {
            console.log(chalk.black.bgYellow.bold('Changelog is already updated with most recent commits!'))
            return
        } else {
            this.buildChangelogContent()
        }
        
        await this.runPipelines()
        
        if (existsChangelog) {
            await unlinkPromised(mdDir)
            await renamePromised(`${root}/CHANGELOG2.md`, mdDir)
        }
        
        console.log(chalk.black.bgGreen.bold('Changelog update succesfully!'))
    }
    
    hasCommitsOutput() {
        return this.commitsOutput.filter((a) => a !== '').length > 0
    }
    
    isAllInvalidCommits() {
        return this.commits.every((c) => !c.type)
    }

    async setCommitsOutput() {
        const data = existsChangelog && await readFilePromised(mdDir)
        const text = data?.toString('utf8').split('\n').join('')
        const foundDate = existsChangelog ? new Date(/@(.+?)@/m.exec(text)[1]) : ''

        if (foundDate && foundDate !== '') foundDate.setSeconds(foundDate.getSeconds() + 1)

        const log = foundDate && foundDate !== '' ? `git log --since="${foundDate.toISOString()}" --format=date={%as}author={%an}%s--DIVISOR--%h--DELIMITER--` : `git log --format=date={%as}author={%an}%s--DIVISOR--%h--DELIMITER--` 
        const output = child.execSync(log).toString().split('--DELIMITER--\n')

        this.commitsOutput = output
    }

    setMostRecentDate() {
        const date = child.execSync('git log -1 --format=%aI').toString()
        this.mostRecentDate = date
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

        const readableOldChangelog = existsChangelog ? fs.createReadStream(mdDir, 'utf8') : new Readable({
            read() {
                this.push(null)
            }
        })

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
        
        await pipelinePromised(readableNewVersion, fs.createWriteStream(newDir, {
            flags: 'a+',
            encoding: 'utf8'
        }))
        
        await pipelinePromised(readableNewContent, fs.createWriteStream(newDir, {
            flags: 'a+',
            encoding: 'utf8'
        }))
        
        await pipelinePromised(readableOldChangelog, fs.createWriteStream(newDir, {
            flags: 'a+',
            encoding: 'utf8'
        }))
    }
}

module.exports = Versionator