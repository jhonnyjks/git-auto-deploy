// pm2 start index.js --name AutoDeployAll --time --watch --node-args="--max-old-space-size=4096"
const { simpleGit, SimpleGit, SimpleGitOptions } = require('simple-git');
const path = require("path");
const { exec } = require('child_process')
const fs = require('fs')


/////////////////////////////////////////////
///// Parâmetros de execução ////////////////
const APPS = [
    {
        type: 'react',
        repoDir: '../client',
    },
    {
        type: 'react',
        repoDir: '../client/src/app',
        deployDir: '../client'
    },
    {
        type: 'laravel',
        repoDir: '../api'
    }
]

const seed = (appIndex) => {

    // when setting all options in a single object
    const git = simpleGit(
        {
            baseDir: path.resolve(__dirname, APPS[appIndex].repoDir),
            binary: 'git',
            maxConcurrentProcesses: 6,
            trimmed: false,
        }
    )

    console.log('Checking APPS['+appIndex+']: ', APPS[appIndex])

    const deployDir = APPS[appIndex].deployDir || APPS[appIndex].repoDir

    try {
        git.pull().then((result, opt) => {

            if ((result && result.files && result.files.length > 0) ) {

                switch(APPS[appIndex].type) {
                    // Deploy ReactJS
                    case 'react':
                        console.log('['+appIndex+'] Deploy ' + APPS[appIndex].type + ' in dir: ' + deployDir)

                        // Reinstall
                        return exec('npm --prefix ' + deployDir + ' install', (err2, output2) => {
                            // once the command has completed, the callback function is called
                            if (err2) {
                                // log and return if we encounter an error
                                console.error("Erro ao executar comando 'install': ", err2)
                                startSeed(appIndex+1)
                                return
                            }

                            // Rebuild
                            return exec('npm --prefix ' + deployDir + ' run build', (err2, output2) => {
                                // once the command has completed, the callback function is called
                                if (err2) {
                                    // log and return if we encounter an error
                                    console.error("Erro ao executar comando 'run build': ", err2)
                                    startSeed(appIndex+1)
                                    return
                                }
    
                                startSeed(appIndex+1)
                            })
                        })
                    
                    // TODO: Deploy Laravel reinstall & migration
                    /* case 'laravel':
                        console.log('['+appIndex+'] Deploy ' + APPS[appIndex].type + ' in dir: ' + deployDir)

                        return exec('npm --prefix ' + deployDir + ' run build', (err2, output2) => {
                            // once the command has completed, the callback function is called
                            if (err2) {
                                // log and return if we encounter an error
                                console.error("Erro ao executar comando 'run build': ", err2)
                                startSeed(appIndex+1)
                                return
                            }

                            startSeed(appIndex+1)
                        }) */
                }
            }

            // Fim do script, reinicia...
            startSeed(appIndex+1)
        })
    } catch (error) {
        console.error('APPS: ' + APPS, 'username: ', error)
        startSeed(appIndex+1)
        return
    }

}

// Start with delay
const startSeed = (appIndex, timeout = 10000) => {
    // Finaliza se APPS for inválido
    if (!APPS || APPS.length === 0) {
        console.error('Invalid APPS: ' + APPS)
        return false
    } else if( appIndex < APPS.length && !APPS[appIndex] ) {
        console.error('Invalid APP in appIndex = ' + appIndex, APPS)
        return false
    }

    setTimeout(() => seed(appIndex >= APPS.length ? 0 : appIndex), timeout)
}

startSeed(0)
