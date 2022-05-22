import { writeFileSync } from 'fs'
import getPromptMessage from './getPromptMessage.js'
import getUrlGitRepo from './getUrlGitRepo.js'
import { Questions } from '../Questions'
import { Config } from './interfaces'
import configs from './configs'

const createInitialConfig = async () => {
  const commitsUrl = getUrlGitRepo('commits')
  const issuesUrl = getUrlGitRepo('issues')
  const directories: Config = {
    commits_dir: '',
    issues_dir: ''
  }
  const closeCallback = () => writeFileSync(configs.cfgDir, JSON.stringify(directories), { flag: 'a+' })
  const questions = new Questions(closeCallback)

  directories.commits_dir = await questions.newQuestion(getPromptMessage(commitsUrl, 'COMMITS')) || commitsUrl
  directories.issues_dir = await questions.newQuestion(getPromptMessage(issuesUrl, 'ISSUES')) || issuesUrl
  questions.close()
}

export default createInitialConfig
