const { prompt } = require("inquirer"); //require the prompt function from inquirer to allow the program to ask the user questions
const dbfunction = require("./helpers/dbquery.js"); // bring in my functions to make queries based on the prompt answer
const db = require("./config/connection.js"); //get the connection info to allow us to connect to database

db.connect((err) => {
  //make a connection to the db
  if (err) {
    console.log(err);
    return "Couldn't connect to the database"; //if we cant connect, tell the user that we couldnt connect and log the error for troubleshooting
  }
  queryPrompt(); //ask the user what they want to do if connection is successful
});

const queryPrompt = () => {
  prompt({
    //ask the user what they want to do
    name: "QueryList",
    type: "list",
    message: "What would you like to do?",
    choices: [
      //all the functions possible with the program
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
    //uses a switch - case function to proceed based on the answer from the prompt
    switch (answers.QueryList) {
      case "View departments": //if user selected X
        dbfunction.deptView(queryPrompt); //initialise the related function from the helper, and pass in the queryPrompt- this allows the query prompt to be called again without both files requiring eachother - this caused issues in development
        break; //end of case
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
