const fs = require('fs')
const child = require('child_process')
const config = require("./changelog.config.json").repository
const { dirname } = require('path');
const root = dirname(require.main.filename);
const version = require(`${root}/package.json`).version
const mdDir = `${root}/CHANGELOG.md`

const mdCreator =  {
    feats: ['## Features:\n'],
    fixes: ['## Fixes:\n'],
    refactors: ['## Refactors:\n'],
    docums: ['## Docs:\n'],
    chores: ['## Chore:\n'],
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
    build({ body, tag, issue, date, author }) {
        return  issue ? `(${date}) ${author}: [${issue}](${config}/${tag}) - ${body} ${config}/${tag}\n` : `(${date}) ${author}: ${body} ${config}/${tag}\n`
    }
}


const currentChangelog = fs.existsSync(mdDir);

// const output = child.execSync('git log --format=%B%H--DELIMITER--').toString().split('--DELIMITER--\n')
const output = child.execSync('git log --format=date={%as}author={%an}%B%H--DELIMITER--').toString().split('--DELIMITER--\n')

const changelog = `\n# Versão ${version}\n`

if (!currentChangelog) {
    fs.writeFileSync(mdDir, changelog)
    
} else {
    fs.appendFileSync(mdDir, changelog)
}

const execRegex = (validator, regex) => {
    return validator && regex ? regex : []
} 

const commits = output.map((c) => {
    const [bodyRaw, tag] = c.split('\n')

    const type = execRegex(tag, /(feat|refactor|fix|docs|chore|perf|test):/.exec(bodyRaw))
    const issue = execRegex(tag, /\(#(.+)\)/.exec(bodyRaw))
    const date = execRegex(tag,/date={(.+?)}/.exec(bodyRaw))
    const author = execRegex(tag,/author={(.+?)}/.exec(bodyRaw))
    
    const body = bodyRaw.replace(type[0], '').replace(issue[0], '').replace(date[0], '').replace(author[0], '').trim()
    
    return {body, tag, type: type[1], issue: issue[1], date: date[1], author: author[1]}
    
}).filter(i => i.tag)

commits.forEach((c) => mdCreator[c.type](mdCreator.build(c)))
const content = mdCreator.feats.join('\n')

fs.writeSync(fs.openSync(mdDir, 'a+'), content, 0, content.length, 0)

console.table(commits)