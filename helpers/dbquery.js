const { prompt } = require("inquirer"); // bring in inquirer as some prompts require additional input ( such as names or making the user select from a list)
const db = require("../config/connection.js"); //db settings to allow for queries

const spacer = (RequestTitle) => {
  //this basic function just adds some space the terminal to seperate requests in order to improve readibility
  console.log("");
  console.log("");
  console.log("--------");
  console.log(RequestTitle);
  console.log("--------");
};

//these functions are mostly of a similar structure, where they are different i will comment
const deptView = (queryPrompt) => {
  //brings in the queryPrompt that is entered into it in the index.js
  db.query(
    `SELECT dept_id AS "ID", dept_name AS "Department Name" FROM dept`, //query to select departments but give a more readable alias, converting dept_id to just "ID" as the user already knows they're looking at departments
    (err, result) => {
      if (err) throw err; //if the request doesnt work, show us the error
      // Adds space from previous query to make easier to read
      spacer("Departments");
      // Show results as table
      console.table(result);
      // ask again what the users wants to do next using the query prompt
      queryPrompt();
    }
  );
};
const roleView = (queryPrompt) => {
  db.query(
    `SELECT role.role_id AS 'ID', role.role_title AS 'Title', dept.dept_name AS 'Department', role.role_salary AS 'Salary' FROM role JOIN dept ON role.dept_id = dept.dept_id`, //selects role & uses a join to combine the dept table allowing it to display the department name instead of the dept_id number stored in the role table
    (err, result) => {
      if (err) throw err;
      // Adds space from previous query to make easier to read
      spacer("Roles");
      // Show results as table
      console.table(result);
      // ask again what the users wants to do
      queryPrompt();
    }
  );
};
const employeeView = (queryPrompt) => {
  db.query(
    `SELECT 
    employee.emp_id AS "ID", 
    employee.emp_fname AS "First Name", 
    employee.emp_lname AS "Surname", 
    role.role_title AS "Role", 
    dept.dept_name AS "Department", 
    role.role_salary AS "Salary", 
      CONCAT(manager.emp_fname, " ", manager.emp_lname) AS "Manager"
      FROM employee AS employee
      LEFT JOIN employee AS manager ON employee.manager_id = manager.emp_id
      JOIN role ON employee.role_id = role.role_id
      JOIN dept ON role.dept_id = dept.dept_id`,
    //gives alias to employee fields, concats the manager name so it only takes up 1 coloumn and joins the employee table to display the managers name instead of emp_id, joins both role and dept to show role title and dept_name instead of role_id/dept_id numbers
    (err, result) => {
      if (err) throw err;
      // Adds space from previous query to make easier to read
      spacer("Employees");
      // Show results as table
      console.table(result);
      // ask again what the users wants to do
      queryPrompt();
    }
  );
};

const deptAdd = (queryPrompt) => {
  spacer("Add a Department");
  prompt({
    //prompts the user to give a name for a new department, as departments dont belong to any other tables, we dont need to get any info from the db
    name: "dept",
    type: "input",
    message: "Name of new department?",
    validate: (answer) => {
      if (answer !== "") {
        //if answer isnt blank
        return true;
      }
      return "Please add the name of the department!";
    },
  }).then((answer) => {
    db.query(
      "INSERT INTO dept (dept_name) VALUES (?)", //insert in to the dept table a value
      [answer.dept], //value is answer from prompt
      (err, result) => {
        if (err) throw err; //let us know if it failed
        spacer("");
        console.log("Department successfully created");
        queryPrompt();
      }
    );
  });
};

const roleAdd = (queryPrompt) => {
  spacer("Add a new role");
  db.query("SELECT * FROM dept", (err, depts) => {
    //as roles belong to departments, we need a list of departments
    depts = depts.map((dept) => {
      //map the results to an array of object
      return {
        name: dept.dept_name,
        value: dept.dept_id,
      };
    });
    prompt([
      //ask the user the name of the role
      {
        name: "role",
        type: "input",
        message: "Name of new role?",
        validate: (answer) => {
          if (answer !== "") {
            //check if the user entered a blank feild
            return true;
          }
          return "Please add role name!";
        },
      },
      {
        //ask for the role salary
        name: "salary",
        type: "input",
        message: "New role Salary?",
        validate: (answer) => {
          if (isNaN(answer)) {
            //checks user enetered a number
            return (
              false,
              "Please add new role Salary! (and dont use a currency symbol)"
            );
          }
          return true;
        },
      },
      {
        //asks which department the role belongs to
        name: "dept",
        type: "list",
        message: "Which department does this role belong to?",
        choices: depts, //uses the list of departments we collected
      },
    ]).then((answers) => {
      db.query(
        //makes a new entry in the role table with all the required values obtained from the prompts above
        "INSERT INTO role (role_title, role_salary, dept_id) VALUES (?, ?, ?)",
        [answers.role, answers.salary, answers.dept], //enters the values from the prompt answers in place of the "?"

        (err, result) => {
          if (err) throw err;
          spacer("Role Created");
          queryPrompt();
        }
      );
    });
  });
};

