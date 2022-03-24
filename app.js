const fs = require('fs')
const child = require('child_process')
const config = require("./changelog.config.json").repository
const { dirname } = require('path');
const root = dirname(require.main.filename);
const version = require(`${root}/package.json`).version
const mdDir = `${root}/CHANGELOG.md`

const mdCreator =  {
    feats: ['### ✨**Features**:\n'],
    fixes: ['### **Fixes**:\n'],
    refactors: ['### 🔥**Refactors**:\n'],
    docums: ['### **Docs**:\n'],
    chores: ['### **Chore**:\n'],
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
        return  issue ? `(${date}) **${author}**: ${issue} - ${body} [${tag}](${config}/${tag})\n` : `(${date}) **${author}**: ${body} [${tag}](${config}/${tag})\n`
    }
}

const dateRegex = /(\d{4}-\d{2}-\d{2})/
const typeRegex = /(feat|refactor|fix|docs|chore|perf|test):/
const issueRegex = /\(#(.+)\)/
const extractDate = /date={(.+?)}/
const extractAuthor = /author={(.+?)}/

const currentChangelog = fs.existsSync(mdDir) ? fs.readFileSync(mdDir).toString().split('\n').filter((c) => c !== '') : null;
const commitDates = currentChangelog && currentChangelog.filter((c) => c.match(dateRegex)).map((c) => dateRegex.exec(c)[1])
console.log("🚀 ~ file: app.js ~ line 38 ~ commitDates", commitDates)

const output = child.execSync('git log --format=date={%as}author={%an}%B%H--DELIMITER--').toString().split('--DELIMITER--\n')

const changelogNewVersion = `\n## Versão ${version}\n`

if (!currentChangelog) {
    fs.writeFileSync(mdDir, changelogNewVersion)
    
} else {
    fs.appendFileSync(mdDir, changelogNewVersion)
}

const execRegex = (validator, regex) => {
    return validator && regex ? regex : []
} 

const commits = output.map((c) => {
    const [bodyRaw, tag] = c.split('\n')

    const type = execRegex(tag, typeRegex.exec(bodyRaw))
    const issue = execRegex(tag, issueRegex.exec(bodyRaw))
    const date = execRegex(tag, extractDate.exec(bodyRaw))
    const author = execRegex(tag, extractAuthor.exec(bodyRaw))
    
    const body = bodyRaw.replace(type[0], '').replace(issue[0], '').replace(date[0], '').replace(author[0], '').trim()
    
    return {body, tag, type: type[1], issue: issue[1], date: date[1], author: author[1]}
    
}).filter(i => i.tag)

commits.forEach((c) => mdCreator[c.type](mdCreator.build(c)))
const content = mdCreator.feats.join('\n') + mdCreator.refactors.join('\n')

fs.writeSync(fs.openSync(mdDir, 'a+'), content, 0, content.length, 0)

console.table(commits)