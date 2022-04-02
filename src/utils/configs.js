import root from '../utils/getRootPath.js';
import { readFileSync, existsSync } from 'fs'

const config = readFileSync(`${root}/changelog.config.json`).toString()
const packageJson = readFileSync(`${root}/package.json`).toString()
const commitsDir = JSON.parse(config).commits_dir
const version = JSON.parse(packageJson).version
const mdDir = `${root}/CHANGELOG.md`
const existsChangelog = existsSync(mdDir)
const newDir = existsChangelog ? `${root}/CHANGELOG2.md` : mdDir

export const configs = {
    version,
    commitsDir,
    newDir,
    mdDir,
    existsChangelog
}