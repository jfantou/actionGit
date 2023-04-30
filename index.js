const { exec } = require('child_process');
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

try {
    //We need to parse the json file to have the list of repository to update
    var listRepository = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    for (const index in listRepository){
        console.log(listRepository[index].repo);
        executeShell(listRepository[index].repo);

    }

} catch (error) {
   core.setFailed(error.message);
}

function executeShell(repoName){
    var yourscript = exec('sh test.sh ' + repoName,
        (error, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
}