const employeeAdd = (queryPrompt) => {
  spacer("Add an employee");
  db.query("SELECT * FROM role", (err, roles) => {
    //get roles as employees belong to roles
    roles = roles.map((role) => {
      //make an array of objects with the results
      return {
        name: role.role_title,
        value: role.role_id,
      };
    });
    db.query("SELECT * FROM employee", (err, managers) => {
      //get employees as employees belong to other employees (managers)
      managers = managers.map((employee) => {
        //make an array of objects with the results, the name is concated using + " " + to simplify display in a list
        return {
          name: employee.emp_fname + " " + employee.emp_lname,
          value: employee.emp_id,
        };
      });
      prompt([
        // ask for employee info and check its not blank,
        {
          name: "firstName",
          type: "input",
          message: "New employee first name?",
          validate: (answer) => {
            if (answer != "") {
              return true;
            }
            return "Please add employee first name";
          },
        },
        {
          name: "lastName",
          type: "input",
          message: "New employee surname?",
          validate: (answer) => {
            if (answer != "") {
              return true;
            }
            return "Please add employee surname";
          },
        },
        {
          //give user a list of roles we collected earlier
          name: "role",
          type: "list",
          message: "Select role",
          choices: roles,
        },
        {
          //give user a list of managers for the new employee - any current employee can be new employees manager
          name: "manager",
          type: "list",
          message: "Select Manager",
          choices: managers,
        },
      ]).then((answers) => {
        db.query(
          //make new record in employee table with all needed values
          "INSERT INTO employee (emp_fname, emp_lname, role_id, manager_id) VALUES (?, ?, ?, ?)",
          [answers.firstName, answers.lastName, answers.role, answers.manager], //get the values from the prompt answers
          (err, result) => {
            if (err) throw err;
            spacer("Employee created");
            queryPrompt();
          }
        );
      });
    });
  });
};
const employeeUpdate = (queryPrompt) => {
  spacer("Update an Employee's role");
  db.query("SELECT * FROM employee", (err, employees) => {
    //get a list of employees so we can select the one to move role
    if (err) throw err;
    employees = employees.map((employee) => {
      //create an array of objects for the employees, name concatted to allow for easier list usage
      return {
        name: employee.emp_fname + " " + employee.emp_lname,
        value: employee.emp_id,
      };
    });
    db.query("SELECT * FROM role", (err, roles) => {
      //get all the roles
      roles = roles.map((role) => {
        //make an array of objects with the roles
        return {
          name: role.role_title,
          value: role.role_id,
        };
      });
      prompt({
        //pick an employee from the list we made
        name: "employee",
        type: "list",
        message: "Select employee to update:",
        choices: employees,
      }).then((SelectedEmployee) => {
        //pass the answer as selectedEmployee
        prompt({
          name: "role",
          type: "list",
          message: "Select new role",
          choices: roles, //pick new role from the list
        }).then((SelectedRole) => {
          //pass the answer
          db.query(
            //update the employee to change the role to (new role) where the employee id matches the selectedEmployee
            "UPDATE employee SET role_id = (?) WHERE emp_id = (?)",
            [SelectedRole.role, SelectedEmployee.employee],
            (err, result) => {
              if (err) throw err;
              spacer(`Employee role changed`);
              queryPrompt();
            }
          );
        });
      });
    });
  });
};
const managerUpdate = (queryPrompt) => {
  spacer("Update an Employee's Manager");
  db.query("SELECT * FROM employee", (err, employees) => {
    //get a list of all employees
    if (err) throw err;
    employees = employees.map((employee) => {
      //map to an array of objects
      return {
        name: employee.emp_fname + " " + employee.emp_lname,
        value: employee.emp_id,
      };
    });
    prompt({
      name: "employee",
      type: "list",
      message: "Select employee to update manager:",
      choices: employees, //give user list of employees to pick from
    }).then((selectedEmployee) => {
      prompt({
        name: "manager",
        type: "list",
        message: "Select New manager:",
        choices: employees, //gives the list again, allowing user to select a new manager
      }).then((selectedManager) => {
        db.query(
          //update the employee to show new manager where the employee id matches the selectedEmployee
          "UPDATE employee SET manager_id = ? WHERE emp_id = ?",
          [selectedManager.manager, selectedEmployee.employee],
          (err, result) => {
            if (err) throw err;
            spacer(`Employee manager changed`);
            queryPrompt();
          }
        );
      });
    });
  });
};

