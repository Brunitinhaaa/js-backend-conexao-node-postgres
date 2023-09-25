const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

const Pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123456',
    database: 'biblioteca'
})

app.post('/autor', async (req, res) => {
    const { nome, idade } = req.body;

    try {
        const query = 'INSERT INTO AUTORES (nome, idade) VALUES ($1, $2) RETURNING *';
        const values = [nome, idade];
        const resultado = await Pool.query(query, values);

        return res.json(resultado.rows[0]);

    } catch (error) {
        console.log(error);
        return res.status(400).json({ mensagem: 'o campo nome é obrigatório.' })
    }
})

app.get('/autor/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT AUTORES.id AS autor_id, 
            AUTORES.nome AS autor_nome, 
            AUTORES.idade AS autor_idade, 
            LIVROS.id AS livro_id, 
            LIVROS.nome AS livro_nome, 
            LIVROS.genero AS livro_genero, 
            LIVROS.editora AS livro_editora, 
            LIVROS.data_publicacao AS livro_data_publicacao 

            FROM AUTORES

            LEFT JOIN LIVROS ON AUTORES.id = LIVROS.id_autor

            WHERE AUTORES.id = $1;
        `;
        const values = [id];
        const resultado = await Pool.query(query, values);

        const autordoslivros = {
            id: resultado.rows[0].autor_id,
            nome: resultado.rows[0].autor_nome,
            idade: resultado.rows[0].autor_idade,
            livros: resultado.rows.map((row) => ({
                id: row.livro_id,
                nome: row.livro_nome,
                genero: row.livro_genero,
                editora: row.livro_editora,
                data_publicacao: row.livro_data_publicacao,
            })),
        };

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Autor não encontrado.' });
        }

        return res.json(autordoslivros);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
    }
})

app.post('/autor/:id/livro', async (req, res) => {
    const { id } = req.params;
    const { nome, genero, editora, data_publicacao } = req.body;

    try {
        const query = 'INSERT INTO LIVROS (nome, genero, editora, data_publicacao,  id_autor) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const values = [nome, genero, editora, data_publicacao, id];
        const resultado = await Pool.query(query, values);

        if (isNaN(Number(id))) {
            return res.status(400).json({ mensagem: 'ID do autor inválido.' });
        }

        return res.json(resultado.rows[0]);

    } catch (error) {
        console.log(error);
        return res.status(400).json({ mensagem: 'o campo nome é obrigatório.' })
    }
})

app.get('/livro', async (req, res) => {

    try {
        const query = `
            SELECT LIVROS.id AS livro_id, LIVROS.nome AS livro_nome, LIVROS.genero AS livro_genero, 
                   LIVROS.editora AS livro_editora, LIVROS.data_publicacao AS livro_data_publicacao, 
                   AUTORES.id AS autor_id, AUTORES.nome AS autor_nome, AUTORES.idade AS autor_idade 
            FROM LIVROS
            LEFT JOIN AUTORES ON LIVROS.id_autor = AUTORES.id;
        `;
        const resultado = await Pool.query(query);

        const livros = resultado.rows.map((row) => ({
            id: row.livro_id,
            nome: row.livro_nome,
            genero: row.livro_genero,
            editora: row.livro_editora,
            data_publicacao: row.livro_data_publicacao,
            autor: {
                id: row.autor_id,
                nome: row.autor_nome,
                idade: row.autor_idade,
            },
        }));

        return res.json(livros);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});


app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

