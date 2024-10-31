const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const session = require('express-session')
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS
app.use(cors());
app.use(express.json());
app.use(express.static("views/static"))
app.use(express.static("uploads"))

app.use(session({
    secret: 'pdagame_hh2ha0s32',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

const verificarAuth = function(req, res, next){
    if(req.session.auth == false)
    {
        console.log('Não autorizado');
        res.redirect('/')
    }
    else
    {
        next()
    }
}

// Configuração da conexão com o banco de dados
const pool = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.USER,
    password: process.env.PASSWORD, // Substitua pela sua senha do banco de dados
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

// Função para executar uma consulta no banco de dados
const queryDatabase = async (query, params = []) => {
    const [results] = await pool.query(query, params);
    return results;
};

app.get('/api/get_item/:table/:id', verificarAuth, async (req, res) => {
    const { table, id } = req.params;

    try {
        const validTables = ['quiz', 'consequencia', 'curiosidade', 'sorte_ou_azar'];
        if (!validTables.includes(table)) {
            return res.status(400).json({ error: 'Tabela inválida' });
        }

        const results = await queryDatabase(`SELECT * FROM ${table} WHERE id = ?`, [id]);

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: 'Item não encontrado' });
        }
    } catch (error) {
        console.error("Erro ao buscar item:", error);
        res.status(500).json({ error: "Erro interno do servidor. Por favor, tente novamente mais tarde." });
    }
});

// Função para excluir um arquivo
const excluirArquivo = (caminho) => {
    return new Promise((resolve, reject) => {
        fs.unlink(caminho, (erro) => {
            if (erro) {
                return reject(erro);
            }
            resolve();
        });
    });
};

// Configuração do multer para armazenamento de arquivos na pasta "uploads"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const mw_upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,"/views/index.html"))
})

// Rota para editar a tabela 'quiz'
app.put('/api/edit/quiz/:id', [verificarAuth, mw_upload.single('arquivo')], async (req, res) => {
    const { pergunta, resposta } = req.body;
    const file = req.file;
    const itemId = req.params.id;

    try {
        let url = null;
        if (file) {
            url = `/uploads/${file.filename}`;
            const [existing] = await queryDatabase('SELECT url FROM quiz WHERE id = ?', [itemId]);
            if (existing && existing.url) {
                await excluirArquivo(`uploads/${existing.url.split('/').pop()}`);
            }
        }

        const results = await queryDatabase(
            'UPDATE quiz SET pergunta = ?, resposta = ?, url = IFNULL(?, url) WHERE id = ?',
            [pergunta, resposta, url, itemId]
        );

        res.json({ message: 'Edição realizada com sucesso!' });
    } catch (error) {
        if (file) {
            await excluirArquivo(`uploads/${file.filename}`);
        }
        console.error("Erro ao editar:", error);
        res.status(500).json({ error: "Erro interno do servidor. Por favor, tente novamente mais tarde." });
    }
});

// Rota para editar a tabela 'consequencia'
app.put('/api/edit/consequencia/:id', [verificarAuth, mw_upload.single('arquivo')], async (req, res) => {
    const { descricao } = req.body;
    const file = req.file;
    const itemId = req.params.id;

    try {
        let url = null;
        if (file) {
            url = `/uploads/${file.filename}`;
            const [existing] = await queryDatabase('SELECT url FROM consequencia WHERE id = ?', [itemId]);
            if (existing && existing.url) {
                await excluirArquivo(`uploads/${existing.url.split('/').pop()}`);
            }
        }

        const results = await queryDatabase(
            'UPDATE consequencia SET descricao = ?, url = IFNULL(?, url) WHERE id = ?',
            [descricao, url, itemId]
        );

        res.json({ message: 'Edição realizada com sucesso!' });
    } catch (error) {
        if (file) {
            await excluirArquivo(`uploads/${file.filename}`);
        }
        console.error("Erro ao editar:", error);
        res.status(500).json({ error: "Erro interno do servidor. Por favor, tente novamente mais tarde." });
    }
});

