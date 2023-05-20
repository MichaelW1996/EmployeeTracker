DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

USE employees_db;

-- departments, only has value of ID number and a name
CREATE TABLE dept (
    dept_id INT AUTO_INCREMENT,
    dept_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (dept_id)
);

--roles, have id number, title, salary & have a foreign key of department (the role belongs to a department)
CREATE TABLE role (
    role_id INT AUTO_INCREMENT,
    role_title VARCHAR(30) NOT NULL,
    role_salary DECIMAL(10,2) NOT NULL,
    dept_id INT NOT NULL,
    PRIMARY KEY (role_id),
    FOREIGN KEY (dept_id) REFERENCES dept(dept_id)
    ON DELETE CASCADE
);--on delete cascade means if the dept is deleted that owns this role, the role will also be deleted

--employee, has ID, name, and 2 foreign keys, the employee will (normally) belong to a manager, and also belong to a role
CREATE TABLE employee (
    emp_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_fname VARCHAR(30) NOT NULL,
    emp_lname VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT NULL,
    FOREIGN KEY (role_id) REFERENCES role(role_id)
    ON DELETE CASCADE, --on delete cascade means if the role is deleted that owns this employee, the employee will also be deleted & by extension, deleting the dept will also delete role & employee
    FOREIGN KEY (manager_id) REFERENCES employee(emp_id)
    ON DELETE CASCADE --on delete cascade means if the manager is deleted that owns this employee, this employee will also be deleted
);
