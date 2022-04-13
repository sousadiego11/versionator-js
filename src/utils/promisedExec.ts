
import { exec } from 'child_process'

const promisedExec = async (cmd: string, transform: (chunk: string) => void) => {
  const p = exec(cmd)

  return await new Promise((resolve, reject) => {
    if (p.stdout != null) {
      p.stdout.on('data', transform)
      p.stdout.on('error', reject)
      p.stdout.on('close', resolve)
    } else {
      reject('stdout is null')
    }
  })
}

export default promisedExec
