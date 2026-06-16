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
    process.env.SUPABASE_KEY
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

// ROTA POST: Receber e salvar a avaliação do torcedor
app.post('/api/avaliacoes', async (req, res) => {
    const { arbitroId, nota, comentario, jogoId } = req.body;

    // Validação básica
    if (!arbitroId || !nota) {
        return res.status(400).json({ error: 'O ID do árbitro e a nota são obrigatórios!' });
    }

    try {
        // 1. Insere a avaliação na tabela 'avaliacoes'
        // ATENÇÃO: Ajuste os nomes das colunas ('arbitro_id', 'jogo_id') se no seu banco estiver camelCase
        const { data: novaAvaliacao, error: erroInsercao } = await supabase
            .from('avaliacoes')
            .insert([
                {
                    arbitro_id: parseInt(arbitroId),
                    jogo_id: jogoId ? parseInt(jogoId) : null,
                    nota: parseInt(nota),
                    comentario: comentario || ''
                }
            ])
            .select();

        if (erroInsercao) throw erroInsercao;

        // 2. Atualiza os dados de média do árbitro na tabela 'arbitros'
        // Buscamos os valores atuais de votos e total_pontos
        const { data: arbitroAtual, error: erroBusca } = await supabase
            .from('arbitros')
            .select('votos, total_pontos')
            .eq('id', parseInt(arbitroId))
            .single();

        if (erroBusca) throw erroBusca;

        // Calculamos os novos totais acumulados
        const novosVotos = (arbitroAtual.votos || 0) + 1;
        const novosPontos = (arbitroAtual.total_pontos || 0) + parseInt(nota);

        // Salvamos de volta na tabela 'arbitros'
        const { error: erroAtualizacao } = await supabase
            .from('arbitros')
            .update({ 
                votos: novosVotos, 
                total_pontos: novosPontos 
            })
            .eq('id', parseInt(arbitroId));

        if (erroAtualizacao) throw erroAtualizacao;

        // Retorna sucesso total para o front-end
        return res.status(201).json({ 
            success: true, 
            message: 'Avaliação computada com sucesso!',
            data: novaAvaliacao 
        });

    } catch (error) {
        console.error('Erro na rota /api/avaliacoes:', error);
        return res.status(500).json({ 
            error: 'Erro interno ao salvar no Supabase.', 
            details: error.message 
        });
    }
});

// ========================
// EXPORT VERCEL
// ========================
module.exports = app
