require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()

// Middlewares básicos
app.use(cors())
app.use(express.json())

// Middleware: logger (seguro)
try {
    const logger = require('./middleware/logger')
    app.use(logger)
    console.log('✓ logger carregado')
} catch (err) {
    console.log('⚠ logger não carregado:', err.message)
}

// ROTA PRINCIPAL
app.get('/', (req, res) => {
    res.status(200).json({
        projeto: 'Central do Apito',
        status: 'online',
        versao: '1.0.0'
    })
})

// ========================
// ROTAS (com proteção contra crash)
// ========================

function safeUse(path, file) {
    try {
        app.use(path, require(file))
        console.log(`✓ rota ${path} carregada`)
    } catch (err) {
        console.log(`✗ erro na rota ${path}:`, err.message)
    }
}

safeUse('/selecoes', './routers/selecoes')
safeUse('/arbitros', './routers/arbitros')
safeUse('/estadios', './routers/estadios')
safeUse('/jogos', './routers/jogos')
safeUse('/avaliacoes', './routers/avaliacoes')

// Middleware de erro (seguro)
try {
    const errorHandler = require('./middleware/errorHandler')
    app.use(errorHandler)
    console.log('✓ errorHandler carregado')
} catch (err) {
    console.log('⚠ errorHandler não carregado:', err.message)

    app.use((err, req, res, next) => {
        res.status(500).json({
            erro: err.message || 'Erro interno'
        })
    })
}

// EXPORT PARA VERCEL (OBRIGATÓRIO)
module.exports = app
