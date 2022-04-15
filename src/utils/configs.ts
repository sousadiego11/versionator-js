import root from './getRootPath.js'
import { readFileSync, existsSync } from 'fs'

const pckgDir = `${root}/package.json`
const cfgDir = `${root}/changelog.config.json`
const config = existsSync(cfgDir) && readFileSync(cfgDir).toString()
const packageJson = existsSync(pckgDir) && readFileSync(pckgDir).toString()
const commitsDir = config && JSON.parse(config).commits_dir
const version = packageJson && JSON.parse(packageJson).version
const mdDir = `${root}/CHANGELOG.md`
const existsChangelog = existsSync(mdDir)
const newDir = existsChangelog ? `${root}/CHANGELOG2.md` : mdDir
const emojiRegex = /(:art:|:zap:|:fire:|:bug:|:sparkles:|:memo:|:rocket:|:tada:|:lipstick:|:ambulance:)/

const configs = {
  version,
  commitsDir,
  newDir,
  mdDir,
  existsChangelog,
  pckgDir,
  cfgDir,
  emojiRegex
}

export default configs
