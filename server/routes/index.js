import express from 'express';
import universities from './universities.js';
import credentials from './login-register.js';
import rsos from './rsos.js';
import notifications from './notifications.js';
import users from './users.js';
import events from './events.js';
import admin from './admin.js';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => { //Line 9
    res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' }); //Line 10
});

router.use('/universities', universities);
router.use('/users', users);
router.use('/rsos', rsos);
router.use('/notifications', notifications);
router.use('/events', events);
router.use('/admin', admin)
router.use('/', credentials);

export default router;
