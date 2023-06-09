import express from 'express';
import prisma from '../bin/db.js';
import authenticateJWT from '../middleware/jwt.js';

const router = express.Router();

router.get('/', authenticateJWT, async (req, res) => {

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    const university = await prisma.university.findUnique({
        where: {
            id: user.universityId,
        },
    });

    try {
        const rsos = await prisma.rSO.findMany({
            where: { 
                universityId: university.id,
                NOT: {
                    status: 'PENDING',
                },
            },
            include: {
                members: {
                    select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    },
                },
                admin: {
                    select: {
                        id: true,
                        firstName: true,
                    },
                },
            },
        });

        res.json(rsos);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

// Creates a "PENDING" RSO that will not be seen until a SUPERADMIN accepts.
// Does NOT send the notification to the University/SUPERADMIN
router.post('/request', authenticateJWT, async (req, res) => {
    const { name, members } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
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
            email: { in: members },
        },
    });

    memberObjects.push(user);

    const university = await prisma.university.findUnique({
        where: {
            id: user.universityId,
        }
    });

    if (memberObjects.length < 4) return res.status(400).json({ error: 'There must be at least 4 members not including the admin to create an RSO.' });

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
        include: {
            members: true,
        }
    });

    res.json(rso);

});

// Allows a member to leave an RSO unless they are the ADMIN
router.put('/:id/leave', authenticateJWT, async(req, res) => {
    const id = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    let rso = await prisma.rSO.findUnique({
        where: { id },
        include: { members: true }
    });

    if (!rso) {
        return res.status(404).json({ message: 'RSO not found' });
    }

    // Check if the user is the RSO Admin
    if (rso.adminId === user.id) {
        // Check if there are other members in the RSO
        if (rso.members.length > 0) {
            return res.status(400).json({ message: 'Cannot leave RSO. Transfer ownership first' });
        } else {
            // Delete the RSO since the admin is the only member left
            await prisma.rSO.delete({ where: { id: rso.id } });
            return res.status(200).json({ message: 'RSO deleted' });
        }
    }

    if (!rso.members.some(member => member.id === user.id)) {
        return res.status(400).json({ error: 'User is not a member of this RSO' });
    }

    if (rso.members.length === 4) {
        rso = await prisma.rSO.update({
            where: { id: rso.id },
            data: { members: { disconnect: { id: user.id } }, status: 'INACTIVE' },
        });
    }
    else {
        rso = await prisma.rSO.update({
            where: { id: rso.id },
            data: { members: { disconnect: { id: user.id } } },
        });
    }

    return res.status(200).json({ message: 'Successfully left RSO', rso });

});

// Adds a user to an RSO as a member
router.put('/:id/join', authenticateJWT, async(req, res) => {
    const id = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    let rso = await prisma.rSO.findUnique({
        where: { id },
        include: { members: true }
    });

    if (!rso) {
        return res.status(404).json({ message: 'RSO not found' });
    }

    if (rso.members.some(member => member.id === user.id)) {
        return res.status(400).json({ error: 'User is not a member of this RSO' });
    }

    if (rso.members.length === 5) {
        rso = await prisma.rSO.update({
            where: { id: rso.id },
            data: { members: { connect: { id: user.id } }, status: 'ACTIVE' },
        });
    }
    else {
        rso = await prisma.rSO.update({
            where: { id: rso.id },
            data: { members: { connect: { id: user.id } } },
        });
    }

    return res.status(200).json({ message: 'Successfully joined RSO', rso });

});

