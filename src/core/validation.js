const checkIfIsString = (value) => value && typeof value === "string";

const INVALID_STRING_MSG = "You need to provide an string value.";

export const notEmptyString = (value) => {
    let errorMessage = null;

    if(!checkIfIsString(value))
        errorMessage = INVALID_STRING_MSG;

    return errorMessage ?? true;
} 


export const notEmptyStringIncludingBlanks = (value) => {
    let errorMessage = null;

    if(!checkIfIsString(value))
        errorMessage = INVALID_STRING_MSG;

    if(value.trim() === "")
        errorMessage =  "The string cannot be empty.";

    return errorMessage ?? true;
} 