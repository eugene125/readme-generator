const inquirer = require("inquirer");
const fs = require("fs");
const fetch = require("node-fetch");

// The idea of using a fetch here is credited to Kelly Jefferies and Daniel Norred
const fetchLicenses = async (license) => {
    // If the variable of licenseFetch is undefined, then the fetch searches for all possible licenses provided by the API. Otherwise, the fetch request searches for the user chosen license.
    let appendedLicense = license == undefined ? "" : `/${license}`
    // Once the user chooses a specific license, it is then appended to the end of the following URL.
    return fetch("https://api.github.com/licenses" + appendedLicense)
    .then(response => response.text())
    .then(text => JSON.parse(text))
};

const inquirerPrompts = async () => {
    // The allLicenses variable is saved as an array of all the available licenses as the user has not chosen one yet.
    let allLicenses = await fetchLicenses();
    let response = await inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "What is the title of your project?\n"
        },
        {
            type: "input",
            name: "description",
            message: "Please describe what your project does:\n"
        },
        {
            type: "input",
            name: "installation",
            message: "Please explain what needs to be installed:\n"
        },
        {
            type: "input",
            name: "usage",
            message: "What is your projects usage?\n"
        },
        {
            type: "input",
            name: "instructions",
            message: "Provide instructions on how your program works:\n"
        },
        {
            type: "input",
            name: "contributors",
            message: "Please, if any, list your contributors:\n"
        },
        {
            type: "list",
            name: "license",
            message: "Choose one of the following licenses",
            // The object of data is converted into an array of strings only containing the name of the licenses. That array is then sorted alphabetically.
            choices: allLicenses.map(i => i.name).sort((a, b) => a.localeCompare(b)),
        },
        {
            type: "input",
            name: "username",
            message: "What is your GitHub username?\n"
        },
        {
            type: "input",
            name: "email",
            message: "What is your email address?\n"
        },
    ])
    // Once the user chooses their desired license, it is then sent back to the original array of objects and the information regarding that specific license is given
    response.license = await fetchLicenses(allLicenses.filter(i => i.name == response.license)[0].key)

    fs.writeFileSync("README-test.md", createFile(response))
}

const createFile = (response) => (
    // The encodeURIComponent is formatting the resonse.license.name into a valid URL format so there are no errors when creating the badge
    `
[![License](https://img.shields.io/badge/License-${encodeURIComponent(response.license.name)}-Green)](${response.license.html_url})

# ${response.title} 

## Tabel of Contents:

- [Description](#description)
- [Installation Instructions](#installation-instructions)
- [Usage](#usage)
- [Contributors](#constributors)
- [Testing Instructions](#testing-instructions)
- [Questions](#questions)

## Description
${response.description}

## Installation Instructions
${response.installation}

## Usage
${response.usage}

## License
This project is licensed under ${response.license.name}: ${response.license.description}

## Contributors
${response.contributors}

## Testing Instructions
${response.instructions}

## Questions
If you have questions, you can contact me at the following:
- GitHub: [${response.username}](https://github.com/${response.username})
- Email: [${response.email}](mailto:${response.email})
    `
)
inquirerPrompts()