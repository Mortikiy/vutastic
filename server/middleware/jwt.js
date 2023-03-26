import jwt from 'jsonwebtoken';
import prisma from '../bin/db.js'

const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({ where: { id: decoded.userId }});

            if (user) {
                req.user = user;
                next();
            } else {
                res.status(401).json({ error: 'Invalid token' });
            }
        } catch (error) {
            console.log(error)
            res.status(401).json({ error: 'Invalid token' });
        }
    } else {
        res.status(401).json({ error: 'Authorization header required'});
    }
}

export default authenticateJWT;
