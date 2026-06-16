const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

// ========================
// CREATE (POST)
// ========================
router.post('/', async (req, res) => {
    const { time_casa, time_fora, data } = req.body

    const { data: result, error } = await supabase
        .from('jogos')
        .insert([{ time_casa, time_fora, data }])
        .select()

    if (error) {
        return res.status(400).json({ error: error.message })
    }

    res.json(result)
})

// ========================
// READ ALL (GET)
// ========================
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('jogos')
        .select('*')

    if (error) {
        return res.status(400).json({ error: error.message })
    }

    res.json(data)
})

// ========================
// READ BY ID (GET)
// ========================
router.get('/:id', async (req, res) => {
    const { id } = req.params

    const { data, error } = await supabase
        .from('jogos')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        return res.status(400).json({ error: error.message })
    }

    res.json(data)
})

// ========================
// UPDATE (PUT)
// ========================
router.put('/:id', async (req, res) => {
    const { id } = req.params
    const { time_casa, time_fora, data } = req.body

    const { data: result, error } = await supabase
        .from('jogos')
        .update({ time_casa, time_fora, data })
        .eq('id', id)
        .select()

    if (error) {
        return res.status(400).json({ error: error.message })
    }

    res.json(result)
})

// ========================
// DELETE
// ========================
router.delete('/:id', async (req, res) => {
    const { id } = req.params

    const { error } = await supabase
        .from('jogos')
        .delete()
        .eq('id', id)

    if (error) {
        return res.status(400).json({ error: error.message })
    }

    res.json({ message: 'Jogo deletado com sucesso' })
})

module.exports = router
