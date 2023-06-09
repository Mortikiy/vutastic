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
            rsos: {
                where: {
                    status: 'ACTIVE',
                },
                include: {
                    events: {
                        where: {
                            type: 'RSO',
                        },
                        include: {
                            location: true,
                            attendees: true,
                            host: true,
                            comments: true,
                        },
                    },
                },
            },
        },
    });

    const publicEvents = await prisma.event.findMany({
        where: {
            type: "PUBLIC",
        },
        include: {
            location: true,
            attendees: true,
            host: true,
            comments: true,
        },
    });

    const privateEvents = await prisma.event.findMany({
        where: {
            type: 'PRIVATE',
            universityId: user.universityId,
        },
        include: {
            location: true,
            attendees: true,
            host: true,
            comments: true,
        },
    });

    const events = [...publicEvents, ...privateEvents];

    let rsoEvents = user.rsos.flatMap((rso) => rso.events);
    events.push(...rsoEvents)

    res.json(events);
});

router.get('/:id', async (req, res) => {
    const event = await prisma.event.findUnique({
        where: {
            id: parseInt(req.params.id),
        },
        include: {
            attendees: true,
            host: true,
            rso: true,
            comments: true,
            location: true,
        }
    });
    res.json(event);
});

// Allows a member to leave an event if they're an attendee
router.put('/:id/leave', authenticateJWT, async(req, res) => {
    const id = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    const event = await prisma.event.findUnique({
        where: { id },
        include: { attendees: true }
    });

    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.attendees.some(attendee => attendee.id === user.id)) {
        return res.status(400).json({ error: 'User has not joined this event' });
    }

    await prisma.event.update({
        where: { id },
        data: { attendees: { disconnect: { id: user.id } } },
    });

    return res.status(200).json({ message: 'Successfully left event' });

});

// Adds a user to an event as an attendee
router.put('/:id/join', authenticateJWT, async(req, res) => {
    const id = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    const event = await prisma.event.findUnique({
        where: { id },
        include: { attendees: true }
    });

    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    if (event.attendees.some(attendee => attendee.id === user.id)) {
        return res.status(400).json({ error: 'User has already joined this event' });
    }

    await prisma.event.update({
        where: { id },
        data: { attendees: { connect: { id: user.id } } },
    });

    return res.status(200).json({ message: 'Successfully joined event' });

});


export default router;
