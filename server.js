require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ========================
// MIDDLEWARES
// ========================
app.use(cors());
app.use(express.json());

// ========================
// SUPABASE CONFIG
// ========================
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ========================
// ROTA PRINCIPAL
// ========================
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        projeto: 'Central do Apito',
        versao: '1.0.0'
    });
});

// ========================
// JOGOS (READ - SUPABASE)
// ========================
app.get('/api/jogos', async (req, res) => {
    const { data, error } = await supabase
        .from('jogos')
        .select('*');

    if (error) {
        return res.status(400).json({ erro: error.message });
    }

    res.json(data);
});

// ========================
// SELEÇÕES
// ========================
app.get('/api/selecoes', async (req, res) => {
    const { data, error } = await supabase
        .from('selecoes')
        .select('*');

    if (error) {
        return res.status(400).json({ erro: error.message });
    }

    res.json(data);
});

// ========================
// ÁRBITROS
// ========================
app.get('/api/arbitros', async (req, res) => {
    const { data, error } = await supabase
        .from('arbitros')
        .select('*');

    if (error) {
        return res.status(400).json({ erro: error.message });
    }

    res.json(data);
});

// ========================
// ESTÁDIOS
// ========================
app.get('/api/estadios', async (req, res) => {
    const { data, error } = await supabase
        .from('estadios')
        .select('*');

    if (error) {
        return res.status(400).json({ erro: error.message });
    }

    res.json(data);
});

// ========================
// AVALIAÇÕES (GET)
// ========================
app.get('/api/avaliacoes', async (req, res) => {
    const { data, error } = await supabase
        .from('avaliacoes')
        .select('*');

    if (error) {
        return res.status(400).json({ erro: error.message });
    }

    res.json(data);
});

// ========================
// AVALIAÇÕES E ATUALIZAÇÃO DO ÁRBITRO (POST)
// ========================
app.post('/api/avaliacoes', async (req, res) => {
    // Recebe os dados do front-end
    const { arbitroId, nota, comentario, amarelos, vermelhos } = req.body;

    if (!arbitroId || !nota) {
        return res.status(400).json({ error: 'O ID do árbitro e a nota são obrigatórios!' });
    }

    try {
        // 1. Grava a nova avaliação (Removemos a coluna jogo_id que não existe no Supabase)
        const { data: novaAvaliacao, error: erroInsercao } = await supabase
            .from('avaliacoes')
            .insert([
                {
                    arbitro_id: parseInt(arbitroId), 
                    nota: parseInt(nota),
                    comentario: comentario || ''
                }
            ])
            .select();

        if (erroInsercao) {
            console.error("Erro ao inserir na tabela 'avaliacoes':", erroInsercao);
            return res.status(400).json({ error: 'Erro ao inserir avaliação no banco.', details: erroInsercao.message });
        }

        // 2. Busca os dados atuais do árbitro para somar
        const { data: arbitroAtual, error: erroBusca } = await supabase
            .from('arbitros')
            .select('*')
            .eq('id', parseInt(arbitroId))
            .maybeSingle();

        if (erroBusca || !arbitroAtual) {
            console.error("Erro ao buscar árbitro:", erroBusca);
            return res.status(404).json({ error: 'Árbitro não encontrado.' });
        }

        // 3. Faz o cálculo matemático somando o que já tem com o novo jogo
        const dadosAtualizacao = {
            total_pontos: (arbitroAtual.total_pontos || 0) + parseInt(nota),
            votos: (arbitroAtual.votos || 0) + 1,
            jogos: (arbitroAtual.jogos || 0) + 1,
            amarelos: (arbitroAtual.amarelos || 0) + parseInt(amarelos || 0),
            vermelhos: (arbitroAtual.vermelhos || 0) + parseInt(vermelhos || 0)
        };

        // 4. Salva os dados atualizados na tabela do árbitro
        const { error: erroAtualizacao } = await supabase
            .from('arbitros')
            .update(dadosAtualizacao)
            .eq('id', parseInt(arbitroId));

        if (erroAtualizacao) {
            console.error("Erro ao atualizar dados do árbitro:", erroAtualizacao);
            return res.status(400).json({ error: 'Avaliação salva, mas erro ao atualizar estatísticas do árbitro.', details: erroAtualizacao.message });
        }

        // Devolve sucesso absoluto para a sua tela
        return res.status(201).json({ 
            success: true, 
            message: 'Tudo perfeito! Avaliação gravada e árbitro atualizado.',
            data: novaAvaliacao 
        });

    } catch (error) {
        console.error('Erro crítico no POST:', error);
        return res.status(500).json({ 
            error: 'Erro interno no servidor.', 
            details: error.message 
        });
    }
});

// ========================
// EXPORT VERCEL / LOCAL RUN
// ========================
module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando localmente na porta http://localhost:${PORT}`);
    });
}
