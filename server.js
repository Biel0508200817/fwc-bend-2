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
// HEALTH CHECK (OBRIGATÓRIO)
// ========================
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        projeto: 'Central do Apito',
        versao: '1.0.0'
    })
})

// ========================
// ROTAS API (SUPABASE)
// ========================

try {
    app.use('/api/jogos', require('./routers/jogos'))
    console.log('✓ /api/jogos carregado')
} catch (err) {
    console.log('✗ erro /api/jogos:', err.message)
}

try {
    app.use('/api/selecoes', require('./routers/selecoes'))
    console.log('✓ /api/selecoes carregado')
} catch (err) {
    console.log('✗ erro /api/selecoes:', err.message)
}

try {
    app.use('/api/arbitros', require('./routers/arbitros'))
    console.log('✓ /api/arbitros carregado')
} catch (err) {
    console.log('✗ erro /api/arbitros:', err.message)
}

try {
    app.use('/api/estadios', require('./routers/estadios'))
    console.log('✓ /api/estadios carregado')
} catch (err) {
    console.log('✗ erro /api/estadios:', err.message)
}

try {
    app.use('/api/avaliacoes', require('./routers/avaliacoes'))
    console.log('✓ /api/avaliacoes carregado')
} catch (err) {
    console.log('✗ erro /api/avaliacoes:', err.message)
}

// ========================
// ERRO GLOBAL (SEGURANÇA)
// ========================
app.use((err, req, res, next) => {
    console.error(err)

    res.status(500).json({
        erro: 'Erro interno do servidor',
        detalhe: err.message
    })
})

// ========================
// EXPORT VERCEL
// ========================
module.exports = app
