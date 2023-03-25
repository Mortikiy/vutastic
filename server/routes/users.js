import express from 'express';
import bcrypt from 'bcrypt';
import authenticateJWT from '../middleware/jwt.js';
import prisma from '../app.js';

const router = express.Router();

function isNotElevatedAdmin(role) {
    return (role !== 'SUPERADMIN' && role !== 'SERVERADMIN')
}

router.put('/:id', authenticateJWT, async(req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, password, role, universityId } = req.body;
    const userId = parseInt(id);

    const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (req.user.id !== userId && isNotElevatedAdmin(req.user.role)) {
            return res.status(401).json({ error: 'You are not authorized to update this user' });
        }
    
    let hashedPassword = password;
    if (hashedPassword) hashedPassword = await bcrypt.hash(password, 10);

    if ((role) && isNotElevatedAdmin(req.user.role)) {
        return res.status(403).json({ error: 'You are not authorized to update this user\'s role' });
    }

    if ((universityId) && req.user.role !== 'SERVERADMIN') {
        return res.status(403).json({ error: 'You are not authorized to update this user\'s university' });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
                universityId,
            },
        });

        res.json(updatedUser);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Unable to update user.' });
    }

})

export default router;
