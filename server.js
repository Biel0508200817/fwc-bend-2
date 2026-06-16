require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

// Middleware Logger
try {
    const logger = require('./middleware/logger')
    app.use(logger)
    console.log('✓ logger carregado')
} catch (err) {
    console.error('✗ Erro em logger:', err.message)
}

// Rota principal
app.get('/', (req, res) => {
    res.status(200).json({
        projeto: 'Central do Apito',
        status: 'online',
        versao: '1.0.0'
    })
})

// Rotas
try {
    app.use('/selecoes', require('./routers/selecoes'))
    console.log('✓ Router selecoes carregado')
} catch (err) {
    console.error('✗ Erro em selecoes:', err.message)
}

try {
    app.use('/arbitros', require('./routers/arbitros'))
    console.log('✓ Router arbitros carregado')
} catch (err) {
    console.error('✗ Erro em arbitros:', err.message)
}

try {
    app.use('/estadios', require('./routers/estadios'))
    console.log('✓ Router estadios carregado')
} catch (err) {
    console.error('✗ Erro em estadios:', err.message)
}

try {
    app.use('/jogos', require('./routers/jogos'))
    console.log('✓ Router jogos carregado')
} catch (err) {
    console.error('✗ Erro em jogos:', err.message)
}

try {
    app.use('/avaliacoes', require('./routers/avaliacoes'))
    console.log('✓ Router avaliacoes carregado')
} catch (err) {
    console.error('✗ Erro em avaliacoes:', err.message)
}

// Error Handler
try {
    const errorHandler = require('./middleware/errorHandler')
    app.use(errorHandler)
    console.log('✓ errorHandler carregado')
} catch (err) {
    console.error('✗ Erro em errorHandler:', err.message)
}

const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () => {
    console.log('\n========================')
    console.log(`Servidor rodando`)
    console.log(`http://localhost:${PORT}`)
    console.log('========================\n')
})

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Porta ${PORT} já está em uso.`)
        console.error('Feche o outro servidor ou altere a porta.')
    } else {
        console.error('❌ Erro ao iniciar servidor:', err)
    }
})
