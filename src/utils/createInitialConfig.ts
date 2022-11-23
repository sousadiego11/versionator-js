import { writeFileSync } from 'fs'
import getPromptMessage from './getPromptMessage.js'
import getUrlGitRepo from './getUrlGitRepo.js'
import { Questions } from '../Questions'
import { Config } from './interfaces'
import configs from './configs'
import chalk from 'chalk'

const createInitialConfig = async () => {
  const commitsUrl = getUrlGitRepo('commits')
  const issuesUrl = getUrlGitRepo('issues')
  const changelogName = 'CHANGELOG'
  const directories: Config = {
    commits_dir: '',
    issues_dir: '',
    changelog_name: ''
  }
  const closeCallback = () => writeFileSync(configs.cfgDir, JSON.stringify(directories), { flag: 'a+' })
  const questions = new Questions(closeCallback)

  directories.commits_dir = await questions.newQuestion(getPromptMessage(commitsUrl, 'COMMITS')) || commitsUrl
  directories.issues_dir = await questions.newQuestion(getPromptMessage(issuesUrl, 'ISSUES')) || issuesUrl
  directories.changelog_name = await questions.newQuestion(chalk.black.bgYellow.bold('Name for your changelog file \n') + 'Confirm the default name: "CHANGELOG" - or type the new name: ') || changelogName
  questions.close()
}

export default createInitialConfig
