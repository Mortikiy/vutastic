import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../bin/db.js';
import authenticateJWT from '../middleware/jwt.js';

const router = express.Router();

function isNotElevatedAdmin(role) {
    return (role !== 'SERVERADMIN' && role !== 'SUPERADMIN')
}

router.post('/superadmin', authenticateJWT, async (req, res) => {

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    if (isNotElevatedAdmin(req.user.role)) {
        return res.status(401).json({ error: 'You are not authorized to create a superadmin' });
    }

    const { firstName, lastName, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: "SUPERADMIN",
        },
    });
    res.json(newUser);
});

export default router;
