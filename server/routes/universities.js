import express from 'express';
import prisma from '../bin/db.js';
import authenticateJWT from '../middleware/jwt.js';

const router = express.Router();

function isNotElevatedAdmin(role) {
    return (role !== 'SUPERADMIN' && role !== 'SERVERADMIN')
}


router.get('/', async (req, res) => {
    const universities = await prisma.university.findMany();
    res.json(universities);
});

router.get('/:id', async (req, res) => {
    const university = await prisma.university.findUnique({
        where: {
            id: parseInt(req.params.id),
        },
    });
    res.json(university);
});

router.post('/', authenticateJWT, async (req, res) => {

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    if (isNotElevatedAdmin(req.user.role)) {
        return res.status(401).json({ error: 'You are not authorized to create a university' });
    }

    const { name, location, description, numStudents, picture } = req.body;
    let locationObj = await prisma.location.findUnique({
            where: {
                coordinates: {
                    longitude: location.longitude,
                    latitude: location.latitude,
                },
            },
    });

    if (!locationObj) {
        locationObj = await prisma.location.create({
            data: {
                name: location.name || "Unnamed Location",
                latitude: location.latitude,
                longitude: location.longitude,
            },
        });
    }
    let university;
    try {
        university = await prisma.university.create({
            data: {
                name,
                location: {
                    connect: {
                        id: locationObj.id,
                    },
                },
                description,
                numStudents,
                picture,
            },
        });
    } catch (err) {
        let latLetter = 'N';
        let longLetter = 'E';
        if (location.latitude < 0) latLetter = 'S';
        if (location.longitude < 0) longLetter = 'W';

        res.status(409).json({message: `University at ${Math.abs(location.latitude)} ${latLetter} ${Math.abs(location.longitude)} ${longLetter} already exists!`});
    }
    res.json(university);
});

router.put('/:id', authenticateJWT, async (req, res) => {

    const id = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    if (isNotElevatedAdmin(req.user.role) || (user.universityId !== id && user.role !== "SERVERADMIN")) {
        return res.status(401).json({ error: 'You are not authorized to edit this university' });
    }
    
    const { name, location, description, numStudents, picture } = req.body;
    const university = await prisma.university.update({
        where: {
            id: id,
        },
        data: {
            name,
            location,
            description,
            numStudents,
            picture,
        },
    });
    res.json(university);
});

router.delete('/:id', authenticateJWT, async (req, res) => {
    const id = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    if (isNotElevatedAdmin(req.user.role) || (user.universityId !== id && user.role !== "SERVERADMIN")) {
        return res.status(401).json({ error: 'You are not authorized to delete this university' });
    }

    const university = await prisma.university.delete({

        where: {
            id: id,
        },
    });
    res.json(university);
});

export default router;
