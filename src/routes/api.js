import express from 'express';
import registerHanlder from '../api/register';

const router = express.Router();

router.get('/register', registerHanlder);

module.exports = router;
