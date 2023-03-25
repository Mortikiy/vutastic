import express from 'express';
import prisma from '../app.js';
import authenticateJWT from '../middleware/jwt.js';

const router = express.Router();

// Creates a "PENDING" RSO that will not be seen until a SUPERADMIN accepts.
// Does NOT send the notification to the University/SUPERADMIN
router.post('/request', authenticateJWT, async (req, res) => {
    const { name, members } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(406).json({ error: 'User not found.' });
    }

    // Verifies that the RSO does not already exist
    const verifyRSO = await prisma.rSO.findUnique({
        where: {
            name
        },
    });

    if (verifyRSO) return res.status(409).json({ error: `RSO "${name}" already exists.`});

    // Verifies all of the members exist
    const memberObjects = await prisma.user.findMany({
        where: {
            id: { in: members },
        },
    });

    for (let member in memberObjects) {
        if (!member) return res.status(406).json({ error: 'User not found in members array.' });
    }

    const university = await prisma.university.findUnique({
        where: {
            id: user.universityId,
        }
    });

    if (members.length < 4) return res.status(400).json({ error: 'There must be at least 4 members not including the admin to create an RSO.' });

    const rso = await prisma.rSO.create({
        data: {
            name,
            university: {
                connect: {
                    id: university.id,
                }
            },
            admin: {
                connect: {
                    id: user.id,
                },
            },
            members: {
                connect: memberObjects.map((member) => {
                    return {
                        id: member.id,
                    };
                }),
            },
        },
    });

    res.json(rso);

});

export default router;
