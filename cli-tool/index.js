const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');

const formQuestions = [
  {
    name: 'problemURL',
    type: 'input',
    message: 'Enter the leetcode problem url:',
  },
  {
    name: 'name',
    type: 'input',
    message: 'Enter the problem custom name:',
    validate: (value) => {
      if (!value) {
        return 'Please enter a custom name for the problem...';
      }

      return true;
    },
  }
];

const parseInput = (results) => {
  results.name = (() => {
    const replacer = new RegExp(' ', 'g')
    return results.name.replace(replacer, '-').toLowerCase();
  })();

  return results;
};

const transformDashedIntoCamelCased = (dashedName) => {
  const stringAsList = dashedName.split('');
  let camelCasedString = '';
  for (let i = 0; i < stringAsList.length; i++) {
    const previousIsDash = (i > 0) ? stringAsList[i - 1] === '-' : false;
    if (stringAsList[i] !== '-' && stringAsList[i] !== ' ') {
      if (!previousIsDash) {
        camelCasedString += stringAsList[i];
      }
      else {
        camelCasedString += stringAsList[i].toUpperCase();
      }
    }
  }

  return camelCasedString;
};

const createProblemFolder = (problemName) => {
  const folderPath = `./problems/${problemName}`;

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
};

const createProblemFile = (problemName) => {
  return new Promise((resolve, reject) => {
    const filePath = `./problems/${problemName}/index.js`;
    fs.copyFile('./cli-tool/solve-file-template', filePath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
};

const replaceProblemInfoIntoItsFile = (problemUrl, camelCasedProblemName) => {
  const filePath = `./problems/${camelCasedProblemName}/index.js`;
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) {
        reject(err);
        return;
      }

      let fileData = data.replace(/sourceLine/g, `Problem source: ${problemUrl}`);
      fileData = fileData.replace(/problemSolverFunction/g, camelCasedProblemName);

      fs.writeFile(filePath, fileData, 'utf8', function (err) {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  });
};

const fetchCreationDataViaCli = async () => {
  const userInput = await inquirer.prompt(formQuestions);
  const parsedInput = parseInput(userInput);
  const camelCasedProblemName = transformDashedIntoCamelCased(parsedInput.name);

  createProblemFolder(camelCasedProblemName);
  await createProblemFile(camelCasedProblemName);
  await replaceProblemInfoIntoItsFile(userInput.problemURL, camelCasedProblemName);

  console.log(chalk.bold('Done! 😀✨'));
  return;
};

fetchCreationDataViaCli();