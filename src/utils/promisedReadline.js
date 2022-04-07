
import chalk from 'chalk';
import { writeFileSync } from 'fs';
import readline from 'readline'
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const { black } = chalk

const getUrlGitRepo = async () => {
    const { stdout } =  await execPromise('git ls-remote --get-url')
    if (stdout){
        // Transform git url to https url (is needed to create the url accessible by the browser)
        return stdout.replace(/\n/g, '').replace('git@', 'https://').replace('com:', 'com/').replace('.git', '')+'/commits'
    }
    return
}

const promisedReadline = async (cfgDir) => {
    const urlToValidateGit = await getUrlGitRepo()
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        
        rl.question(black.bgYellow.bold(
            `URL for your repository commits \nType enter to confirm the detected URL: "${urlToValidateGit}" - or retype the url:`
            ), (commits_dir) => {
            writeFileSync(cfgDir, JSON.stringify({ commits_dir: commits_dir || urlToValidateGit }))
            rl.write(urlToValidateGit);
            rl.close();
        });
        rl.on('close', resolve)
    })
}

export default promisedReadline