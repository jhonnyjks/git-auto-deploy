// pm2 start index.js --name NodeAutoDeploy --time --watch --node-args="--max-old-space-size=4096" -- repo_relative_path deploy_type
const { simpleGit, SimpleGit, SimpleGitOptions } = require('simple-git');
const path = require("path");
const { exec } = require('child_process')
const fs = require('fs')


/////////////////////////////////////////////
///// Parâmetros de execução ////////////////
const REPO_DIR = process.argv.length > 1 ? '../' + process.argv[2] : false
const DEPLOY_TYPE = process.argv.length > 2 ? process.argv[3] : false

let reactDir = ''
let redeploy = false

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

                switch(DEPLOY_TYPE) {
                    case 'react':
                        const baseDirArray = options.baseDir.split('/')
                        // console.log('baseDirArray', baseDirArray)

                        for (let i = baseDirArray.length - 1; i >= 0; i--) {
                            reactDir = baseDirArray.join('/')
                            //console.log('reactDir', reactDir)

                            if (fs.existsSync(reactDir + '/package.json')) {

                                if (!fs.existsSync(reactDir + '/build/index.html')) {
                                    console.log('redeploy ' + DEPLOY_TYPE + ' on dir ' + reactDir)
                                    redeploy = true
                                }
                                break;
                            } else {
                                baseDirArray.pop()
                            }
                        }


                }

                if ((result && result.files && result.files.length > 0) || redeploy ) {

                    if (DEPLOY_TYPE == 'react') {
                        console.log('Deploy ' + DEPLOY_TYPE + ' in dir: ', reactDir)

                        //Matando a execução periódica para entrar no deploy
                        clearInterval(intervalId)
                        
                        exec('npm --prefix ' + reactDir + ' run build', (err2, output2) => {
                            // once the command has completed, the callback function is called
                            if (err2) {
                                // log and return if we encounter an error
                                console.error("Erro ao executar comando 'run build': ", err2)
                                seed()
                                return
                            }
                            // log the output received from the command
                            console.log((redeploy ? '[REDEPLOY] ' : '') + "Autodeploy result: \n", output2)
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
