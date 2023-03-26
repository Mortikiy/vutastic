import express from 'express';
import prisma from '../bin/db.js';
import authenticateJWT from '../middleware/jwt.js';

const router = express.Router();

router.get('/', authenticateJWT, async (req, res) => {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            university: {
                include: {
                    events: true,
                    rsos: {
                        include: {
                            events: true,
                        },
                    },
                },
            },
            rsos: {
                include: {
                    events: true,
                },
            },
        },
    });

    const publicEvents = await prisma.event.findMany({
        where: {
            type: "PUBLIC",
        }
    })

    const university = await prisma.university.findUnique({
        where: {
            id: user.universityId,
        },
    });

    const events = [...publicEvents];

    if (university.events) {
        const privateEvents = university.events.filter((event) => event.type === "PRIVATE");
        events.push(...privateEvents)
    }

    const rsoEvents = user.rsos.flatMap((rso) => rso.events);
    events.push(...rsoEvents)

    res.json(events);
});

export default router;