// Allows an admin to make another member of their RSO an admin
router.put('/:id/transfer-ownership', authenticateJWT, async(req, res) => {
    const { newAdminEmail } = req.body;
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    const rso = await prisma.rSO.findUnique({
        where: { id: id },
        include: { members: true }
    });

    if (!rso) {
        return res.status(404).json({ message: 'RSO not found' });
    }

    if (rso.adminId !== user.id) {
        return res.status(403).json({ error: 'User is not an admin of the RSO' });
    }

    // check if the new admin exists and is a member of the RSO
    let newAdmin = await prisma.user.findUnique({
        where: { email: newAdminEmail },
        include: { rsos: true },
    });

    if (!newAdmin) {
        return res.status(404).json({ error: 'New admin user not found' });
    }

    if (!rso.members.some(member => member.id === newAdmin.id)) {
        return res.status(400).json({ error: 'New admin user is not a member of the RSO' });
    }

    let oldAdmin = await prisma.user.findUnique({
        where: { id: rso.adminId },
        include: {
            admin: true,
        }
    });
    

    if (oldAdmin.role !== "SUPERADMIN" && oldAdmin.role !== "SERVERADMIN" && oldAdmin.admin.length === 1) {
        await prisma.user.update({
            where: { id: rso.adminId },
            data: {
                role: "USER",
            }
        });
    }

    newAdmin = await prisma.user.update({
        where: { email: newAdminEmail },
        data: {
            role: "ADMIN",
        }
    });

    const newRso = await prisma.rSO.update({
        where: { id: rso.id },
        data: {
            admin: {
                connect: { id: newAdmin.id },
            },
            members: {
                connect: { id: user.id },
            },
        }
    });

    return res.status(200).json({ message: 'Ownership transferred successfully', newRso, newAdmin });

});

// Allows an admin to create an event
// UNTESTED - IT LOOKS LIKE A MESS RIGHT NOW
router.post('/:id/events', authenticateJWT, async (req, res) => {
    const { name, category, description, type, startTime, endTime, latitude, longitude, locationName, contactPhone, contactEmail } = req.body;
    const id= parseInt(req.params.id);

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    const rso = await prisma.rSO.findUnique({
        where: { id },
        include: { members: true }
    });

    if (!rso) {
        return res.status(404).json({ message: 'RSO not found' });
    }

    if (rso.adminId !== user.id) {
        return res.status(403).json({ error: 'User is not an admin of the RSO' });
    }

    const location = await prisma.location.findUnique({
        where: {
            coordinates: {
                latitude: latitude,
                longitude: longitude
            }
        }
    });

    if (location) {
        const overlappingEvents = await prisma.event.findMany({
            where: {
                locationId: location.id,
                OR: [
                    {
                        startTime: {
                            lte: new Date(endTime)
                        },
                        endTime: {
                            gte: new Date(startTime)
                        }
                    },
                    {
                        startTime: {
                            gte: new Date(startTime)
                        },
                        endTime: {
                            lte: new Date(endTime)
                        }
                    }
                ]
            }
        });
    
        if (overlappingEvents.length > 0) {
            let oEvent = overlappingEvents[0];
            let latLetter = 'N';
            let longLetter = 'E';
            if (latitude < 0) latLetter = 'S';
            if (longitude < 0) longLetter = 'W';

            return res.status(409).json({ error: `An overlapping event ${oEvent.name} already exists at 
                                                ${Math.abs(latitude)} ${latLetter} ${Math.abs(longitude)} 
                                                ${longLetter} between ${startTime} and ${endTime}.` });
        }
    }

    const event = await prisma.event.create({
        data: {
            name,
            category,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            location: {
                connectOrCreate: {
                    where: {
                        coordinates: {
                            longitude: longitude,
                            latitude: latitude,
                        },
                    },
                    create: {
                        longitude,
                        latitude,
                        name: locationName,
                        university: {
                            connect: {
                                id: rso.universityId
                            },
                        },
                    },
                },
            },
            contactPhone,
            contactEmail,
            university: { connect: { id: rso.universityId } },
            type: type || "RSO",
            rso: { connect: { id: rso.id } },
            host: { connect: { id: user.id } },
        },
        include: { location: true },
    });

    return res.status(201).json({ event });
});

export default router;
