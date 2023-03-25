import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => { //Line 9
    res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' }); //Line 10
});

export default router;
