// ============================================
// CLASSE: GerenciadorSeguranca
// Versão: 1.0
// Responsabilidade: Gerenciar criptografia, validação, sanitização e auditoria
// ============================================

class GerenciadorSeguranca {
    constructor(senhaMestre = null) {
        this.CHAVE_CRIPTOGRAFIA = senhaMestre || 'chave-padrao-segura-2025';
        this.tentativasLogin = 0;
        this.bloqueado = false;
        this.sessaoAtiva = false;
        this.ultimaAtividade = Date.now();
        this.TIMEOUT_SESSAO = 30 * 60 * 1000; // 30 minutos
        this.monitorAtivo = false;
    }

    // ========== CRIPTOGRAFIA ==========
    
    /**
     * Criptografa dados sensíveis com AES-256
     * @param {*} dados - Dados a criptografar
     * @returns {string} Dados criptografados em Base64
     */
    criptografar(dados) {
        try {
            if (!dados) return null;
            
            const json = JSON.stringify(dados);
            const criptografado = CryptoJS.AES.encrypt(json, this.CHAVE_CRIPTOGRAFIA).toString();
            return criptografado;
        } catch (erro) {
            console.error('❌ Erro ao criptografar:', erro.message);
            return null;
        }
    }

    /**
     * Descriptografa dados com AES-256
     * @param {string} dadosCriptografados - Dados criptografados
     * @returns {*} Dados originais descriptografados
     */
    descriptografar(dadosCriptografados) {
        try {
            if (!dadosCriptografados) return null;
            
            const descrito = CryptoJS.AES.decrypt(dadosCriptografados, this.CHAVE_CRIPTOGRAFIA);
            const json = descrito.toString(CryptoJS.enc.Utf8);
            
            if (!json) return null;
            
            return JSON.parse(json);
        } catch (erro) {
            console.error('❌ Erro ao descriptografar:', erro.message);
            return null;
        }
    }

    /**
     * Cria hash SHA-256 (para senhas - não reversível)
     * @param {string} texto - Texto a fazer hash
     * @returns {string} Hash SHA-256
     */
    hash256(texto) {
        try {
            return CryptoJS.SHA256(texto).toString();
        } catch (erro) {
            console.error('❌ Erro ao gerar hash:', erro.message);
            return null;
        }
    }

    // ========== VALIDAÇÃO ==========

    /**
     * Valida uma transação completa
     * @returns {Array} Array de erros (vazio se válido)
     */
    validarTransacao(valor, descricao, data, categoria) {
        const erros = [];

        // Validar valor
        if (!valor && valor !== 0) {
            erros.push('❌ Valor é obrigatório');
        } else if (isNaN(parseFloat(valor))) {
            erros.push('❌ Valor deve ser um número');
        } else if (parseFloat(valor) <= 0) {
            erros.push('❌ Valor deve ser maior que zero');
        } else if (parseFloat(valor) > 999999999) {
            erros.push('❌ Valor muito alto (máximo: R$ 999.999.999)');
        }

        // Validar descrição
        if (!descricao) {
            erros.push('❌ Descrição é obrigatória');
        } else if (descricao.trim().length < 3) {
            erros.push('❌ Descrição deve ter pelo menos 3 caracteres');
        } else if (descricao.length > 200) {
            erros.push('❌ Descrição não pode exceder 200 caracteres');
        }

        // Validar data
        if (!data) {
            erros.push('❌ Data é obrigatória');
        } else if (isNaN(new Date(data).getTime())) {
            erros.push('❌ Data inválida');
        } else {
            const dataTransacao = new Date(data);
            const dataHoje = new Date();
            dataHoje.setHours(0, 0, 0, 0);
            
            if (dataTransacao > dataHoje) {
                erros.push('❌ Não é permitido adicionar data futura');
            }
        }

        // Validar categoria
        if (!categoria || categoria.trim() === '') {
            erros.push('❌ Categoria é obrigatória');
        } else if (categoria.length > 50) {
            erros.push('❌ Categoria não pode exceder 50 caracteres');
        }

        return erros;
    }

    /**
     * Valida um valor monetário
     * @param {*} valor - Valor a validar
     * @returns {boolean} True se válido
     */
    validarValor(valor) {
        return !isNaN(parseFloat(valor)) && parseFloat(valor) > 0 && parseFloat(valor) <= 999999999;
    }

