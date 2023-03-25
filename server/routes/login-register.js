import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../app.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, universityId } = req.body;

    const existingUser = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
    }

    const university = await prisma.university.findUnique({
        where: {
            id: universityId,
        }
    })

    if (!university) {
        return res.status(406).json({ error: 'University not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            university: {
                connect: {
                    id: university.id
                }
            },
            role: "USER",
        },
    });

    return res.status(201).json({ message: `User for ${newUser.email} created successfully` });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials'});
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
        return res.status(401).json({ error: 'Invalid credentials'});
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    } );

    return res.status(200).json({ token });
})

export default router;
