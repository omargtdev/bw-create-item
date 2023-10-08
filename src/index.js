import { start } from './app.js';
import { getStatus } from './core/user/index.js';
import { LoginStatus } from './core/user/types.js';

const main = async () => {
    const loginStatus = await getStatus();
    if(loginStatus === LoginStatus.unauthenticated){
        console.log("You need to log in.")
        return;
    }
     
    start();
}

main()
  .catch(console.log);
