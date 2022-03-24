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
    build({ body, tag, issue }) {
        return  issue ? `(${issue}) - ${body} ${config}/${tag}\n` : `${body} ${config}/${tag}\n`
    }
}


const currentChangelog = fs.existsSync(mdDir);
const output = child.execSync('git log --format=%B%H--DELIMITER--').toString().split('--DELIMITER--\n')

const changelog = `\n# Versão ${version}\n\n`

if (!currentChangelog) {
    fs.writeFileSync(mdDir, changelog)
    
} else {
    fs.appendFileSync(mdDir, changelog)
}

const commits = output.map((c) => {
    const [body, tag] = c.split('\n')

    const type = tag && /(feat|refactor):/.exec(body) ? /(feat|refactor):/.exec(body) : []
    const issue = tag && /\(#(.+)\)/.exec(body) ? /\(#(.+)\)/.exec(body) : []

    return {body, tag, type: type[1], issue: issue[1]}
    
}).filter(i => i.tag)

commits.forEach((c) => mdCreator[c.type](mdCreator.build(c)))
const content = mdCreator.feats.join('\n')

fs.appendFileSync(mdDir, content)

console.table(commits)