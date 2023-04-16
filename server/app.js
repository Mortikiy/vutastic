import express from 'express';
import cors from 'cors';
import index from './routes/index.js';

// Local Development
import path from 'path'
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
if (!process.env.MYSQL_DATABASE) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    dotenv.config({ path: path.join(__dirname, '..', '.env')});
}
//

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', index)
app.use(express.static('public'));

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}.`);
});
