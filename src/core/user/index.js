import { exec } from 'node:child_process'

import inquirer from 'inquirer';

import { LoginStatus } from './types.js';
import { execPromise } from '../callbacksInPromises.js';
import { newItemTemplate } from "../templates.js";

let user = {
    id: null,
    email: null,
    key: null,
    status: LoginStatus.unauthenticated
}

// Authenticated
// {
//     "serverUrl": null,
//     "lastSync": "2023-09-11T18:37:01.194Z",
//     "userEmail": "omargtdev@gmail.com",
//     "userId": "7c42fb2f-794f-48f4-a2f5-af8b0126803f",
//     "status": "locked"
// }

// No auth
// {
//   "serverUrl": null,
//   "lastSync": null,
//   "status": "unauthenticated"
// }

const userIsLogged = () => user.status !== LoginStatus.unauthenticated;
const userHasInfoAlready = () => user.id !== null;
const getSessionParameterForCommands = () => {
    if(user.status === LoginStatus.unlocked)
        return "";

    return `--session ${user.key}`;
}

export const getUserSessionKey = async () => {
    try {
        const { pass } = await inquirer.prompt({ 
            type: 'password', 
            message: `Put your password for ${user.email}`, 
            name: 'pass' 
        });

        const { stdout: key } = await execPromise(`bw unlock "${pass}" --raw`);
        return key;
    } catch (error) {
        if(error.stderr)
            throw error.stderr;
        throw error;
    }
};

export const getStatus = async () => {
    try {
        const { stdout: rawStatus } = await execPromise("bw status");
        const status = JSON.parse(rawStatus);
        user = { ...user, status: LoginStatus[status] }

        return user.status;
    } catch (error) {
        if(error.stderr)
            throw error.stderr;
        throw error;
    }
};

export const getUserInfo = async () => {
    try {
        if(!userIsLogged())
            throw "Not Authenticated.";

        if(userHasInfoAlready())
            return user;

        const { stdout: rawUser } = await execPromise("bw status");
        const { userId : id, userEmail: email } = JSON.parse(rawUser);
        user = { ...user, id, email };

        if(user.status === LoginStatus.unlocked){
          user = { ...user, key: process.env.BW_SESSION };
          return user;
        }

        const key = await getUserSessionKey();
        user = { ...user, key };

        return user;
    } catch(error) {
        if(error.stderr)
            throw error.stderr;
        throw error;
    }
    // exec("bw status", (error, stdout, stderr) => {
    //     if(error)
    //         return reject(error.message);
    //
    //     const { userId : id, userEmail: email } = JSON.parse(stdout);
    //     user = { ...user, id, email };
    //
    //     if(user.status === LoginStatus.unlocked){
    //         user = { ...user, key: process.env.BW_SESSION };
    //         return resolve(user);
    //     }
    //
    //     getUserSessionKey()
    //         .then(key => {
    //             user = { ...user, key }
    //             resolve(user);
    //         })
    //         .catch(reject);
    // });
};

export const getFolders = async () => {
    try {
        const { stdout } = await execPromise(`bw list folders ${getSessionParameterForCommands()}`);
        const folders = JSON.parse(stdout);

        return folders.map(({ id, name }) => ({ id, name }));
    } catch (error) {
        if(error.stderr)
            throw error.stderr;
        throw error;
    }
}

export const createItem = async (createItem) => {
    try {
        const newItem = Object.assign({ ...newItemTemplate }, createItem);
        const rawNewItem = JSON.stringify(newItem);

        // TODO: What if pwsh does not exist? (Linux or other OS) 
        const { stdout } = await execPromise(
            `ConvertFrom-Json '${rawNewItem}' | ConvertTo-Json -Depth 3 | bw encode | bw create item ${getSessionParameterForCommands()}`,
            { shell: "pwsh.exe" }
        );

        const rawItemResult = JSON.parse(stdout);
        return rawItemResult;
    } catch (error) {
        if(error.stderr)
            throw error.stderr;
        throw error;
    }
}
