const inquirer = require("inquirer");
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "sasa",
    database: "company_db"
})


 function createPrompts(){
     inquirer.prompt({
        type:"list",
        name: "prompt",
        message: "Please choose an option",
        choices:[
            "View all departments",
            "View all roles",
            "View all employees",
            "Add a department",
            "Add a role",
            "Add an employee",
            "Update an employee role",
            "Quit"

        ],
    })
    .then((response) => {
        switch (response.prompt) {
            case "View all departments":
                viewAllDepartments();
                break;
            case "View all roles":
                viewAllRoles();
                break;
            case "View all employees":
                viewAllEmployees();
                break;
            case "Add a department":
                addDepartment();
                break;
            case "Add a role":
                addRole();
                break;
            case "Add an employee":
                addEmployee();
                break;
            case "Update an employee role":
                updateEmployeeRole();
                break;
            case "Exit":
                process.on("Exit", ()=>{
                    connection.end();
                });
                break;
        }
    });
}



db.connect((err)=>{
    if (err) throw err;
    console.log("Connected to DB")
    createPrompts();
});





const viewAllDepartments = async () => {
  try {
    const departments = await db.promise().query(`SELECT department.id AS id, department.department_name AS department FROM department`);
    console.table(departments);
  } catch (error) {
    console.error('An error occurred:', error);
  } createPrompts();
};

const viewAllRoles = async () => {
  try {
    const query = `SELECT role.id, role.job_title, department.department_name AS department
    FROM role
    INNER JOIN department ON role.department_id = department.id`;
    const roles = await db.promise().query(query);
    console.table(roles);
  } catch (error) {
    console.error('An error occurred:', error);
  } createPrompts();

};

const viewAllEmployees = async () => {
    try {
        const query = `
        SELECT employee.id, 
                  employee.first_name, 
                  employee.last_name, 
                  role.job_title, 
                  department.department_name AS 'department', 
                  role.salary
                  FROM employee, role, department 
                  WHERE department.id = role.department_id 
                  AND role.id = employee.role_id
         `;
        const roles = await db.promise().query(query);
        console.table(roles);
      } catch (error) {
        console.error('An error occurred:', error);
      } createPrompts();
  };


  const addDepartment = async () => {
    try {
        const answer = await inquirer.prompt({
            type: "input",
            name: "department",
            message: "What is the name of the department?",
        });

        const query = "INSERT INTO department (department_name) VALUES (?)";
        const result = await db.promise().query(query, [answer.department]);

        console.log(`You added department ${answer.department} to the employee database`);
        createPrompts();
    } catch (error) {
        console.error("An error occurred:", error);
    }

};



const addRole = async () => {
    try {
        const [departments] = await db.promise().query("SELECT * FROM department");

        const departmentOptions = departments.map(department => ({
            name: department.department_name,
            value: department.id,
        }));

        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "job_title",
                message: "Add a title for a Role!",
            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary of the role?",
            },
            {
                type: "list",
                name: "department",
                message: "Select the department for the new role:",
                choices: departmentOptions,
            },
        ]);

        const selectedDepartment = departments.find(d => d.id === answers.department);

        const query = "INSERT INTO role (job_title, salary, department_id) VALUES (?, ?, ?)";
        const roleData = [answers.title, answers.salary, selectedDepartment.id];

        await db.promise().query(query, roleData);

        console.log(`Added the role ${answers.job_title} with a salary of ${answers.salary} to the ${selectedDepartment.department_name} department in the database`);
        createPrompts();
    } catch (error) {
        console.error("An error occurred:", error);
    }

};


const addEmployee = async () => {
    try {
        const [roles] = await db.promise().query("SELECT id, job_title FROM role");

        const roleOptions = roles.map(({ id, job_title }) => ({ name: job_title, value: id }));

        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "firstName",
                message: "Enter the employee's first name:",
            },
            {
                type: "input",
                name: "lastName",
                message: "Enter the employee's last name:",
            },
            {
                type: "list",
                name: "roleId",
                message: "Select the employee role:",
                choices: roleOptions,
            },
        ]);

        const query = "INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)";
        const values = [
            answers.firstName,
            answers.lastName,
            answers.roleId,
        ];

        await db.promise().query(query, values);
        console.log("Employee added successfully");
        createPrompts();
    } catch (error) {
        console.error("An error occurred:", error);
    }

};

const updateEmployeeRole = async () => {
    try {
        const [employees] = await db.promise().query(
            "SELECT employee.id, employee.first_name, employee.last_name, role.job_title FROM employee LEFT JOIN role ON employee.role_id = role.id"
        );

        const [roles] = await db.promise().query("SELECT id, job_title FROM role");

        const employeeOptions = employees.map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id,
        }));

        const roleOptions = roles.map(({ id, job_title }) => ({ name: job_title, value: id }));

        const answers = await inquirer.prompt([
            {
                type: "list",
                name: "employeeId",
                message: "Select the employee to update:",
                choices: employeeOptions,
            },
            {
                type: "list",
                name: "roleId",
                message: "Select the new role:",
                choices: roleOptions,
            },
        ]);

        const query = "UPDATE employee SET role_id = ? WHERE id = ?";
        const values = [answers.roleId, answers.employeeId];

        await db.promise().query(query, values);
        console.log("Employee role updated successfully");
        createPrompts();
    } catch (error) {
        console.error("An error occurred:", error);
    }
};