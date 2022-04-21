
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
  const urlToValidateGit = getUrlGitRepo()
  return await new Promise((resolve) => {

    const configs: Config = {
      commits_dir: '',
      issues_dir: ''
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(black.bgYellow.bold('URL for your repository commits \n') + `Confirm the detected URL: "${urlToValidateGit}" - or type the URL: `, (commits_dir) => {
      configs.commits_dir = commits_dir || urlToValidateGit

      rl.setPrompt(black.bgYellow.bold('URL for your repository issues:'))
      rl.prompt()

      rl.on('line', (issue) => {
        configs.issues_dir = issue
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
