
const child = require('child_process');

const promisedExec = (cmd, transform, cb) => {
    const p = child.exec(cmd)

    return new Promise((resolve, reject) => {
        p.stdout.on('data', transform)
        p.stdout.on('error', reject)
        p.stdout.on('close', resolve)
    })
}

module.exports = promisedExec