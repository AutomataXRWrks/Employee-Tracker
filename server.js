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

                break;
        }
    });
}



createPrompts();



const viewAllDepartments = async () => {
  try {
    const departments = await db.promise().query(`SELECT * FROM department`);
    console.table(departments);
  } catch (error) {
    console.error('An error occurred:', error);
  } createPrompts();
};

const viewAllRoles = async () => {
  try {
    const roles = await db.promise().query(`SELECT * FROM role`);
    console.table(roles);
  } catch (error) {
    console.error('An error occurred:', error);
  } createPrompts();

};

