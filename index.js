const fs = require("fs");
const {exec} = require("node:child_process");
const baseUrl = 'github.com';
const commonYmlPath = 'resources/yaml/common/';
const sokYmlPath = 'resources/yaml/sok/';
const core = require('@actions/core');
const {createAppAuth} = require("@octokit/auth-app");
const readYamlFile = require('read-yaml-file');
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  baseUrl: 'https://github.com/api/v3'
});

function getToken(){
  try{
     var appOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: core.getInput('appId'),
        privateKey: core.getInput('privateKey'),
      },
      baseUrl: 'https://github.com/api/v3',
    });
   
    //TO-DO: Retrieve installationId (of the specific organization)
    appOctokit.request('GET /app/installations', {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }, (response) => {
      console.log("Number installation: " + response.data.length);
    });

    var resp = appOctokit.auth({
      type: 'installation',
      installationId: data[0].id,
    });
    console.log(resp.token);
    return resp.token;
  } catch (error){
    core.setFailed(error.message);
  }
}

function parseYAMLConfiguration  (configuration){
    for (var index in configuration){
        if(configuration[index].owner=='SOK'){
          var token = getToken();
          //executeShellForAllRepository(configuration[index].owner, sokYmlPath, token);          
        } else {
          var token = getToken();
          console.log(configuration[index].owner)
          //executeShellForAllRepository(configuration[index].owner, commonYmlPath, token);
        }
    }
}

try {
  readYamlFile('resources/yaml/.yaml').then(data => {
    parseYAMLConfiguration(data);
  })
} catch (err) {
  core.setFailed(err.message);
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

function executeShellForAllRepository(owner, pathYaml, token){
    console.log("Update repository for organization: " + owner);
    const data = octokit.paginate("GET /orgs/{org}/repos", {
      org: owner,
      per_page: 100,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
        "Authorization" : "Token " + token
      },
    }, (response) => {
      console.log("Number of repository to update: " + response.data.length);
      //We need to get each data to get the name and the default branch of the repository
      for (const key in response.data) {
        if(response.data[key].name != ".github" && response.data[key].name != "repository_management" && !response.data[key].archived){
          console.log("Repository to update: " + response.data[key].name);
          executeShell(owner, response.data[key].name, pathYaml, response.data[key].default_branch, token);
        }
      }
    });
  }


