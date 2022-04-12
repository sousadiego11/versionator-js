
import { exec } from 'child_process';

const promisedExec = (cmd: string, transform: (chunk: any) => void) => {
    const p = exec(cmd)

    return new Promise((resolve, reject) => {
        if(p.stdout) {
            p.stdout.on('data', transform)
            p.stdout.on('error', reject)
            p.stdout.on('close', resolve)
        } else {
            reject('stdout is null')
        }
    })
}

export default promisedExec