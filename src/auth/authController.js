import crypto from 'crypto';
import { enviarEmail } from '../config/emailConfig.js';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import conectarAoBanco from '../config/dbconfig.js';

const conexao = await conectarAoBanco();

export async function login(req, res) {
    try {
        const { email, senha } = req.body;
        console.log('Tentativa Login: ', {email, senha});

        // Busca funcionário pelo email
        const [funcionarios] = await conexao.execute(
            'SELECT * FROM funcionarios WHERE email = ?',
            [email]
        );
        console.log('Funcionário encontrado:', funcionarios[0]);

        if (funcionarios.length === 0) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        const funcionario = funcionarios[0];
        console.log('Comparação senha:', await bcrypt.compare(senha, funcionarios[0].senha));

        // Verifica senha
        const senhaValida = await bcrypt.compare(senha, funcionario.senha);
        if (!senhaValida) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        // Gera token
        const token = jwt.sign(
            { 
                id: funcionario.id_funcionario,
                nivel_acesso: funcionario.nivel_acesso 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Atualiza token no banco
        await conexao.execute(
            'UPDATE funcionarios SET token = ? WHERE id_funcionario = ?',
            [token, funcionario.id_funcionario]
        );

        res.json({
            token,
            funcionario: {
                id: funcionario.id_funcionario,
                nome: funcionario.nome_funcionario,
                nivel_acesso: funcionario.nivel_acesso,
                imagem_funcionario: funcionario.imagem_funcionario
            }
        });
    } catch (erro) {
        console.error('Erro no login:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
}

export async function logout(req, res) {
    try {
        const funcionarioId = req.funcionario.id;
        
        // Remove o token do banco
        await conexao.execute(
            'UPDATE funcionarios SET token = NULL WHERE id_funcionario = ?',
            [funcionarioId]
        );
        
        res.json({ message: 'Logout realizado com sucesso' });
    } catch (erro) {
        res.status(500).json({ message: 'Erro ao realizar logout' });
    }
}

export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        console.log('Iniciando recuperação para:', email);
        
        // Verifica se o email existe
        const [funcionarios] = await conexao.execute(
            'SELECT id_funcionario, nome_funcionario FROM funcionarios WHERE email = ?',
            [email]
        );
        const nome = funcionarios[0].nome_funcionario;
        console.log('Nome do funcionário:', nome);

        if (funcionarios.length === 0) {
            return res.status(404).json({ message: 'Email não encontrado' });
        }

        // Gera token único
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 hora

        // Salva token no banco
        await conexao.execute(
            'UPDATE funcionarios SET reset_token = ?, reset_expires = ? WHERE email = ?',
            [resetToken, resetExpires, email]
        );

        // Envia email
        const resetUrl = `http://127.0.0.1:5500/index.html?token=${resetToken}`; // TROCAR ISSO EM PRODUÇÃO
        const htmlEmail = `
            <a href="${resetUrl}" class="button" style="background: #208c12; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
                Resetar Senha
            </a>
        `;

        await enviarEmail(
            email,
            nome,
            'Recuperação de Senha',
            htmlEmail
        );

        res.json({ message: 'Email de recuperação enviado' });
    } catch (erro) {
        console.error('Erro no forgot password:', erro);
        res.status(500).json({ message: 'Erro ao processar solicitação' });
    }
}

export async function resetPassword(req, res) {
try {
    const { token, novaSenha } = req.body;
    console.log('Dados recebidos:', {token, novaSenha});

    if (!novaSenha) {
        return res.status(400).json({ message: 'Nova senha é obrigatória' });
    }

    // Verifica token e validade
    const [funcionarios] = await conexao.execute(
        'SELECT id_funcionario FROM funcionarios WHERE reset_token = ? AND reset_expires > NOW()',
        [token]
    );
    console.log('Funcionário encontrado:', funcionarios);

    if (funcionarios.length === 0) {
        return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    // Hash nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualiza senha e limpa tokens
    await conexao.execute(
        'UPDATE funcionarios SET senha = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ?',
        [senhaHash, token]
    );

    res.json({ message: 'Senha atualizada com sucesso' });
} catch (erro) {
    console.error('Erro no reset password:', erro);
    res.status(500).json({ message: 'Erro ao resetar senha' });
}

//tirar dps
class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api'; 
    }

    // Método de teste
    async testConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/reset-password`, {
                method: 'GET'
            });
            console.log('Status da conexão:', response.status);
            return response.status === 200;
        } catch (error) {
            console.log('Erro na conexão:', error);
            return false;
        }
    }
}

// Teste imediato da conexão
const api = new ApiService();
api.testConnection().then(isConnected => {
    console.log('API está conectada:', isConnected);
});

}

export async function verificarToken(req, res) {
    try {
        const { token } = req.body;
        
        const [funcionarios] = await conexao.execute(
            'SELECT id_funcionario FROM funcionarios WHERE reset_token = ? AND reset_expires > NOW()',
            [token]
        );

        const tokenValido = funcionarios.length > 0;
        
        res.json({ valid: tokenValido });
    } catch (erro) {
        console.error('Erro ao verificar token:', erro);
        res.status(500).json({ valid: false });
    }
}
