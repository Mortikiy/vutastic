import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

prisma.$connect().then(() => {
    console.log('Connected to database');
}).catch((error) => {
    console.error(error);
}).finally(async () => {
    await prisma.$disconnect();
});

export default prisma;

// API ROUTES
import universities from './routes/universities.js';
import index from './routes/index.js';

app.use('/api/universities', universities);
app.use('/express_backend', index)

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}.`);
});
