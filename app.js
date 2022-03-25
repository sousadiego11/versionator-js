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

const datergx = /([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?/m
const text = existsChangelog && fs.readFileSync(mdDir).toString().split('\n').join('')
const foundDate = existsChangelog ? datergx.exec(text)[0] : ''
const mostRecentDate = child.execSync('git log -1 --format=%aI').toString()

const log = foundDate && foundDate !== '' ? `git log --after="${foundDate}" --format=date={%as}author={%an}%B%H--DELIMITER--` : `git log --format=date={%as}author={%an}%B%H--DELIMITER--` 
const output = child.execSync(log).toString().split('--DELIMITER--\n')

async function versionator() {
    if (output.filter((a) => a !== '').length > 0) {
        const readable = new Readable()
        const changelogNewVersionRead = new Readable()
        const finalContentRead = new Readable()

        const endStreams = () => {
            changelogNewVersionRead.push(null)
            finalContentRead.push(null)
            readable.push(null)
        }

        if (existsChangelog) readable.push(fs.readFileSync(mdDir, 'utf-8'))

        
        
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
        
        
        const writable = fs.createWriteStream(existsChangelog ? `${root}/CHANGELOG2.md` : mdDir, {
            flags: 'a+'
        })
        
        changelogNewVersionRead.push(`<!-- ${mostRecentDate} -->\n## Versão ${version} \n`)
        finalContentRead.push(finalContent)
        
        changelogNewVersionRead.pipe(writable)
        finalContentRead.pipe(writable)
        readable.pipe(writable)
        
        endStreams()
        
        if (existsChangelog) {
            await unlinkPromised(mdDir)
            fs.renameSync(`${root}/CHANGELOG2.md`, mdDir)
        }

        console.table(commits)
        console.log(chalk.black.bgGreen.bold('Changelog update succesfully!'))
    } else {
        console.log(chalk.black.bgYellow.bold('Changelog is already updated with most recent commits!'))
    }
}
versionator()
module.exports = versionator