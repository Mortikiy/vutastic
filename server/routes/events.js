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
        },
        include: {
            location: true,
        }
    })

    const university = await prisma.university.findUnique({
        where: {
            id: user.universityId,
        },
        include: {
            events: true,
        }
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

router.get('/:id', async (req, res) => {
    const event = await prisma.event.findUnique({
        where: {
            id: parseInt(req.params.id),
        },
        include: {
            attendees: true,
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
