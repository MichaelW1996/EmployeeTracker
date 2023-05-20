const { prompt } = require("inquirer");
const db = require("../config/connection.js");

const spacer = (RequestTitle) => {
  console.log("");
  console.log("");
  console.log("--------");
  console.log(RequestTitle);
  console.log("--------");
};

const deptView = (queryPrompt) => {
  db.query(
    `SELECT dept_id AS "ID", dept_name AS "Department Name" FROM dept`,
    (err, result) => {
      if (err) throw err;
      // Adds space from previous query to make easier to read
      spacer("Departments");
      // Show results as table
      console.table(result);
      // ask again what the users wants to do
      queryPrompt();
    }
  );
};
const roleView = (queryPrompt) => {
  db.query(
    `SELECT role.role_id AS 'ID', role.role_title AS 'Title', dept.dept_name AS 'Department', role.role_salary AS 'Salary' FROM role JOIN dept ON role.dept_id = dept.dept_id`,
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
    employee.emp_lname AS "SurName", 
    role.role_title AS "Role", 
    dept.dept_name AS "Department", 
    role.role_salary AS "Salary", 
      CONCAT(manager.emp_fname, " ", manager.emp_lname) AS "Manager"
      FROM employee AS employee
      LEFT JOIN employee AS manager ON employee.manager_id = manager.emp_id
      JOIN role ON employee.role_id = role.role_id
      JOIN dept ON role.dept_id = dept.dept_id`,
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
    name: "dept",
    type: "input",
    message: "Name of new department?",
    validate: (answer) => {
      if (answer !== "") {
        return true;
      }
      return "Please add the name of the department!";
    },
  }).then((answer) => {
    db.query(
      "INSERT INTO dept (dept_name) VALUES (?)",
      [answer.dept],
      (err, result) => {
        if (err) throw err;
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
    depts = depts.map((dept) => {
      return {
        name: dept.dept_name,
        value: dept.dept_id,
      };
    });
    prompt([
      {
        name: "role",
        type: "input",
        message: "Name of new role?",
        validate: (answer) => {
          if (answer !== "") {
            return true;
          }
          return "Please add role name!";
        },
      },
      {
        name: "salary",
        type: "input",
        message: "New role Salary?",
        validate: (answer) => {
          if (isNaN(answer)) {
            return false, "Please add new role Salary!";
          }
          return true;
        },
      },
      {
        name: "dept",
        type: "list",
        message: "Which department does this role belong to?",
        choices: depts,
      },
    ]).then((answers) => {
      db.query(
        "INSERT INTO role (role_title, role_salary, dept_id) VALUES (?, ?, ?)",
        [answers.role, answers.salary, answers.dept],

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
    roles = roles.map((role) => {
      return {
        name: role.role_title,
        value: role.role_id,
      };
    });
    db.query("SELECT * FROM employee", (err, managers) => {
      managers = managers.map((employee) => {
        return {
          name: employee.emp_fname + " " + employee.emp_lname,
          value: employee.emp_id,
        };
      });
      prompt([
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
          name: "role",
          type: "list",
          message: "Select role",
          choices: roles,
        },
        {
          name: "manager",
          type: "list",
          message: "Select Manager",
          choices: managers,
        },
      ]).then((answers) => {
        db.query(
          "INSERT INTO employee (emp_fname, emp_lname, role_id, manager_id) VALUES (?, ?, ?, ?)",
          [answers.firstName, answers.lastName, answers.role, answers.manager],
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
    if (err) throw err;
    employees = employees.map((employee) => {
      return {
        name: employee.emp_fname + " " + employee.emp_lname,
        value: employee.emp_id,
      };
    });
    db.query("SELECT * FROM role", (err, roles) => {
      roles = roles.map((role) => {
        return {
          name: role.role_title,
          value: role.role_id,
        };
      });
      prompt({
        name: "employee",
        type: "list",
        message: "Select employee to update:",
        choices: employees,
      }).then((SelectedEmployee) => {
        prompt({
          name: "role",
          type: "list",
          message: "Select new role",
          choices: roles,
        }).then((SelectedRole) => {
          db.query(
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
    if (err) throw err;
    employees = employees.map((employee) => {
      return {
        name: employee.emp_fname + " " + employee.emp_lname,
        value: employee.emp_id,
      };
    });
    prompt({
      name: "employee",
      type: "list",
      message: "Select employee to update manager:",
      choices: employees,
    }).then((selectedEmployee) => {
      prompt({
        name: "manager",
        type: "list",
        message: "Select New manager:",
        choices: employees,
      }).then((selectedManager) => {
        db.query(
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
    (err, Managers) => {
      if (err) throw err;

      Managers = Managers.map((manager) => {
        return {
          name: manager.emp_fname + " " + manager.emp_lname,
          value: manager.emp_id,
        };
      });
      prompt({
        name: "manager",
        type: "list",
        message: "Select manager",
        choices: Managers,
      }).then((answer) => {
        db.query(
          `SELECT employee.*, CONCAT(manager.emp_fname, ' ', manager.emp_lname) AS Manager
          FROM employee
          JOIN employee AS manager ON employee.manager_id = manager.emp_id
          WHERE employee.manager_id = ${answer.manager} OR employee.manager_id IS NULL
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
    if (err) throw err;
    Departments = Departments.map((depts) => {
      return {
        name: depts.dept_name,
        value: depts.dept_id,
      };
    });
    prompt({
      name: "department",
      type: "list",
      message: "Select department",
      choices: Departments,
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
    if (err) throw err;
    employees = employees.map((employee) => {
      return {
        name: employee.emp_fname + " " + employee.emp_lname,
        value: employee.emp_id,
      };
    });
    prompt({
      name: "delete",
      type: "list",
      message: "Select employee to delete",
      choices: employees,
    }).then((answers) => {
      db.query(
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
    if (err) throw err;
    roles = roles.map((role) => {
      return {
        name: role.role_title,
        value: role.role_id,
      };
    });
    prompt({
      name: "delete",
      type: "list",
      message: "Select role to delete",
      choices: roles,
    }).then((answers) => {
      db.query(
        `DELETE FROM role WHERE role_id = ${answers.delete}`,
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
    if (err) throw err;
    depts = depts.map((dept) => {
      return {
        name: dept.dept_name,
        value: dept.dept_id,
      };
    });
    prompt({
      name: "delete",
      type: "list",
      message: "Select department to delete",
      choices: depts,
    }).then((answers) => {
      db.query(
        `DELETE FROM dept WHERE dept_id = ${answers.delete}`,
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
  db.end();
  spacer("Goodbye");
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
};
