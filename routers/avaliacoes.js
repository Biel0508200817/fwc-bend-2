const express = require('express')
const router = express.Router()

const db = require('../data/database')

// Listar avaliações
router.get('/', async (req, res, next) => {
    try {

        const { data, error } = await db.getAvaliacoes()

        if (error) throw error

        res.json(data)

    } catch (err) {
        next(err)
    }
})

// Criar avaliação
router.post('/', async (req, res, next) => {
    try {

        const {
            referee_id,
            nota,
            comentario
        } = req.body

        if (!referee_id || !nota) {
            return res.status(400).json({
                erro: 'referee_id e nota são obrigatórios'
            })
        }

        const { data, error } =
            await db.criarAvaliacao({
                referee_id,
                nota,
                comentario
            })

        if (error) throw error

        res.status(201).json(data)

    } catch (err) {
        next(err)
    }
})

module.exports = router