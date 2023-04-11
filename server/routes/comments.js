import express from 'express';
import prisma from '../bin/db.js';
import authenticateJWT from '../middleware/jwt.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    const comment = await prisma.comment.findUnique({
        where: {
            id: parseInt(req.params.id),
        }
    });
    res.json(comment);
});

router.get('/events/:event_id', async (req, res) => {
    const comments = await prisma.comment.findMany({
        where: {
            eventId: parseInt(req.params.event_id),
        }
    });
    res.json(comments);
});

router.post('/', authenticateJWT, async (req, res) => {

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { text, eventId, rating } = req.body;

    let comment = await prisma.comment.create({
            data: {
                text,
                author: {
                    connect: {
                        id: user.id,
                    },
                },
                event: {
                    connect: {
                        id: eventId,
                    }
                },
                rating,
            },
        });

    res.json(comment);
});

router.put('/:id', authenticateJWT, async (req, res) => {

    const id = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
        where: {
            id: req.user.id,
        },
        include: {
            comments: true,
        }
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const userComment = user.comments.find(comment => comment.id === id);
    if (userComment == undefined) {
        return res.status(401).json({ error: 'You are not authorized to edit this comment.' });
    }
    
    const { text, rating } = req.body;
    const comment = await prisma.comment.update({
        where: {
            id: id,
        },
        data: {
            text,
            rating,
        },
    });
    res.json(comment);
});

router.delete('/:id', authenticateJWT, async (req, res) => {
    const id = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
        where: {
            id: req.user.id,
        },
        include: {
            comments: true,
        }
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const userComment = user.comments.find(comment => comment.id === id);
    if (userComment == undefined) {
        return res.status(401).json({ error: 'You are not authorized to edit this comment.' });
    }

    const comment = await prisma.comment.delete({
        where: {
            id: id,
        },
    });
    
    res.json(comment);
});

export default router;