    /**
     * Valida uma data
     * @param {string} data - Data em formato ISO (YYYY-MM-DD)
     * @returns {boolean} True se válida
     */
    validarData(data) {
        if (!data || isNaN(new Date(data).getTime())) return false;
        
        const dataTransacao = new Date(data);
        const dataHoje = new Date();
        dataHoje.setHours(0, 0, 0, 0);
        
        return dataTransacao <= dataHoje;
    }

    /**
     * Valida texto de descrição
     * @param {string} texto - Texto a validar
     * @returns {boolean} True se válido
     */
    validarDescricao(texto) {
        return texto && texto.trim().length >= 3 && texto.length <= 200;
    }

    // ========== SANITIZAÇÃO XSS ==========

    /**
     * Sanitiza texto para evitar XSS - escapa HTML
     * @param {string} texto - Texto a sanitizar
     * @returns {string} Texto sanitizado (seguro para HTML)
     */
    sanitizar(texto) {
        if (!texto) return '';
        
        const div = document.createElement('div');
        div.textContent = texto; // textContent escapa HTML automaticamente
        return div.innerHTML;
    }

    /**
     * Remove caracteres perigosos
     * @param {string} texto - Texto a limpar
     * @returns {string} Texto limpo
     */
    limparTexto(texto) {
        if (!texto) return '';
        
        // Remove tags HTML
        let limpo = texto.replace(/<[^>]*>/g, '');
        
        // Remove caracteres de controle
        limpo = limpo.replace(/[\x00-\x1F\x7F]/g, '');
        
        // Remove espaços extras
        limpo = limpo.trim();
        
        return limpo;
    }

    /**
     * Valida um email
     * @param {string} email - Email a validar
     * @returns {boolean} True se válido
     */
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // ========== ARMAZENAMENTO SEGURO ==========

    /**
     * Salva dados de forma criptografada
     * @param {string} chave - Chave localStorage
     * @param {*} dados - Dados a salvar
     * @returns {boolean} Sucesso
     */
    salvarSeguro(chave, dados) {
        try {
            const criptografado = this.criptografar(dados);
            if (criptografado) {
                localStorage.setItem(chave, criptografado);
                this.registrarAuditoria('DADOS_SALVOS', { chave });
                return true;
            }
            return false;
        } catch (erro) {
            console.error('❌ Erro ao salvar dados:', erro.message);
            this.registrarAuditoria('ERRO_SALVAR', { chave, erro: erro.message });
            return false;
        }
    }

    /**
     * Carrega dados criptografados
     * @param {string} chave - Chave localStorage
     * @returns {*} Dados descriptografados ou null
     */
    carregarSeguro(chave) {
        try {
            const criptografado = localStorage.getItem(chave);
            if (!criptografado) return null;
            
            const dados = this.descriptografar(criptografado);
            this.registrarAuditoria('DADOS_CARREGADOS', { chave });
            return dados;
        } catch (erro) {
            console.error('❌ Erro ao carregar dados:', erro.message);
            this.registrarAuditoria('ERRO_CARREGAR', { chave, erro: erro.message });
            return null;
        }
    }

    /**
     * Remove dados sensíveis de forma segura
     * @param {string} chave - Chave localStorage
     */
    limparSeguro(chave) {
        try {
            localStorage.removeItem(chave);
            this.registrarAuditoria('DADOS_REMOVIDOS', { chave });
        } catch (erro) {
            console.error('❌ Erro ao remover dados:', erro.message);
        }
    }

    /**
     * Limpa TODOS os dados do localStorage (CUIDADO!)
     */
    limparTodosDados() {
        try {
            const confirmar = confirm('⚠️ ATENÇÃO: Isso vai deletar TODOS os dados!\n\nDeseja continuar?');
            if (!confirmar) return false;
            
            localStorage.clear();
            this.registrarAuditoria('TODOS_DADOS_REMOVIDOS');
            return true;
        } catch (erro) {
            console.error('❌ Erro ao limpar dados:', erro.message);
            return false;
        }
    }

    // ========== AUDITORIA ==========

