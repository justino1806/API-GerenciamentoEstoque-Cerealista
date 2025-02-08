import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import estoqueRoutes from './src/routes/estoqueRoutes.js';
import funcionariosRoutes from './src/routes/funcionariosRoutes.js';
import categoriaRoutes from './src/routes/categoriaRoutes.js';
import participanteRoutes from './src/routes/participanteRoutes.js';
import pedidosRoutes from './src/routes/pedidosRoutes.js';

dotenv.config();

const app = express();

// Configura o body-parser para processar JSON
app.use(bodyParser.json());

app.use('/api/estoque', estoqueRoutes);
app.use('/api/funcionarios', funcionariosRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/participante', participanteRoutes);
app.use('/api/pedidos', pedidosRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});