export const trimValue = (value) => {
    if(typeof value !== "string")
        return "";

    return value.trim();
}

export const valueOrNull = (value) => {
    const valueCleaned = trimValue(value);
    return valueCleaned === "" ? null : valueCleaned;
}