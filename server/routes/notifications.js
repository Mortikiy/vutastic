import express from 'express';
import prisma from '../bin/db.js';
import authenticateJWT from '../middleware/jwt.js';

const router = express.Router();

function isNotElevatedAdmin(role) {
    return (role !== 'SUPERADMIN' && role !== 'SERVERADMIN')
}

// Only SUPERADMIN may see notifications
router.get('/', authenticateJWT, async (req, res) => {

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    if (isNotElevatedAdmin(req.user.role)) {
        return res.status(401).json({ error: 'You are not authorized to view notifications' });
    }

    const university = await prisma.university.findUnique({
        where: {
            superadminId: req.user.id,
        }
    });

    const notifications = await prisma.notification.findMany({
        where: {
            universityId: university.id,
        },
        include: {
            admin: true,
            rso: true,
            event: true
        }
    })

    res.json(notifications)
});

// Any USER may post a notification to the university
// Requires either an rsoId or an eventId
// If this is an RSO request, User will be promoted to ADMIN upon accept
// Otherwise, User must be an ADMIN.
router.post('/', authenticateJWT, async (req, res) => {
    const { type, rsoId, eventId } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const university = await prisma.university.findUnique({
        where: {
            id: user.universityId,
        }
    });

    let event;
    let rso;
    let notification;

    console.log(type)
    if (type.toUpperCase() === 'EVENT') {
        event = await prisma.event.findUnique({
            where: {
                id: eventId,
            },
        });

        if (!event) return res.status(404).json({ error: 'The event specified does not exist.'});
        if (user.id !== event.hostId) return res.status(403).json({ error: 'User is not the host of the event specified.' });

        notification = await prisma.notification.create({
            data: {
                type,
                university: {
                    connect: {
                        id: university.id,
                    },
                },
                admin: {
                    connect: {
                        id: user.id,
                    }
                },
                event: {
                    connect: {
                        id: event.id,
                    },
                },
            }
        });
    }
    else if (type.toUpperCase() === 'RSO' || !type) {
        rso = await prisma.rSO.findUnique({
            where: {
                id: rsoId,
            },
        });

        if (!rso) return res.status(404).json({ error: 'The RSO specified does not exist.'})
        if (user.id !== rso.adminId) return res.status(403).json({ error: 'User is not the admin of the RSO specified.' });

        notification = await prisma.notification.create({
            data: {
                type,
                university: {
                    connect: {
                        id: university.id,
                    },
                },
                rso: {
                    connect: {
                        id: rso.id,
                    },
                },
                admin: {
                    connect: {
                        id: user.id,
                    }
                },
            },
        });
    } else {
        return res.status(400).json({ error: 'The type parameter must be either "EVENT" or "RSO".'});
    }

    res.json(notification);

});

export default router;
