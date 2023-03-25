import express from 'express';
import prisma from '../app.js';

const router = express.Router();

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

router.post('/', async (req, res) => {
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

        res.json({"error": `University at ${Math.abs(location.latitude)} ${latLetter} ${Math.abs(location.longitude)} ${longLetter} already exists!`});
    }
    res.json(university);
});

router.put('/:id', async (req, res) => {
    const { name, location, description, numStudents, picture } = req.body;
    const university = await prisma.university.update({
        where: {
            id: parseInt(req.params.id),
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

router.delete('/:id', async (req, res) => {
    const university = await prisma.university.delete({
        where: {
            id: parseInt(req.params.id),
        },
    });
    res.json(university);
});

export default router;
