
import { promisify } from "util";
import { exec } from "node:child_process";

export const execPromise = promisify(exec);