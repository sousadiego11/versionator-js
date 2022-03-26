const { dirname } = require('path');
const root = dirname(require.main.filename);
const fs = require('fs')
const chalk = require('chalk')
const child = require('child_process');
const { Readable } = require('stream');
const { promisify } = require('util');
const config = require(`${root}/changelog.config.json`).commits_dir
const version = require(`${root}/package.json`).version
const mdDir = `${root}/CHANGELOG.md`
const unlinkPromised = promisify(fs.unlink)
const renamePromised = promisify(fs.rename)
const existsChangelog = fs.existsSync(mdDir)

const targets = {
    feat: 'feats',
    fix: 'fixes',
    refactor: 'refactors',
    docs: 'docums',
    chore: 'chores',
    perf: 'perfs',
    tests: 'tests',
}

const mdCreator =  {
    feats: ['### ✨**Features**:\n'],
    fixes: ['### 🐛**Fixes**:\n'],
    refactors: ['### 🔥**Refactors**:\n'],
    docums: ['### 📝**Docs**:\n'],
    chores: ['### 🔧**Chores**:\n'],
    perfs: ['### ⚡️**Perfs**:\n'],
    tests: ['### 🧪**Tests**:\n'],
    feat(e) {
        this.feats.push(e)
    },
    fix(e) {
        this.fixes.push(e)
    },
    refactor(e) {
        this.refactors.push(e)
    },
    docs(e) {
        this.docums.push(e)
    },
    chore(e) {
        this.chores.push(e)
    },
    perf(e) {
        this.perfs.push(e)
    },
    test(e) {
        this.tests.push(e)
    },
    build({ body, tag, issue, date, author }) {
        return  issue ? `${date} **${author}**: #${issue} - ${body} [${tag}](${config}/${tag})\n` : `${date} **${author}**: ${body} [${tag}](${config}/${tag})\n`
    }
}

const execRegex = (validator, regex) => {
    return validator && regex ? regex : []
}

const oldContent = existsChangelog ? fs.readFileSync(mdDir, 'utf8') : '' 
const text = existsChangelog && oldContent.split('\n').join('')
const foundDate = existsChangelog ? /@(.+)@/m.exec(text)[0] : ''
const mostRecentDate = child.execSync('git log -1 --format=%aI').toString()

const log = foundDate && foundDate !== '' ? `git log --since="${foundDate}" --format=date={%as}author={%an}%B%H--DELIMITER--` : `git log --format=date={%as}author={%an}%B%H--DELIMITER--` 
const output = child.execSync(log).toString().split('--DELIMITER--\n')

async function versionator() {
    if (output.filter((a) => a !== '').length > 0) {

        const readableOldContent = new Readable()
        const readableNewVersion = new Readable()
        const readableNewContent = new Readable()

        const endStreams = () => {
            readableNewVersion.push(null)
            readableNewContent.push(null)
            readableOldContent.push(null)
        }

        const writable = fs.createWriteStream(existsChangelog ? `${root}/CHANGELOG2.md` : mdDir, {
            flags: 'a+'
        })

        const commits = output.map((c) => {
            const [bodyRaw, tag] = c.split('\n')
            
            const type = execRegex(tag, /(feat|refactor|fix|docs|chore|perf|test):/.exec(bodyRaw))
            const issue = execRegex(tag, /\(#(.+)\)/.exec(bodyRaw))
            const date = execRegex(tag, /date={(.+?)}/.exec(bodyRaw))
            const author = execRegex(tag, /author={(.+?)}/.exec(bodyRaw))
            
            const body = bodyRaw.replace(type[0], '').replace(issue[0], '').replace(date[0], '').replace(author[0], '').trim()
            
            return {body, tag, type: type[1], issue: issue[1], date: date[1], author: author[1], target: targets[type[1]]}
            
        }).filter(i => i.tag)
        
        if (commits.length === 1 && !commits[0].type) {
            console.log(chalk.black.bgYellow.bold('Changelog is already updated with most recent commits!'))
            endStreams()
            return
        }
        
        commits.forEach((c) => c.type && mdCreator[c.type](mdCreator.build(c)))
        let finalContent = ''
        Object.values(targets).forEach((t) =>  mdCreator[t].length > 1 ? finalContent += mdCreator[t].join('\n') : null)
        
        readableNewVersion.push(`<!-- @${mostRecentDate}@ -->\n## Versão ${version} \n`)
        readableNewContent.push(finalContent)
        readableOldContent.push(oldContent)
        
        readableNewVersion.pipe(writable)
        readableNewContent.pipe(writable)
        readableOldContent.pipe(writable)

        endStreams()
        
        if (existsChangelog) {
            await unlinkPromised(mdDir)
            await renamePromised(`${root}/CHANGELOG2.md`, mdDir)
        }
        
        console.table(commits)
        console.log(chalk.black.bgGreen.bold('Changelog update succesfully!'))
    } else {
        console.log(chalk.black.bgYellow.bold('Changelog is already updated with most recent commits!'))
    }
}
versionator()
module.exports = versionator