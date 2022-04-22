import chalk from "chalk"

const { black } = chalk

const getPromptMessage = (url: string) => black.bgYellow.bold('URL for your repository COMMITS \n') + `Confirm the detected URL: "${url}" - or type the URL: `

export default getPromptMessage
