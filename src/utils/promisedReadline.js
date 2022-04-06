
import chalk from 'chalk';
import { writeFileSync } from 'fs';
import readline from 'readline'

const { black } = chalk

const promisedReadline = (cfgDir) => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(black.bgYellow.bold("URL for your repository commits:"), (commits_dir) => {
            writeFileSync(cfgDir, JSON.stringify({ commits_dir }))
            rl.close();
        });
        rl.on('close', resolve)
    })
}

export default promisedReadline