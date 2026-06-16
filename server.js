require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()

// ========================
// MIDDLEWARES
// ========================
app.use(cors())
app.use(express.json())

// Logger opcional
try {
    const logger = require('./middleware/logger')
    app.use(logger)
    console.log('✓ logger carregado')
} catch (err) {
    console.log('⚠ logger não carregado')
}

// ========================
// ROTA PRINCIPAL
// ========================
app.get('/', (req, res) => {
    res.status(200).json({
        projeto: 'Central do Apito',
        status: 'online',
        versao: '1.0.0'
    })
})

// ========================
// ROTAS (API PADRÃO)
// ========================

function loadRoute(path, file) {
    try {
        app.use(`/api${path}`, require(file))
        console.log(`✓ rota /api${path} carregada`)
    } catch (err) {
        console.log(`✗ erro na rota /api${path}:`, err.message)
    }
}

loadRoute('/selecoes', './routers/selecoes')
loadRoute('/arbitros', './routers/arbitros')
loadRoute('/estadios', './routers/estadios')
loadRoute('/jogos', './routers/jogos')
loadRoute('/avaliacoes', './routers/avaliacoes')

// ========================
// TESTE RÁPIDO
// ========================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API funcionando corretamente'
    })
})

// ========================
// ERROR HANDLER
// ========================
app.use((err, req, res, next) => {
    console.error('Erro:', err.message)

    res.status(500).json({
        erro: 'Erro interno do servidor',
        detalhe: err.message
    })
})

// ========================
// EXPORT VERCEL
// ========================
module.exports = app
