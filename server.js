require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()

// ========================
// MIDDLEWARES
// ========================
app.use(cors())
app.use(express.json())

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
// JOGOS
// ========================
app.get('/api/jogos', (req, res) => {
    res.json({
        mensagem: 'Lista de jogos funcionando',
        dados: []
    })
})

// ========================
// SELEÇÕES
// ========================
app.get('/api/selecoes', (req, res) => {
    res.json({
        mensagem: 'Seleções funcionando',
        dados: []
    })
})

// ========================
// ÁRBITROS
// ========================
app.get('/api/arbitros', (req, res) => {
    res.json({
        mensagem: 'Árbitros funcionando',
        dados: []
    })
})

// ========================
// ESTÁDIOS
// ========================
app.get('/api/estadios', (req, res) => {
    res.json({
        mensagem: 'Estádios funcionando',
        dados: []
    })
})

// ========================
// AVALIAÇÕES
// ========================
app.get('/api/avaliacoes', (req, res) => {
    res.json({
        mensagem: 'Avaliações funcionando',
        dados: []
    })
})

// ========================
// EXPORT VERCEL
// ========================
module.exports = app
