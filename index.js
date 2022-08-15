// pm2 start index.js --name NodeAutoDeploy --time --watch --node-args="--max-old-space-size=4096" -- repo_relative_path
const { simpleGit, SimpleGit, SimpleGitOptions } = require('simple-git');
const path = require("path");


/////////////////////////////////////////////
///// Parâmetros de execução ////////////////
const REPO_DIR = process.argv.length > 1 ? '../' + process.argv[2] : false

let repository;

const seed = () => {
    // Finaliza se REPO_DIR for inválido
    if(REPO_DIR === false || REPO_DIR.length === 0) {
        console.error('Invalid REPO_DIR: ' + REPO_DIR)
        return false
    }

    const options = {
    baseDir: path.resolve(__dirname, REPO_DIR),
    binary: 'git',
    maxConcurrentProcesses: 6,
    trimmed: false,
    };

    // when setting all options in a single object
    const git = simpleGit(options);

    console.log('REPO_DIR: ' + REPO_DIR, 'username: ' + process.env.USERNAME)

    // Loop de verificação
    setInterval( () => {
        try {
            git.pull();
        } catch (error) {
            console.error('REPO_DIR: ' + REPO_DIR, 'username: ', error)
        }
    }, 30000)

}

seed()
