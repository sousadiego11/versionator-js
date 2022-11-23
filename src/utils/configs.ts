import root from './getRootPath.js'
import { readFileSync, existsSync } from 'fs'

const pckgDir = `${root}/package.json`
const cfgDir = `${root}/changelog.config.json`
const config = existsSync(cfgDir) && readFileSync(cfgDir).toString()
const packageJson = existsSync(pckgDir) && readFileSync(pckgDir).toString()
const commitsDir = config && JSON.parse(config).commits_dir
const issuesDir = config && JSON.parse(config).issues_dir
const changelogName = config && JSON.parse(config).changelog_name
const version = packageJson && JSON.parse(packageJson).version
const mdDir = `${root}/${changelogName || 'CHANGELOG'}.md`
const existsChangelog = existsSync(mdDir)
const newDir = existsChangelog ? `${root}/CHANGELOG2.md` : mdDir
const emojiRegex = /(:art:|:zap:|:fire:|:bug:|:sparkles:|:memo:|:rocket:|:tada:|:lipstick:|:ambulance:)/
const isoStringRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/m

const configs = {
  version,
  commitsDir,
  issuesDir,
  newDir,
  mdDir,
  existsChangelog,
  pckgDir,
  cfgDir,
  emojiRegex,
  isoStringRegex
}

export default configs
