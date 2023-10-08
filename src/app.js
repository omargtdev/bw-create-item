import inquirer from "inquirer";

import { notEmptyString, notEmptyStringIncludingBlanks } from "./core/validation.js";
import { trimValue, valueOrNull } from "./core/utils.js";
import { getUserInfo, getFolders, createItem } from "./core/user/index.js";

const parseItemToCreate = ({ name, username, password, uri, notes, folderId }) => {
    const urisToSend = uri ? [{ match: null, uri }] : [];
    return {
        name,
        folderId,
        notes,
        login: {
            uris: urisToSend,
            username,
            password,
        }
    }
}

export const start = async () => {
    try {
        const userInfo = await getUserInfo();
        console.log(`Hi, ${userInfo.email}. We are gonna create an item!`)

        console.log("Getting folders...");
        const folders = await getFolders();

        console.log("Select the directory where to create.");
        const { folderId } = await inquirer.prompt({
            type: "list",
            name: "folderId",
            message: "Select the folder where to put the new item: ",
            choices: folders.map(({ id, name }) => ({ name, value: id }))
        });

        const newItem = await inquirer.prompt([
            { type: 'input', message: 'Put the name of the item: ', validate: notEmptyStringIncludingBlanks, name: 'name', filter: trimValue },
            { type: 'input', message: 'Put the username of the item: ', validate: notEmptyStringIncludingBlanks, name: 'username', filter: trimValue },
            { type: 'password', message: 'Put the password of the item: ', validate: notEmptyString, name: 'password' },
            { type: 'input', message: 'Put the URI of the item (optional): ', name: 'uri', filter: valueOrNull },
            { type: 'input', message: 'Put some notes about item (optional): ', name: 'notes', filter: valueOrNull }
        ]);

        console.log("Generating...")
        const item = await createItem(parseItemToCreate({ ...newItem, folderId }));
        console.log("Item created!: ");
        console.log(item);
    } catch (error) {
        console.log("ERR:", error);
    }
}
