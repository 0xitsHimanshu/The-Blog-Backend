import {app} from './app.js';
import dbConnection from './data/dbConnection.js';

const port = process.env.PORT ||  3000;

dbConnection();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});