const fs = require("fs");
const {exec} = require("node:child_process");
const core = require('@actions/core');
const {createAppAuth} = require("@octokit/auth-app");
const readYamlFile = require('read-yaml-file');
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ });

const auth = createAppAuth({
  appId: 333730,
  privateKey: core.getInput('privateKey'),
  clientId: "Iv1.72ddee10ccf4895e",
  clientSecret: "6a0f566f9e6221a83895e00747be33bb32e3c39d",
});

async function getToken(){
  try{
    // Retrieve JSON Web Token (JWT) to authenticate as app
    const appAuthentication = await auth({ type: "app" });
    console.log(appAuthentication.token);
    const data = octokit.paginate("GET /orgs/orgjerome1/installation", {
      per_page: 10,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
        "Authorization": "Bearer " + appAuthentication.token
      },
    }, (response) => {
      console.log(response.data);
    });

  } catch (error){
    core.setFailed(error.message);
  }
}

function parseYAMLConfiguration  (configuration){
    for (var index in configuration){
        var token = getToken();
    }
}

try {
  readYamlFile('resources/yaml/configuration.yaml').then(data => {
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