const viewByManager = (queryPrompt) => {
  db.query(
    `SELECT 
    employee.*,
    CONCAT(manager.emp_fname, ' ', manager.emp_lname) AS Manager
FROM 
    employee
LEFT JOIN 
    employee AS manager ON employee.manager_id = manager.emp_id
WHERE 
    employee.manager_id IS NULL OR employee.emp_id IN (SELECT DISTINCT manager_id FROM employee)
ORDER BY 
    manager.emp_fname, manager.emp_lname;`,
    //select all employees, joining the employee table to itself to see manager names, and then selecting where the manager is null (top of ladder, everyone's boss) or all distinct or unique values in the manager coloumn, therefore only selecting those that appear as employees managers
    (err, Managers) => {
      if (err) throw err;

      Managers = Managers.map((manager) => {
        //map the results to an array of objects
        return {
          name: manager.emp_fname + " " + manager.emp_lname,
          value: manager.emp_id,
        };
      });
      prompt({
        name: "manager",
        type: "list",
        message: "Select manager",
        choices: Managers, //gives user the list to allow them to select a manager
      }).then((answer) => {
        db.query(
          //new query to select from employees where the manager matches the manager_id selected by user, employee is joined to show manager name rather than just id, also includes clause to catch user without a manager themselves
          `SELECT employee.*, CONCAT(manager.emp_fname, ' ', manager.emp_lname) AS Manager
          FROM employee
          JOIN employee AS manager ON employee.manager_id = manager.emp_id
          WHERE employee.manager_id = ${answer.manager}
          `,
          (err, results) => {
            if (err) throw err;
            spacer("Employees");
            console.table(results);
            queryPrompt();
          }
        );
      });
    }
  );
};
const viewByDept = (queryPrompt) => {
  db.query(`SELECT * FROM dept`, (err, Departments) => {
    //gets all departments in table
    if (err) throw err;
    Departments = Departments.map((depts) => {
      //maps to an array of objects
      return {
        name: depts.dept_name,
        value: depts.dept_id,
      };
    });
    prompt({
      name: "department",
      type: "list",
      message: "Select department",
      choices: Departments, //asks user to select from the departments we got from query
    }).then((answer) => {
      db.query(
        `SELECT employees_roles.*, dept.*
        FROM (
            SELECT employee.emp_id, employee.emp_fname, employee.emp_lname, employee.role_id, employee.manager_id, role.dept_id
            FROM employee 
            JOIN role ON employee.role_id = role.role_id 
            WHERE role.dept_id = ${answer.department}
        ) AS employees_roles 
        JOIN dept ON employees_roles.dept_id = dept.dept_id`,
        //select employees where the role they belong to belongs to the department we selected, we join the role table to access this info about the employee role
        (err, results) => {
          if (err) throw err;
          spacer("Employees");
          console.table(results);
          queryPrompt();
        }
      );
    });
  });
};
const employeeDelete = (queryPrompt) => {
  db.query("SELECT * FROM employee", (err, employees) => {
    //find all employees
    if (err) throw err;
    employees = employees.map((employee) => {
      //map to an array of objects
      return {
        name: employee.emp_fname + " " + employee.emp_lname,
        value: employee.emp_id,
      };
    });
    prompt({
      name: "delete",
      type: "list",
      message: "Select employee to delete",
      choices: employees, //select who to remove from the results we got earlier
    }).then((answers) => {
      db.query(
        //delete from employee where their id matches the selected id from the prompt answers, the on delete cascade also means anyone they manage will be deleted
        `DELETE FROM employee WHERE emp_id = ${answers.delete}`,
        (err, result) => {
          if (err) throw err;
          spacer("Employee deleted");
          queryPrompt();
        }
      );
    });
  });
};
const roleDelete = (queryPrompt) => {
  db.query("SELECT * FROM role", (err, roles) => {
    //select all roles
    if (err) throw err;
    roles = roles.map((role) => {
      //map to array of objects
      return {
        name: role.role_title,
        value: role.role_id,
      };
    });
    prompt({
      name: "delete",
      type: "list",
      message: "Select role to delete",
      choices: roles, //which role from the results we got do you want to remove
    }).then((answers) => {
      db.query(
        `DELETE FROM role WHERE role_id = ${answers.delete}`, //delete role that matches the selected role, ON DELETE CASCADE in the schema means any employee with this role will be deleted
        (err, result) => {
          if (err) throw err;
          spacer("Role deleted");
          queryPrompt();
        }
      );
    });
  });
};
const deptDelete = (queryPrompt) => {
  db.query("SELECT * FROM dept", (err, depts) => {
    //get all the departments
    if (err) throw err;
    depts = depts.map((dept) => {
      //map them to an array of objects
      return {
        name: dept.dept_name,
        value: dept.dept_id,
      };
    });
    prompt({
      name: "delete",
      type: "list",
      message: "Select department to delete",
      choices: depts, //pick from the results of the dept search
    }).then((answers) => {
      db.query(
        `DELETE FROM dept WHERE dept_id = ${answers.delete}`, //delete dept where id matches the selected option, ON DELETE CASCADE means all employees and roles belonging to this dept will be deleted
        (err, result) => {
          if (err) throw err;
          spacer("Department deleted");
          queryPrompt();
        }
      );
    });
  });
};

const exit = () => {
  db.end(); //cuts connection to the db
  spacer("Goodbye"); //says goodbye to the user
};

module.exports = {
  deptView,
  roleView,
  employeeView,
  deptAdd,
  roleAdd,
  employeeAdd,
  employeeUpdate,
  managerUpdate,
  viewByManager,
  viewByDept,
  employeeDelete,
  roleDelete,
  deptDelete,
  exit,
}; //exports all the functions to be used in the index.js
