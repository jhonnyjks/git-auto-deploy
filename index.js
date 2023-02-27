// pm2 start index.js --name NodeAutoDeploy --time --watch --node-args="--max-old-space-size=4096" -- repo_relative_path deploy_type
const { simpleGit, SimpleGit, SimpleGitOptions } = require('simple-git');
const path = require("path");
const { exec } = require('child_process')
const fs = require('fs')


/////////////////////////////////////////////
///// Parâmetros de execução ////////////////
const REPO_DIR = process.argv.length > 1 ? '../' + process.argv[2] : false
const DEPLOY_TYPE = process.argv.length > 2 ? process.argv[3] : false

let repository;

const seed = () => {
    // Finaliza se REPO_DIR for inválido
    if (REPO_DIR === false || REPO_DIR.length === 0) {
        console.error('Invalid REPO_DIR: ' + REPO_DIR)
        return false
    }

    const options = {
        baseDir: path.resolve(__dirname, REPO_DIR),
        binary: 'git',
        maxConcurrentProcesses: 6,
        trimmed: false,
    }

    // when setting all options in a single object
    const git = simpleGit(options);

    console.log('REPO_DIR: ' + REPO_DIR, 'username: ' + process.env.USERNAME)

    // Loop de verificação
    intervalId = setInterval(() => {
        try {
            git.pull().then((result, opt) => {
                // console.log('//----', new Date(), '\n', result.toString())

                if (result && result.files && result.files.length > 0) {

                    if (DEPLOY_TYPE == 'react') {
                        console.log('--// AUTO DEPLOY REACT')

                        clearInterval(intervalId)

                        let actualDir = ''
                        const baseDirArray = options.baseDir.split('/')

                        for (let i = baseDirArray.length - 1; i >= 0; i--) {
                            baseDirArray.pop()
                            actualDir = baseDirArray.join('/')

                            if (fs.existsSync(actualDir + '/package.json')) {
                                console.log('Deploy in dir: ', actualDir);
                                break;
                            }
                        }

                        exec('npm --prefix ' + actualDir + ' run build', (err2, output2) => {
                            // once the command has completed, the callback function is called
                            if (err2) {
                                // log and return if we encounter an error
                                console.error("Erro ao executar comando 'run build': ", err2)
                                seed()
                                return
                            }
                            // log the output received from the command
                            console.log("Autodeploy result: \n", output2)
                            seed()
                        })
                    }
                }
            });
        } catch (error) {
            console.error('REPO_DIR: ' + REPO_DIR, 'username: ', error)
        }
    }, 10000)

}

seed()
