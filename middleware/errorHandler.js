module.exports = (err, req, res, next) => {

    console.error('ERRO:')
    console.error(err)

    res.status(500).json({
        erro: err.message,
        detalhes: err
    })

}