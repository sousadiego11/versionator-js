import { writeFileSync, PathOrFileDescriptor } from 'fs'
import readline from 'readline'
import getPromptMessage from './getPromptMessage.js'
import getUrlGitRepo from './getUrlGitRepo.js'

type Config = {
  commits_dir: string
  issues_dir: string
}

const promisedReadline = async (cfgDir: PathOrFileDescriptor) => {
  const commitsUrl = getUrlGitRepo('commits')
  const issuesUrl = getUrlGitRepo('issues')
  const configs: Config = {
    commits_dir: '',
    issues_dir: ''
  }

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(getPromptMessage(commitsUrl, 'COMMITS'), (commitsDir) => {
      configs.commits_dir = commitsDir || commitsUrl

      rl.setPrompt(getPromptMessage(issuesUrl, 'ISSUES'))
      rl.prompt()
      rl.on('line', (issue) => {
        configs.issues_dir = issue || issuesUrl
        rl.close()
      })
    })

    rl.on('close', () => {
      writeFileSync(cfgDir, JSON.stringify(configs), {
        flag: 'a+'
      })
      resolve(null)
    })
  })
}

export default promisedReadline
