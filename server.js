const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.log('Erro ao conectar ao banco', err.message)
    } else {
        console.log('Conectado ao SQLite.')
    }
})

db.run(`
    CREATE TABLE IF NOT EXISTS confirmacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    fralda TEXT NOT NULL,
    mimo TEXT
)
    `)

app.options('/confirmar', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
});

app.post('/confirmar', (req, res) => {
    const { nome, fralda, mimo } = req.body
    if (!nome || !fralda) {
        return res.status(400).json({ error: 'Nome e tamanho da fralda são obrigatórios.' })
    }

    const sql = 'INSERT INTO confirmacoes (nome, fralda, mimo) VALUES (?, ?, ?)'
    db.run(sql, [nome, fralda, mimo || null], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao salvar no banco.' })
        }
        res.json({ id: this.lastID })
    })
})

app.get('/confirmacoes', (req, res) => {
    const sql = 'SELECT nome, fralda, mimo FROM confirmacoes'
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao consultar banco.' });
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});