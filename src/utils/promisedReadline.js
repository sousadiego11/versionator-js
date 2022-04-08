
import chalk from 'chalk';
import { writeFileSync } from 'fs';
import readline from 'readline'
import getUrlGitRepo from './getUrlGitRepo.js';

const { black } = chalk

const promisedReadline = async (cfgDir) => {
    const urlToValidateGit = getUrlGitRepo()
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        
        rl.question(black.bgYellow.bold(`URL for your repository commits \n`) + `Confirm the detected URL: "${urlToValidateGit}" - or type the URL: `, (commits_dir) => {
            writeFileSync(cfgDir, JSON.stringify({ commits_dir: commits_dir || urlToValidateGit }))
            rl.close();
        });
        rl.on('close', resolve)
    })
}

export default promisedReadline