    /**
     * Registra todas as operações sensíveis
     * @param {string} acao - Tipo de ação
     * @param {object} detalhes - Detalhes da ação
     */
    registrarAuditoria(acao, detalhes = {}) {
        try {
            const log = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                acao: acao,
                detalhes: detalhes,
                sessao: this.sessaoAtiva ? 'ativa' : 'inativa'
            };

            // Obter logs existentes
            let logs = [];
            const logsJson = localStorage.getItem('_audit_logs');
            if (logsJson) {
                try {
                    logs = JSON.parse(logsJson);
                } catch (e) {
                    logs = [];
                }
            }

            // Adicionar novo log
            logs.push(log);

            // Manter apenas últimos 500 logs
            if (logs.length > 500) {
                logs = logs.slice(-500);
            }

            // Salvar
            localStorage.setItem('_audit_logs', JSON.stringify(logs));
        } catch (e) {
            console.error('⚠️ Erro ao salvar auditoria:', e.message);
        }
    }

    /**
     * Obtém histórico de auditoria
     * @param {object} filtro - Filtros opcionais { acao, ultimasHoras }
     * @returns {Array} Logs filtrados
     */
    obterAuditoria(filtro = {}) {
        try {
            const logsJson = localStorage.getItem('_audit_logs');
            let logs = logsJson ? JSON.parse(logsJson) : [];

            // Aplicar filtros
            if (filtro.acao) {
                logs = logs.filter(log => log.acao === filtro.acao);
            }
            if (filtro.ultimasHoras) {
                const tempo = Date.now() - (filtro.ultimasHoras * 60 * 60 * 1000);
                logs = logs.filter(log => new Date(log.timestamp).getTime() > tempo);
            }

            return logs.reverse(); // Mais recentes primeiro
        } catch (e) {
            return [];
        }
    }

    /**
     * Exibe relatório de auditoria
     */
    exibirAuditoria() {
        const logs = this.obterAuditoria({ ultimasHoras: 24 });
        console.table(logs);
        return logs;
    }

    // ========== AUTENTICAÇÃO / SESSÃO ==========

    /**
     * Estabelece sessão com senha
     * @param {string} senha - Senha do usuário
     * @returns {boolean} Sucesso
     */
    abrirSessao(senha) {
        if (this.bloqueado) {
            alert('❌ Sessão bloqueada por segurança.\n\nTente novamente em 15 minutos.');
            this.registrarAuditoria('TENTATIVA_BLOQUEADA');
            return false;
        }

        if (!senha || senha.trim().length < 4) {
            alert('❌ Senha deve ter pelo menos 4 caracteres');
            return false;
        }

        const hashInformado = this.hash256(senha);
        const hashArmazenado = localStorage.getItem('_hash_senha');

        if (!hashArmazenado) {
            // Primeira vez - definir senha padrão (Jean@2025)
            const SENHA_PADRAO = 'Jean@2025';
            const hashPadrao = this.hash256(SENHA_PADRAO);
            localStorage.setItem('_hash_senha', hashPadrao);
            
            // Verificar se digitou a senha padrão
            if (hashInformado === hashPadrao) {
                this.sessaoAtiva = true;
                this.tentativasLogin = 0;
                this.ultimaAtividade = Date.now();
                this.registrarAuditoria('SESSAO_CRIADA_COM_PADRAO');
                this.iniciarMonitorSessao();
                console.log('✅ Sessão aberta com senha padrão!');
                return true;
            } else {
                this.tentativasLogin++;
                alert(`❌ Senha incorreta!\n\nTentativas restantes: ${3 - this.tentativasLogin}`);
                return false;
            }
        }

        if (hashInformado === hashArmazenado) {
            this.sessaoAtiva = true;
            this.tentativasLogin = 0;
            this.ultimaAtividade = Date.now();
            this.registrarAuditoria('SESSAO_ABERTA');
            
            if (!this.monitorAtivo) {
                this.iniciarMonitorSessao();
            }
            
            console.log('✅ Sessão aberta com sucesso!');
            return true;
        } else {
            this.tentativasLogin++;
            this.registrarAuditoria('SESSAO_FALHA', { tentativas: this.tentativasLogin });
            
            const tentativasRestantes = 3 - this.tentativasLogin;
            
            if (this.tentativasLogin >= 3) {
                this.bloqueado = true;
                this.registrarAuditoria('SESSAO_BLOQUEADA');
                alert('❌ Bloqueado após 3 tentativas incorretas.\n\nTente novamente em 15 minutos.');
                
                // Desbloquear após 15 minutos
                setTimeout(() => {
                    this.bloqueado = false;
                    this.tentativasLogin = 0;
                    this.registrarAuditoria('SESSAO_DESBLOQUEADA');
                }, 15 * 60 * 1000);
            } else {
                alert(`❌ Senha incorreta!\n\nTentativas restantes: ${tentativasRestantes}`);
            }
            
            return false;
        }
    }

    /**
     * Encerra sessão de forma segura
     */
    fecharSessao() {
        if (!this.sessaoAtiva) return;
        
        this.sessaoAtiva = false;
        this.ultimaAtividade = null;
        this.registrarAuditoria('SESSAO_FECHADA');
        console.log('✅ Sessão encerrada');
    }

    /**
     * Monitora inatividade da sessão
     */
    iniciarMonitorSessao() {
        if (this.monitorAtivo) return;
        
        this.monitorAtivo = true;
        
        const intervalo = setInterval(() => {
            if (!this.sessaoAtiva) {
                clearInterval(intervalo);
                this.monitorAtivo = false;
                return;
            }

            const tempoInativo = Date.now() - this.ultimaAtividade;
            
            if (tempoInativo > this.TIMEOUT_SESSAO) {
                console.warn('⏰ Sessão expirada por inatividade (30 minutos)');
                this.fecharSessao();
                alert('⏰ Sua sessão expirou por inatividade.\n\nFaça login novamente para continuar.');
                clearInterval(intervalo);
                this.monitorAtivo = false;
            }
        }, 60000); // Verificar a cada 1 minuto
    }

    /**
     * Atualiza timestamp de última atividade
     */
    atualizarAtividade() {
        if (this.sessaoAtiva) {
            this.ultimaAtividade = Date.now();
        }
    }

    /**
     * Obtém status da sessão
     * @returns {object} Status detalhado
     */
    obterStatusSessao() {
        return {
            ativa: this.sessaoAtiva,
            bloqueada: this.bloqueado,
            tentativas: this.tentativasLogin,
            tempoInativo: this.sessaoAtiva ? Math.floor((Date.now() - this.ultimaAtividade) / 1000) : null,
            tempoRestante: this.sessaoAtiva ? Math.floor((this.TIMEOUT_SESSAO - (Date.now() - this.ultimaAtividade)) / 1000) : null
        };
    }

    /**
     * Exibe status da sessão no console
     */
    exibirStatus() {
        const status = this.obterStatusSessao();
        console.log('📊 Status da Sessão:', status);
        return status;
    }

    // ========== UTILITÁRIOS ==========

    /**
     * Gera relatório de segurança
     */
    gerarRelatorio() {
        const auditoria = this.obterAuditoria({ ultimasHoras: 24 });
        const status = this.obterStatusSessao();
        
        return {
            dataRelatorio: new Date().toISOString(),
            statusSessao: status,
            ultimasAcoes: auditoria.slice(0, 20),
            totalAuditorias: auditoria.length
        };
    }

    /**
     * Exporta auditoria como JSON
     */
    exportarAuditoria() {
        const logs = this.obterAuditoria();
        const json = JSON.stringify(logs, null, 2);
        
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auditoria_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        this.registrarAuditoria('AUDITORIA_EXPORTADA');
    }
}

