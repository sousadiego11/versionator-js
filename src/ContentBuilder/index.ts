import execRegex from '../utils/execRegex.js'
import targets from '../utils/targets.js'
import configs from '../utils/configs.js'
import emojis from '../utils/emojis.js'
import { IContentBuilder } from './interfaces'

const { commitsDir, emojiRegex, issuesDir } = configs

const ContentBuilder: IContentBuilder = {
  feats: ['\n### ✨**Features**:\n'],
  fixes: ['\n### 🐛**Fixes**:\n'],
  refactors: ['\n### 🔥**Refactors**:\n'],
  docums: ['\n### 📝**Docs**:\n'],
  chores: ['\n### 🔧**Chores**:\n'],
  perfs: ['\n### ⚡️**Perfs**:\n'],
  tests: ['\n### 🧪**Tests**:\n'],

  feat (e: string) {
    this.feats.push(e)
  },
  fix (e: string) {
    this.fixes.push(e)
  },
  refactor (e: string) {
    this.refactors.push(e)
  },
  docs (e: string) {
    this.docums.push(e)
  },
  chore (e: string) {
    this.chores.push(e)
  },
  perf (e: string) {
    this.perfs.push(e)
  },
  test (e: string) {
    this.tests.push(e)
  },

  build ({ body, tag, issue, date, author }: IContentBuilder.BuildRequest) {
    const foundMatchEmoji = emojiRegex.exec(body)
    const emoji = (foundMatchEmoji != null) ? emojis[foundMatchEmoji[1] as keyof typeof emojis] : ''
    const newBody = body.replace(emojiRegex, '')

    return (issue !== '' && issue) ? `${date} **${author}**: [${issue}](${issuesDir}/${issue}) - ${emoji}${newBody} [${tag}](${commitsDir}/${tag})\n` : `${date} **${author}**: ${emoji}${newBody} [${tag}](${commitsDir}/${tag})\n`
  },
  buildCommits (commits: string[]) {
    return commits.map((c) => {
      const [bodyRaw, tag] = c.split('--DIVISOR--')

      const type = execRegex(tag, /(feat|refactor|fix|docs|chore|perf|test)(\(.+\))?:/.exec(bodyRaw))
      const issue = execRegex(tag, /\(#(.+)\)/.exec(bodyRaw))
      const date = execRegex(tag, /date={(.+?)}/.exec(bodyRaw))
      const author = execRegex(tag, /author={(.+?)}/.exec(bodyRaw))

      const body = bodyRaw.replace(type[0], '').replace(issue[0], '').replace(date[0], '').replace(author[0], '').trim()

      return { body, tag, type: type[1], issue: issue[1], date: date[1], author: author[1], target: targets[type[1] as keyof typeof targets] }
    }).filter(i => i.tag && i.tag)
  }
}

export default ContentBuilder
