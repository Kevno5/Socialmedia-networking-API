const router = require('express').Router();

const apiRouter = require('./api');

router.use('/api', apiRouter);


router.use((req, res) => {
    res.status(404).send
})


module.exports = router;