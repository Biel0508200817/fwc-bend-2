require('dotenv').config()

const express = require('express')
const cors = require('cors')

// Middleware (com proteção contra crash)
let logger
let errorHandler

try {
    logger = require('./middleware/logger')
    console.log('✓ logger carregado')
} catch (err) {
    console.error('✗ erro logger:', err.message)
    logger = (req, res, next) => next()
}

try {
    errorHandler = require('./middleware/errorHandler')
    console.log('✓ errorHandler carregado')
} catch (err) {
    console.error('✗ erro errorHandler:', err.message)
    errorHandler = (err, req, res, next) => {
        res.status(500).json({ erro: 'Erro interno' })
    }
}

// Routers (com proteção contra crash)
let selecoesRouter, arbitrosRouter, estadiosRouter, jogosRouter, avaliacoesRouter

try {
    selecoesRouter = require('./routers/selecoes')
    console.log('✓ selecoes OK')
} catch (err) {
    console.error('✗ selecoes erro:', err.message)
}

try {
    arbitrosRouter = require('./routers/arbitros')
    console.log('✓ arbitros OK')
} catch (err) {
    console.error('✗ arbitros erro:', err.message)
}

try {
    estadiosRouter = require('./routers/estadios')
    console.log('✓ estadios OK')
} catch (err) {
    console.error('✗ estadios erro:', err.message)
}

try {
    jogosRouter = require('./routers/jogos')
    console.log('✓ jogos OK')
} catch (err) {
    console.error('✗ jogos erro:', err.message)
}

try {
    avaliacoesRouter = require('./routers/avaliacoes')
    console.log('✓ avaliacoes OK')
} catch (err) {
    console.error('✗ avaliacoes erro:', err.message)
}

const app = express()

app.use(cors())
app.use(express.json())

// Logger seguro
if (logger) app.use(logger)

// Rota principal (OK na Vercel)
app.get('/', (req, res) => {
    res.status(200).json({
        projeto: 'Central do Apito',
        status: 'online',
        versao: '1.0.0'
    })
})

// Rotas (somente se carregaram)
if (selecoesRouter) app.use('/selecoes', selecoesRouter)
if (arbitrosRouter) app.use('/arbitros', arbitrosRouter)
if (estadiosRouter) app.use('/estadios', estadiosRouter)
if (jogosRouter) app.use('/jogos', jogosRouter)
if (avaliacoesRouter) app.use('/avaliacoes', avaliacoesRouter)

// Error handler no final
app.use(errorHandler)

// IMPORTANTE: VERCEL SERVERLESS
module.exports = app
