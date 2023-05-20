const { prompt } = require("inquirer");
const dbfunction = require("./helpers/dbquery.js");
const db = require("./config/connection.js");

db.connect((err) => {
  if (err) {
    console.log(err);
    return "Couldn't connect to the database";
  }
  queryPrompt();
});

//something to print horizontal lines with text for employee database

const queryPrompt = () => {
  prompt({
    name: "QueryList",
    type: "list",
    message: "What would you like to do?",
    choices: [
      "View departments",
      "View roles",
      "View employees",
      "Add department",
      "Add role",
      "Add employee",
      "Update an employee role",
      "Update employee manager",
      "View employees by manager",
      "View employees by department",
      "Delete employee",
      "Delete role",
      "Delete department",
      "Exit",
    ],
  }).then((answers) => {
    switch (answers.QueryList) {
      case "View departments":
        dbfunction.deptView(queryPrompt);
        break;
      case "View roles":
        dbfunction.roleView(queryPrompt);
        break;
      case "View employees":
        dbfunction.employeeView(queryPrompt);
        break;
      case "Add department":
        dbfunction.deptAdd(queryPrompt);
        break;
      case "Add role":
        dbfunction.roleAdd(queryPrompt);
        break;
      case "Add employee":
        dbfunction.employeeAdd(queryPrompt);
        break;
      case "Update an employee role":
        dbfunction.employeeUpdate(queryPrompt);
        break;
      case "Update employee manager":
        dbfunction.managerUpdate(queryPrompt);
        break;
      case "View employees by manager":
        dbfunction.viewByManager(queryPrompt);
        break;
      case "View employees by department":
        dbfunction.viewByDept(queryPrompt);
        break;
      case "Delete employee":
        dbfunction.employeeDelete(queryPrompt);
        break;
      case "Delete role":
        dbfunction.roleDelete(queryPrompt);
        break;
      case "Delete department":
        dbfunction.deptDelete(queryPrompt);
        break;
      case "Exit":
        dbfunction.exit();
        break;
    }
  });
};

module.exports = queryPrompt;
