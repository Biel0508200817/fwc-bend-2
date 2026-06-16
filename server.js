require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')

const app = express()

// ========================
// MIDDLEWARES
// ========================
app.use(cors())
app.use(express.json())

// ========================
// SUPABASE CONFIG
// ========================
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

// ========================
// ROTA PRINCIPAL
// ========================
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        projeto: 'Central do Apito',
        versao: '1.0.0'
    })
})

// ========================
// JOGOS (READ - SUPABASE)
// ========================
app.get('/api/jogos', async (req, res) => {
    const { data, error } = await supabase
        .from('jogos')
        .select('*')

    if (error) {
        return res.status(400).json({
            erro: error.message
        })
    }

    res.json(data)
})

// ========================
// SELEÇÕES
// ========================
app.get('/api/selecoes', async (req, res) => {
    const { data, error } = await supabase
        .from('selecoes')
        .select('*')

    if (error) {
        return res.status(400).json({
            erro: error.message
        })
    }

    res.json(data)
})

// ========================
// ÁRBITROS
// ========================
app.get('/api/arbitros', async (req, res) => {
    const { data, error } = await supabase
        .from('arbitros')
        .select('*')

    if (error) {
        return res.status(400).json({
            erro: error.message
        })
    }

    res.json(data)
})

// ========================
// ESTÁDIOS
// ========================
app.get('/api/estadios', async (req, res) => {
    const { data, error } = await supabase
        .from('estadios')
        .select('*')

    if (error) {
        return res.status(400).json({
            erro: error.message
        })
    }

    res.json(data)
})

// ========================
// AVALIAÇÕES
// ========================
app.get('/api/avaliacoes', async (req, res) => {
    const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')

    if (error) {
        return res.status(400).json({
            erro: error.message
        })
    }

    res.json(data)
})

// ========================
// EXPORT VERCEL
// ========================
module.exports = app
