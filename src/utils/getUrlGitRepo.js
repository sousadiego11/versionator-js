import { execSync } from 'child_process';

const getUrlGitRepo = async () => {
    const { stdout } = execSync('git ls-remote --get-url');
    if (stdout) {
        // Transform git url to https url (is needed to create the url accessible by the browser)
        return stdout.replace(/\n/g, '').replace('git@', 'https://').replace('com:', 'com/').replace('.git', '') + '/commits';
    }
    return;
};

export default getUrlGitRepo;