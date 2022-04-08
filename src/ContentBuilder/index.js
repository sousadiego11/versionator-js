import execRegex from '../utils/execRegex.js';
import targets from '../utils/targets.js';
import configs from '../utils/configs.js';
import emojis from '../utils/emojis.js';

const { commitsDir, emojiRegex } = configs

const ContentBuilder =  {
    feats: ['\n### ✨**Features**:\n'],
    fixes: ['\n### 🐛**Fixes**:\n'],
    refactors: ['\n### 🔥**Refactors**:\n'],
    docums: ['\n### 📝**Docs**:\n'],
    chores: ['\n### 🔧**Chores**:\n'],
    perfs: ['\n### ⚡️**Perfs**:\n'],
    tests: ['\n### 🧪**Tests**:\n'],
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

        const foundMatchEmoji = emojiRegex.exec(body)
        const emoji = foundMatchEmoji ? emojis[foundMatchEmoji[1]] : ''
        const newBody = body.replace(emojiRegex, '')

        return  issue ? `${date} **${author}**: #${issue} - ${emoji}${newBody} [${tag}](${commitsDir}/${tag})\n` : `${date} **${author}**: ${emoji}${newBody} [${tag}](${commitsDir}/${tag})\n`
    },
    buildCommits(commits) {
        return commits.map((c) => {
            const [bodyRaw, tag] = c.split('--DIVISOR--')
            
            const type = execRegex(tag, /(feat|refactor|fix|docs|chore|perf|test)(\(.+\))?:/.exec(bodyRaw))
            const issue = execRegex(tag, /\(#(.+)\)/.exec(bodyRaw))
            const date = execRegex(tag, /date={(.+?)}/.exec(bodyRaw))
            const author = execRegex(tag, /author={(.+?)}/.exec(bodyRaw))
            
            const body = bodyRaw.replace(type[0], '').replace(issue[0], '').replace(date[0], '').replace(author[0], '').trim()
            
            return {body, tag, type: type[1], issue: issue[1], date: date[1], author: author[1], target: targets[type[1]]}
            
        }).filter(i => i.tag && i.tag)
    },
}

export default ContentBuilder