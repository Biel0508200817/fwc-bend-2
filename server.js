require('dotenv').config()

const express = require('express')
const cors = require('cors')

const logger = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')

const selecoesRouter = require('./routers/selecoes')
const arbitrosRouter = require('./routers/arbitros')
const estadiosRouter = require('./routers/estadios')
const jogosRouter = require('./routers/jogos')
const avaliacoesRouter = require('./routers/avaliacoes')

const app = express()

app.use(cors())
app.use(express.json())
app.use(logger)

app.get('/', (req, res) => {
    res.status(200).json({
        projeto: 'Central do Apito',
        status: 'online',
        versao: '1.0.0'
    })
})

app.use('/selecoes', selecoesRouter)
app.use('/arbitros', arbitrosRouter)
app.use('/estadios', estadiosRouter)
app.use('/jogos', jogosRouter)
app.use('/avaliacoes', avaliacoesRouter)

app.use(errorHandler)

module.exports = app
