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
// AVALIAÇÕES (GET)
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
// AVALIAÇÕES (POST)
// ========================
app.post('/api/avaliacoes', async (req, res) => {
    const { arbitroId, nota, comentario, jogoId } = req.body;

    // Validação básica de payload
    if (!arbitroId || !nota) {
        return res.status(400).json({ error: 'O ID do árbitro e a nota são obrigatórios!' });
    }

    try {
        // 1. Insere a avaliação na tabela 'avaliacoes'
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

        if (erroInsercao) {
            console.error("Erro ao inserir na tabela 'avaliacoes':", erroInsercao);
            return res.status(400).json({ error: 'Erro ao inserir avaliação no banco.', details: erroInsercao.message });
        }

        // 2. Busca o árbitro correspondente para recalcular estatísticas
        const { data: arbitroAtual, error: erroBusca } = await supabase
            .from('arbitros')
            .select('*')
            .eq('id', parseInt(arbitroId))
            .maybeSingle();

        if (erroBusca || !arbitroAtual) {
            console.error("Erro ao buscar árbitro ou ID inexistente:", erroBusca);
            return res.status(404).json({ error: 'Árbitro não encontrado para atualização de estatísticas.' });
        }

        // Mapeamento inteligente para evitar quebras por diferença de camelCase/snake_case nas notas
        const votosAtuais = arbitroAtual.votos || arbitroAtual.votos_totais || 0;
        const pontosAtuais = arbitroAtual.total_pontos || arbitroAtual.totalPontos || 0;

        const novosVotos = votosAtuais + 1;
        const novosPontos = pontosAtuais + parseInt(nota);

        // Monta o payload dinamicamente com base nas colunas existentes na sua tabela do Supabase
        const dadosAtualizacao = {};
        if ('total_pontos' in arbitroAtual) dadosAtualizacao.total_pontos = novosPontos;
        else if ('totalPontos' in arbitroAtual) dadosAtualizacao.totalPontos = novosPontos;
        
        if ('votos' in arbitroAtual) dadosAtualizacao.votos = novosVotos;
        else if ('votos_totais' in arbitroAtual) dadosAtualizacao.votos_totais = novosVotos;

        // 3. Atualiza os dados de pontuação na tabela 'arbitros'
        const { error: erroAtualizacao } = await supabase
            .from('arbitros')
            .update(dadosAtualizacao)
            .eq('id', parseInt(arbitroId));

        if (erroAtualizacao) {
            console.error("Erro ao atualizar dados acumulados do árbitro:", erroAtualizacao);
            return res.status(400).json({ error: 'Avaliação registrada, mas houve falha ao atualizar a média do árbitro.', details: erroAtualizacao.message });
        }

        // Retorno de sucesso absoluto para o front-end
        return res.status(201).json({ 
            success: true, 
            message: 'Avaliação e estatísticas computadas com sucesso!',
            data: novaAvaliacao 
        });

    } catch (error) {
        console.error('Erro crítico na execução do POST /api/avaliacoes:', error);
        return res.status(500).json({ 
            error: 'Erro interno no servidor ao processar a requisição.', 
            details: error.message 
        });
    }
});

// ========================
// EXPORT VERCEL / LOCAL RUN
// ========================
module.exports = app;

// Inicia o servidor localmente se executado direto via node (ex: node server.js)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando localmente na porta http://localhost:${PORT}`);
    });
}