// Rota para editar a tabela 'curiosidade'
app.put('/api/edit/curiosidade/:id', [verificarAuth, mw_upload.single('arquivo')], async (req, res) => {
    const { descricao } = req.body;
    const file = req.file;
    const itemId = req.params.id;

    try {
        let url = null;
        if (file) {
            url = `/uploads/${file.filename}`;
            const [existing] = await queryDatabase('SELECT url FROM curiosidade WHERE id = ?', [itemId]);
            if (existing && existing.url) {
                await excluirArquivo(`uploads/${existing.url.split('/').pop()}`);
            }
        }

        const results = await queryDatabase(
            'UPDATE curiosidade SET descricao = ?, url = IFNULL(?, url) WHERE id = ?',
            [descricao, url, itemId]
        );

        res.json({ message: 'Edição realizada com sucesso!' });
    } catch (error) {
        if (file) {
            await excluirArquivo(`uploads/${file.filename}`);
        }
        console.error("Erro ao editar:", error);
        res.status(500).json({ error: "Erro interno do servidor. Por favor, tente novamente mais tarde." });
    }
});

// Rota para editar a tabela 'sorte_ou_azar'
app.put('/api/edit/sorte_ou_azar/:id', [verificarAuth, mw_upload.single('arquivo')], async (req, res) => {
    const { descricao } = req.body;
    const file = req.file;
    const itemId = req.params.id;

    try {
        let url = null;
        if (file) {
            url = `/uploads/${file.filename}`;
            const [existing] = await queryDatabase('SELECT url FROM sorte_ou_azar WHERE id = ?', [itemId]);
            if (existing && existing.url) {
                await excluirArquivo(`uploads/${existing.url.split('/').pop()}`);
            }
        }

        const results = await queryDatabase(
            'UPDATE sorte_ou_azar SET descricao = ?, url = IFNULL(?, url) WHERE id = ?',
            [descricao, url, itemId]
        );

        res.json({ message: 'Edição realizada com sucesso!' });
    } catch (error) {
        if (file) {
            await excluirArquivo(`uploads/${file.filename}`);
        }
        console.error("Erro ao editar:", error);
        res.status(500).json({ error: "Erro interno do servidor. Por favor, tente novamente mais tarde." });
    }
});

// Rota para cadastrar na tabela 'quiz' com upload de arquivo
app.post('/api/intra/quiz', [verificarAuth, mw_upload.single('arquivo')], async (req, res) => {
    const { pergunta, resposta } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
    }

    const url = `/uploads/${file.filename}`;

    try {
        const results = await queryDatabase('INSERT INTO quiz (pergunta, resposta, url) VALUES (?, ?, ?)', [pergunta, resposta, url]);
        res.json({ message: 'Cadastro realizado com sucesso!', id: results.insertId });
    } catch (error) {
        await excluirArquivo(`uploads/${file.filename}`);
        console.error("Erro ao cadastrar:", error);
        res.status(500).json({ error: "Erro interno do servidor. Por favor, tente novamente mais tarde." });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "views/index.html"))
})

app.post('/api/intranet/login/', async (req, res) => {
    const { user, password } = req.body;

    try {
        const rows = await queryDatabase(
            "SELECT * FROM cadastros WHERE email = ? AND senha = ?",
            [user, password]
        );

       

        if (rows.length > 0) {
            // Login bem-sucedido
            req.session.auth = true
            req.session.save(() => console.log("Cookie Auth"))
            res.status(200).json({ message: 'Login bem-sucedido!' });
           
        } else {
            // Credenciais inválidas
            res.status(401).json({ message: 'Email ou senha incorretos.' });
            console.log('Login mal-sucedido!')
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao acessar o banco de dados.' });
    }
});

// Rota para cadastrar na tabela 'consequencia' com upload de arquivo
app.post('/api/intra/consequencia', [verificarAuth, mw_upload.single('arquivo')], async (req, res) => {
    const { descricao } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
    }

    const url = `/uploads/${file.filename}`;

    try {
        const results = await queryDatabase('INSERT INTO consequencia (descricao, url) VALUES (?, ?)', [descricao, url]);
        res.json({ message: 'Cadastro realizado com sucesso!', id: results.insertId });
    } catch (error) {
        await excluirArquivo(`uploads/${file.filename}`);
        console.error("Erro ao cadastrar:", error);
        res.status(500).json({ error: "Erro interno do servidor. Por favor, tente novamente mais tarde." });
    }
});


