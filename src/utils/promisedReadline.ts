
import chalk from 'chalk'
import { writeFileSync, PathOrFileDescriptor, readFileSync } from 'fs'
import readline from 'readline'
import root from './getRootPath.js'
import getUrlGitRepo from './getUrlGitRepo.js'

const { black } = chalk

type Config = {
  commits_dir: string
  issues_dir: string
}

const promisedReadline = async (cfgDir: PathOrFileDescriptor) => {
  const commitsUrl = getUrlGitRepo('commits')
  const issuesUrl = getUrlGitRepo('issues')

  return await new Promise((resolve) => {

    const configs: Config = {
      commits_dir: '',
      issues_dir: ''
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(black.bgYellow.bold('URL for your repository COMMITS \n') + `Confirm the detected URL: "${commitsUrl}" - or type the URL: `, (commits_dir) => {
      configs.commits_dir = commits_dir || commitsUrl

      rl.setPrompt(black.bgYellow.bold('URL for your repository ISSUES \n') + `Confirm the detected URL: "${issuesUrl}" - or type the URL: `)
      rl.prompt()

      rl.on('line', (issue) => {
        configs.issues_dir = issue || issuesUrl
        rl.close()
      })

    })

    rl.on('close', () => {
      writeFileSync(cfgDir, JSON.stringify(configs))
      resolve
    })
  })
}

export default promisedReadline
