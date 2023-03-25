import { Prisma } from '@prisma/client'
import prisma from '../app.js'
import bcrypt from 'bcrypt';

async function createServerAdmin() {

    let user;
    try {
        user = await prisma.user.findUnique({
            where: {
                email: process.env.SERVERADMIN_USER,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.log("You need to run migrations! Run npx prisma migrate dev and then restart the application!");
            return;
        }

    }

    let university = await prisma.university.findUnique({
        where: {
            name: process.env.SERVERADMIN_UNIVERSITY,
        },
    });

    if (!user) {

        let hashedPassword = await bcrypt.hash(process.env.SERVERADMIN_PASSWORD, 10);

        user = await prisma.user.create({
            data: {
                firstName: "Server",
                lastName: "Admin",
                email: process.env.SERVERADMIN_USER,
                password: hashedPassword,
                role: "SERVERADMIN",
            },
        });

        console.log(`Successfully created user ${user.email}.`)
    }

    if (!university) {
        let locationObj = await prisma.location.findUnique({
            where: {
                coordinates: {
                    longitude: 10000.0,
                    latitude: 10000.0,
                },
            },
        });

        if (!locationObj) {
            locationObj = await prisma.location.create({
                data: {
                    name: "Server Admin",
                    latitude: 10000.0,
                    longitude: 10000.0,
                },
            });
        }

        university = await prisma.university.create({
            data: {
                name: process.env.SERVERADMIN_UNIVERSITY,
                location: {
                    connect: {
                        id: locationObj.id,
                    },
                },
                description: "Server Admin University",
                superadmin: {
                    connect: {
                        id: user.id,
                    },
                },
                numStudents: 0,
                picture: "",
            },
        });

            console.log(`Successfully created university ${university.name}.`);
        }

    if (user.universityId !== university.id) {
        user = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                university: {
                    connect: {
                        id: university.id,
                    },
                },
            }
        });
        console.log(`Updated user ${user.email}.`);
    }
}

export default createServerAdmin;
