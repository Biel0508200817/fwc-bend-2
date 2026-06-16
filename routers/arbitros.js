const express = require('express')
const router = express.Router()

const db = require('../data/database')

router.get('/', async (req, res, next) => {

    try {

        const { data, error } =
            await db.getArbitros()

        if(error) throw error

        res.json(data)

    } catch(err) {
        next(err)
    }

})

module.exports = router