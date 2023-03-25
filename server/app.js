import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import createServerAdmin from './bin/createServerAdmin.js';

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

createServerAdmin();

// API ROUTES
import universities from './routes/universities.js';
import credentials from './routes/login-register.js';
import rsos from './routes/rsos.js'
import notifications from './routes/notifications.js'
import users from './routes/users.js'
import index from './routes/index.js';

app.use('/api/universities', universities);
app.use('/api/', credentials);
app.use('/api/users', users);
app.use('/api/rsos', rsos);
app.use('/api/notifications', notifications)
app.use('/express_backend', index);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}.`);
});
