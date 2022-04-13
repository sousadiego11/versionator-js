import chalk from 'chalk'
import promisedReadline from './promisedReadline.js'
import configs from './configs.js'

// @ts-expect-error
const { black } = chalk

const { commitsDir, cfgDir } = configs

export const terminalHandler = async () => {
  const configuring = process.argv[2] === 'init'

  if (!commitsDir && !configuring) {
    console.log(black.bgYellow.bold("changelog.config.json not found, please run 'versionator-js init' or 'npx versionator-js init' to configure your workspace!"))
    return false
  }
  if (configuring && !commitsDir) {
    await promisedReadline(cfgDir)
    return false
  }
  return true
}
