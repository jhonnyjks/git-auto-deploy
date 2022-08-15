// pm2 start index.js --name NodeAutoDeploy --time --watch --node-args="--max-old-space-size=4096" -- repo_relative_path
const nodegit = require("nodegit");
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

// Open a repository that needs to be fetched and fast-forwarded
nodegit.Repository.open(path.resolve(__dirname, REPO_DIR))
  .then(function(repo) {
    repository = repo;

    console.log('REPO_DIR: ' + REPO_DIR, 'username: ' + process.env.USERNAME)

    // Loop de verificação
    setInterval( () => {
        try {
            repository.fetchAll({
                callbacks: {
                    credentials: function(url, userName) {
                    return nodegit.Cred.sshKeyFromAgent(userName);
                    },
                    certificateCheck: function() {
                    return 0;
                    }
                }
            })
            // Now that we're finished fetching, go ahead and merge our local branch
            // with the new one
            .then(function() {
                return repository.getCurrentBranch()
                .then(function(branch) {
                    return repository.mergeBranches(branch.shorthand(), "origin/" + branch.shorthand());
                });
            })
        } catch (error) {
            console.error('REPO_DIR: ' + REPO_DIR, 'username: ', error)
        }
    }, 30000)
  })
}

seed()
