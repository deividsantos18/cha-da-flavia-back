const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3000

app.use(cors({ origin: 'https://deividsantos18.github.io/cha-da-flavia-front/' }))
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
    presenca TEXT NOT NULL,
    presente TEXT
)
    `)

app.post('/confirmar', (req, res) => {
    const { nome, presenca, presente } = req.body
    if (!nome || !presenca) {
        return res.status(400).json({ error: 'Nome e presença são obrigatórios.' })
    }

    const sql = 'INSERT INTO confirmacoes (nome, presenca, presente) VALUES (?, ?, ?)'
    db.run(sql, [nome, presenca, presente || null], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao salvar no banco.' })
        }
        res.json({ id: this.lastID })
    })
})

app.get('/presentes', (req, res) => {
    const sql = 'SELECT nome, presente FROM confirmacoes WHERE presenca = "vou" AND presente IS NOT NULL AND presente != ""';
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