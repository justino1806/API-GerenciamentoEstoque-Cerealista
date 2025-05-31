import express from 'express';
import upload from '../config/uploadConfig.js';
import { listarFuncionariosController, adicionarFuncionarioController, atualizarFuncionarioController, deletarFuncionarioController, listarFuncionarioPorIdController } from '../controller/funcionariosController.js';
import { verificaNivelAcesso } from '../auth/authMiddleware.js';

const router = express.Router();

router.get('/', listarFuncionariosController);
router.get('/:id', listarFuncionarioPorIdController);
router.post('/', upload.single('imagemFuncionario'), adicionarFuncionarioController, verificaNivelAcesso(1)); // Adicionar novo funcionário com upload de imagem, exige nível de acesso 1
router.put('/:id', atualizarFuncionarioController, verificaNivelAcesso(1)); // Atualizar funcionário, exige nível de acesso 1
router.delete('/:id', deletarFuncionarioController, verificaNivelAcesso(1)); // Deletar funcionário, exige nível de acesso 1

export default router;