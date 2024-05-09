import { readFile } from 'node:fs/promises';
import fs from 'fs';

var companiesPath = './companies.json';
var usersPath = './users.json';


//Imports the JSON files
async function importJSON(filePath) {
    try {
        const data = await readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return null;
    }
}

//Sorts the user objects by last name
function sortByLastName(arr) {
    return arr.sort((a,b) => {
        let lastNameA = a.LastName;
        let lastNameB = b.LastName;

        if (lastNameA < lastNameB) {
            return -1;
          }
          if (lastNameA > lastNameB) {
            return 1;
          }
          
          return 0;
    })
}

//Maps users to companies and applies logic to add them Email or Not Email list section of the company object 
async function compareObjects(json1, json2){
    let companies = await importJSON(json1);
    const users = await importJSON(json2);
   

    const idToUser = new Map();
    users.forEach(obj => {
        if(!idToUser.has(obj.company_id)){
            idToUser.set(obj.company_id, []);
        }
        idToUser.get(obj.company_id).push(obj);
    });
    //Create new email and not emailed arrays and adds them as properties to the companies array according to the email and active status
    companies.forEach(obj1 => {
        
        obj1.UserEmailed = [];
        obj1.Notmailed = [];
        
        const matchedObjects = idToUser.get(obj1.id) || [];
        const { UserEmailed, Notmailed } = matchedObjects.reduce((acc, obj) => {
            const balance = obj.tokens + (obj.active_status ? obj1.top_up : 0);
            const newObj = {
                LastName: obj.last_name,
                FirstName: obj.first_name,
                Email: obj.email,
                TokenBalance: obj.tokens,
                newBalance: balance
            };
            if (obj.email_status) {
                acc.UserEmailed.push(newObj);
            } else {
                acc.Notmailed.push(newObj);
            }
            return acc;
        }, { UserEmailed: [], Notmailed: [] });

        obj1.UserEmailed.push(...UserEmailed);
        obj1.Notmailed.push(...Notmailed);
        sortByLastName(obj1.UserEmailed);
        sortByLastName(obj1.Notmailed);
    });
    return companies;
}

//Write the resulting array to a txt file 
async function writetoTxt(){
    const resultArray = await compareObjects(companiesPath,usersPath);
    const jsonString = JSON.stringify(resultArray, null, 2);

    fs.writeFile('output.txt', jsonString, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('File written.');
        }
    });
}

writetoTxt();

