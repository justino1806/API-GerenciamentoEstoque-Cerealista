import express from 'express';
import { /* registrarMovimentacaoController, */ listarProdutosController, adicionarProdutoController, listarMovimentacoesController, atualizarProdutoController, deletarProdutoController, visualizarProdutoPorIdController } from '../controller/estoqueController.js';
import upload from '../config/uploadConfig.js';

const router = express.Router();

/* router.post('/movimentacao', registrarMovimentacaoController); */ //Rota desnecessária - migrada para rota de pedidos
router.get('/movimentacao', listarMovimentacoesController); // Listar histórico de movimentações

router.get('/produtos', listarProdutosController); // Listar produtos
router.get('/produtos/:id', visualizarProdutoPorIdController) // Visualizar produto por ID
router.post('/produtos', upload.single('imagemProduto'), adicionarProdutoController); // Adicionar novo produto com upload de imagem
/* router.post('/produtos', adicionarProdutoController); */
router.put('/produtos/:id', atualizarProdutoController); // Atualizar produto
router.delete('/produtos/:id', deletarProdutoController); // Deletar produto


export default router;


