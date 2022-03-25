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
    docums: ['### 🐛**Docs**:\n'],
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
        return  issue ? `(${date}) **${author}**: #${issue} - ${body} [${tag}](${config}/${tag})\n` : `(${date}) **${author}**: ${body} [${tag}](${config}/${tag})\n`
    }
}

const dateRegex = /(\d{4}-\d{2}-\d{2})/
const typeRegex = /(feat|refactor|fix|docs|chore|perf|test):/
const issueRegex = /\(#(.+)\)/
const extractDate = /date={(.+?)}/
const extractAuthor = /author={(.+?)}/
const changelogNewVersion = `\n## Versão ${version}\n`

const execRegex = (validator, regex) => {
    return validator && regex ? regex : []
} 

const currentContent = existsChangelog ? fs.readFileSync(mdDir).toString().split('\n').filter((c) => c !== '') : null;
const dates = currentContent && currentContent.filter((c) => c.match(dateRegex)).map((d) => dateRegex.exec(d)[1])
const latestCommitDate = dates?.reduce((acc, curr) => {
    if (acc === '') acc = curr
    else if (acc < curr) acc = curr
    else if (acc > curr) acc = acc
    return acc
}, '')

const log = latestCommitDate && latestCommitDate !== '' ? `git log --after="${latestCommitDate} 23:59" --format=date={%as}author={%an}%B%H--DELIMITER--` : `git log --format=date={%as}author={%an}%B%H--DELIMITER--` 
const output = child.execSync(log).toString().split('--DELIMITER--\n')

async function versionator() {
    if (output.filter((a) => a !== '').length > 0) {
        const reader = existsChangelog ? fs.createReadStream(mdDir) : new Readable()
        if (existsChangelog) await unlinkPromised(mdDir)

        const writer = fs.createWriteStream(`${root}/CHANGELOG.md`, 'utf8')
        const changelogNewVersionRead = new Readable()
        const finalContentRead = new Readable()

        const commits = output.map((c) => {
            const [bodyRaw, tag] = c.split('\n')
        
            const type = execRegex(tag, typeRegex.exec(bodyRaw))
            const issue = execRegex(tag, issueRegex.exec(bodyRaw))
            const date = execRegex(tag, extractDate.exec(bodyRaw))
            const author = execRegex(tag, extractAuthor.exec(bodyRaw))
            
            const body = bodyRaw.replace(type[0], '').replace(issue[0], '').replace(date[0], '').replace(author[0], '').trim()
            
            return {body, tag, type: type[1], issue: issue[1], date: date[1], author: author[1], target: targets[type[1]]}
            
        }).filter(i => i.tag)
        
        commits.forEach((c) => c.type && mdCreator[c.type](mdCreator.build(c)))
        let finalContent = ''
        Object.values(targets).forEach((t) =>  mdCreator[t].length > 1 ? finalContent += mdCreator[t].join('\n') : null)


        changelogNewVersionRead.push(changelogNewVersion)
        finalContentRead.push(finalContent)
        
        changelogNewVersionRead.pipe(writer)
        finalContentRead.pipe(writer)
        reader.pipe(writer)
        
        changelogNewVersionRead.push(null)
        finalContentRead.push(null)

        
        console.table(commits)
        console.log(chalk.black.bgGreen.bold('Changelog update succesfully!'))
    } else {
        console.log(chalk.black.bgYellow.bold('Changelog is already updated with most recent commits!'))
    }
}
versionator()
module.exports = versionator