// ============================================
// INICIALIZAR INSTÂNCIA GLOBAL
// ============================================

let seguranca = null;

/**
 * Inicializa o gerenciador de segurança
 * Deve ser chamado ANTES de carregar os dados
 */
function inicializarSeguranca() {
    seguranca = new GerenciadorSeguranca();
    console.log('🔐 Gerenciador de Segurança inicializado');
}

/**
 * Abre a sessão com proteção por senha
 * @returns {boolean} Sucesso
 */
function abrirSessaoSegura() {
    if (!seguranca) inicializarSeguranca();
    
    const senha = prompt('🔐 Digite sua senha para acessar os dados:\n\n(Mínimo 4 caracteres)');
    
    if (senha === null) {
        console.log('❌ Acesso cancelado');
        return false;
    }
    
    return seguranca.abrirSessao(senha);
}

/**
 * Fecha a sessão
 */
function fecharSessaoSegura() {
    if (seguranca && seguranca.sessaoAtiva) {
        seguranca.fecharSessao();
    }
}

// ============================================
// MONITORAR ATIVIDADE DO USUÁRIO
// ============================================

document.addEventListener('mousemove', () => {
    if (seguranca) seguranca.atualizarAtividade();
});

document.addEventListener('keypress', () => {
    if (seguranca) seguranca.atualizarAtividade();
});

document.addEventListener('click', () => {
    if (seguranca) seguranca.atualizarAtividade();
});
