const { dirname } = require('path');
const root = dirname(require.main.filename);
const config = require(`${root}/changelog.config.json`).commits_dir

const ContentBuilder =  {
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

module.exports = ContentBuilder