// Rota para cadastrar na tabela 'curiosidade'
app.post('/api/intra/curiosidade', [verificarAuth, mw_upload.single('arquivo')], async (req, res) => {
    const { descricao } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
    }

    const url = `/uploads/${file.filename}`;

    try {
        const results = await queryDatabase('INSERT INTO curiosidade (descricao, url) VALUES (?, ?)', [descricao, url]);
        res.json({ message: 'Cadastro realizado com sucesso!', id: results.insertId });
    } catch (error) {
        await excluirArquivo(`uploads/${file.filename}`);
        console.error("Erro ao cadastrar:", error);
        res.status(500).json({ error: "Erro interno do servidor. Por favor, tente novamente mais tarde." });
    }
});

// Rota para cadastrar na tabela 'sorte_ou_azar'
app.post('/api/intra/sorte_ou_azar', [verificarAuth, mw_upload.single('arquivo')], async (req, res) => {
    const { descricao } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
    }

    const url = `/uploads/${file.filename}`;

    try {
        const results = await queryDatabase('INSERT INTO sorte_ou_azar (descricao, url) VALUES (?, ?)', [descricao, url]);
        res.json({ message: 'Cadastro realizado com sucesso!', id: results.insertId });
    } catch (error) {
        await excluirArquivo(`uploads/${file.filename}`);
        console.error("Erro ao cadastrar:", error);
        res.status(500).json({ error: "Erro interno do servidor. Por favor, tente novamente mais tarde." });
    }
});

// Rota para obter dados da tabela 'consequencia'
app.get('/api/consequencia', verificarAuth, async (req, res) => {
    try {
        const results = await queryDatabase('SELECT * FROM consequencia');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para obter dados da tabela 'curiosidade'
app.get('/api/curiosidade', verificarAuth, async (req, res) => {
    try {
        const results = await queryDatabase('SELECT * FROM curiosidade');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para obter dados da tabela 'quiz'
app.get('/api/quiz', verificarAuth, async (req, res) => {
    try {
        const results = await queryDatabase('SELECT * FROM quiz');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para obter dados da tabela 'sorte_ou_azar'
app.get('/api/sorte_ou_azar', verificarAuth, async (req, res) => {
    try {
        const results = await queryDatabase('SELECT * FROM sorte_ou_azar');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/delete_item/:table/:id', verificarAuth, async (req, res) => {
    const tableName = req.params.table;
    const itemId = req.params.id;

    try {
        const validTables = ['quiz', 'consequencia', 'curiosidade', 'sorte_ou_azar'];
        if (!validTables.includes(tableName)) {
            console.log("Tabela inválida:", tableName);
            return res.status(400).json({ message: "Tabela inválida." });
        }

        // Verificar se itemId é um número
        if (isNaN(itemId)) {
            console.log("ID do item inválido:", itemId);
            return res.status(400).json({ message: "ID do item inválido." });
        }

        const rows = await queryDatabase(`SELECT url FROM ${tableName} WHERE id = ?`, [itemId]);
        console.log("Resultado da consulta:", rows);

        if (rows.length > 0) {
            const imageUrl = rows[0].url;
            console.log("URL da imagem:", imageUrl);

            const imagePath = path.join(__dirname, 'uploads', path.basename(imageUrl));
            console.log("Caminho da imagem:", imagePath);

            // Verificar se o arquivo realmente existe
            fs.access(imagePath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error("Arquivo não encontrado:", err);
                    return res.status(500).json({ message: "Arquivo não encontrado." });
                }

                // Remover o arquivo
                fs.unlink(imagePath, async (err) => {
                    if (err) {
                        console.error("Erro ao remover a imagem:", err);
                        return res.status(500).json({ message: "Erro ao remover a imagem." });
                    }

                    // Remover o registro do banco de dados
                    await queryDatabase(`DELETE FROM ${tableName} WHERE id = ?`, [itemId]);
                    res.status(200).json({ message: "Item excluído com sucesso." });
                });
            });
        } else {
            console.log("Item não encontrado:", itemId);
            res.status(404).json({ message: "Item não encontrado." });
        }
    } catch (error) {
        console.error("Erro ao excluir item:", error);
        res.status(500).json({ message: "Erro ao excluir o item." });
    }
});


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://*:${PORT}`);
});
