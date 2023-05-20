--example data for testing purposes
INSERT INTO dept (dept_name)
VALUES ("PLANNING"),
       ("LAND"),
       ("WATER"),
       ("SURVEYING SERVICES"),
       ("RAIL");



INSERT INTO role (role_title,role_salary,dept_id)
VALUES ("UTILITY SURVEYOR",35000.00, 004),
       ("TOPOGRAPHICAL SURVEYOR",30000.00,004),
       ("LAND REFERENCER",27000.00,002),
       ("ACCESS OPERATIVE",27500.00,002),
       ("PLANNING OFFICER",42000.00,001),
       ("PLANNING ASSISTANT",22500.00,001),
       ("WATER SAMPLING OPERATIVE",24500.00,003),
       ("WATER QUALITY TECHNICIAN",32000.00,003),
       ("COSS",35000.00,005),
       ("KART OPERATOR",22500.00,005);

INSERT INTO employee (emp_fname,emp_Lname,role_id,manager_id)
VALUES ("GARRY","SIMPSON",005,NULL),
       ("CHARLIE","SWAN",006,001),
       ("CHRIS","JENKS",004,002),
       ("MARK","RYAN",002,002),
       ("SCOTT","SMITH",008,001),
       ("FRASER","ANDREWS",001,001),
       ("MICHAEL","WALTERS",001,006),
       ("JACK","BRADLEY",003,007),
       ("NICK","RICHARDS",009,001),
       ("RYAN","WHITEHOUSE",010,009);


