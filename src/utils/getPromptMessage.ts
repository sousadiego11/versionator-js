import chalk from 'chalk'

const { black } = chalk

const getPromptMessage = (url: string, target: string) => black.bgYellow.bold(`URL for your repository ${target} \n`) + `Confirm the detected URL: "${url}" - or type the URL: `

export default getPromptMessage
