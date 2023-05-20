DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

USE employees_db;

CREATE TABLE dept (
    dept_id INT NOT NULL AUTO_INCREMENT,
    dept_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (dept_id)
);

CREATE TABLE role (
    role_id INT NOT NULL AUTO_INCREMENT,
    role_title VARCHAR(30) NOT NULL,
    role_salary DECIMAL(10,2) NOT NULL,
    dept_id INT,
    PRIMARY KEY (role_id),
    FOREIGN KEY (dept_id) REFERENCES dept(dept_id)
);

CREATE TABLE employee (
    emp_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    emp_fname VARCHAR(30) NOT NULL,
    emp_lname VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT NULL,
    FOREIGN KEY (role_id) REFERENCES role(role_id),
    FOREIGN KEY (manager_id) REFERENCES employee(emp_id)
);
