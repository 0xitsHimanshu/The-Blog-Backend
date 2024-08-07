import {app} from './app.js';
import dbConnection from './data/dbConnection.js';

const port = process.env.PORT ||  3000;

//intialize database connection
dbConnection();

//listening to the server
app.listen(port, () => {
    console.log("****Server is running****");
    console.log(`Server is running on port http://localhost:${port}`);
});