// ============================================
// FUNÇÃO: Gerenciador de Financiamentos com Amortização
// Versão: 1.0
// Responsabilidade: Calcular e rastrear parcelas de empréstimos/financiamentos
// ============================================

class GerenciadorFinanciamento {
    constructor() {
        this.financiamentos = [];
        this.CHAVE_FINANCIAMENTOS = 'financiamentos_app';
    }

    /**
     * Calcula as parcelas usando Tabela Price (parcelas iguais)
     * @param {number} principal - Valor do empréstimo
     * @param {number} taxaMensal - Taxa de juros ao mês (ex: 1 para 1%)
     * @param {number} meses - Número de parcelas
     * @returns {Array} Array com todas as parcelas calculadas
     */
    calcularTabelaPrice(principal, taxaMensal, meses) {
        const taxa = taxaMensal / 100;
        const parcela = principal * 
            (taxa * Math.pow(1 + taxa, meses)) / 
            (Math.pow(1 + taxa, meses) - 1);
        
        const parcelas = [];
        let saldoDevedor = principal;
        
        for (let i = 1; i <= meses; i++) {
            const juros = saldoDevedor * taxa;
            const amortizacao = parcela - juros;
            saldoDevedor -= amortizacao;
            
            parcelas.push({
                numeroParcela: i,
                valor: parseFloat(parcela.toFixed(2)),
                juros: parseFloat(juros.toFixed(2)),
                amortizacao: parseFloat(amortizacao.toFixed(2)),
                saldoDevedor: parseFloat(Math.max(0, saldoDevedor).toFixed(2)),
                pago: false,
                dataPagamento: null,
                dataVencimento: this.calcularDataVencimento(i)
            });
        }
        
        return parcelas;
    }

    /**
     * Calcula as parcelas usando SAC (amortização constante)
     * @param {number} principal - Valor do empréstimo
     * @param {number} taxaMensal - Taxa de juros ao mês (ex: 1 para 1%)
     * @param {number} meses - Número de parcelas
     * @returns {Array} Array com todas as parcelas calculadas
     */
    calcularSAC(principal, taxaMensal, meses) {
        const taxa = taxaMensal / 100;
        const amortizacaoConstante = principal / meses;
        
        const parcelas = [];
        let saldoDevedor = principal;
        
        for (let i = 1; i <= meses; i++) {
            const juros = saldoDevedor * taxa;
            const parcela = amortizacaoConstante + juros;
            saldoDevedor -= amortizacaoConstante;
            
            parcelas.push({
                numeroParcela: i,
                valor: parseFloat(parcela.toFixed(2)),
                juros: parseFloat(juros.toFixed(2)),
                amortizacao: parseFloat(amortizacaoConstante.toFixed(2)),
                saldoDevedor: parseFloat(Math.max(0, saldoDevedor).toFixed(2)),
                pago: false,
                dataPagamento: null,
                dataVencimento: this.calcularDataVencimento(i)
            });
        }
        
        return parcelas;
    }

    /**
     * Cria um novo financiamento
     * @param {Object} config - Configuração do financiamento
     *   - nome: string (ex: "Carro", "Casa")
     *   - principal: number (valor do empréstimo)
     *   - taxaMensal: number (taxa em % ao mês)
     *   - meses: number (quantidade de parcelas)
     *   - tipo: string ("price" ou "sac")
     *   - dataInicio: string (YYYY-MM-DD)
     * @returns {Object} Financiamento criado
     */
    criarFinanciamento(config) {
        const {
            nome = 'Financiamento',
            principal = 0,
            taxaMensal = 0,
            meses = 12,
            tipo = 'price',
            dataInicio = new Date().toISOString().split('T')[0]
        } = config;

        if (principal <= 0) throw new Error('Principal deve ser maior que 0');
        if (meses <= 0) throw new Error('Meses deve ser maior que 0');

        const parcelas = tipo === 'sac' 
            ? this.calcularSAC(principal, taxaMensal, meses)
            : this.calcularTabelaPrice(principal, taxaMensal, meses);

        const financiamento = {
            id: Date.now(),
            nome,
            principal,
            taxaMensal,
            meses,
            tipo,
            dataInicio,
            dataCriacao: new Date().toISOString(),
            parcelas,
            status: 'ativo', // ativo, liquidado, cancelado
            totalPago: 0,
            proximoVencimento: parcelas[0]?.dataVencimento
        };

        this.financiamentos.push(financiamento);
        this.salvarFinanciamentos();

        return financiamento;
    }

    /**
     * Registra pagamento de uma parcela
     * @param {number} financiamentoId - ID do financiamento
     * @param {number} numeroParcela - Número da parcela (1, 2, 3...)
     * @param {number} valuePago - Valor pago (opcional, se diferente)
     * @returns {Object} Parcela atualizada
     */
    registrarPagamentoParcela(financiamentoId, numeroParcela, valuePago = null) {
        const financiamento = this.financiamentos.find(f => f.id === financiamentoId);
        if (!financiamento) throw new Error('Financiamento não encontrado');

        const parcela = financiamento.parcelas.find(p => p.numeroParcela === numeroParcela);
        if (!parcela) throw new Error('Parcela não encontrada');

        if (parcela.pago) throw new Error('Parcela já foi paga');

        parcela.pago = true;
        parcela.dataPagamento = new Date().toISOString().split('T')[0];
        parcela.valuePago = valuePago || parcela.valor;

        financiamento.totalPago += parcela.valor;

        // Atualizar próximo vencimento
        const proximaNaoPaga = financiamento.parcelas.find(p => !p.pago);
        financiamento.proximoVencimento = proximaNaoPaga?.dataVencimento || null;

        // Verificar se financiamento foi liquidado
        if (financiamento.parcelas.every(p => p.pago)) {
            financiamento.status = 'liquidado';
        }

        this.salvarFinanciamentos();
        return parcela;
    }

    /**
     * Calcula data de vencimento da parcela
     * @param {number} numeroParcela - Número da parcela
     * @returns {string} Data em formato YYYY-MM-DD
     */
    calcularDataVencimento(numeroParcela) {
        const hoje = new Date();
        hoje.setMonth(hoje.getMonth() + numeroParcela);
        return hoje.toISOString().split('T')[0];
    }

    /**
     * Obtém resumo do financiamento
     * @param {number} financiamentoId - ID do financiamento
     * @returns {Object} Resumo com totalizações
     */
    obterResumoFinanciamento(financiamentoId) {
        const fin = this.financiamentos.find(f => f.id === financiamentoId);
        if (!fin) throw new Error('Financiamento não encontrado');

        const parcelaspagas = fin.parcelas.filter(p => p.pago).length;
        const parcelasaVencer = fin.parcelas.filter(p => !p.pago).length;
        const jurosTotal = fin.parcelas.reduce((acc, p) => acc + p.juros, 0);
        const jurosPago = fin.parcelas.filter(p => p.pago).reduce((acc, p) => acc + p.juros, 0);
        const jurosAVencer = fin.parcelas.filter(p => !p.pago).reduce((acc, p) => acc + p.juros, 0);

        return {
            nome: fin.nome,
            principal: fin.principal,
            totalAPagar: fin.principal + jurosTotal,
            totalPago: fin.totalPago,
            totalAPagar: fin.parcelas.filter(p => !p.pago).reduce((acc, p) => acc + p.valor, 0),
            parcelaspagas,
            parcelasaVencer,
            percentualPago: ((parcelaspagas / fin.meses) * 100).toFixed(2),
            jurosTotal,
            jurosPago,
            jurosAVencer,
            proximoVencimento: fin.proximoVencimento,
            status: fin.status,
            tipo: fin.tipo,
            ultimaAtualizacao: new Date().toISOString()
        };
    }

    /**
     * Lista todos os financiamentos
     * @returns {Array} Array de financiamentos
     */
    listarFinanciamentos() {
        return this.financiamentos;
    }

    /**
     * Obtém finanças ativo
     * @returns {Array} Apenas financiamentos com status 'ativo'
     */
    obterFinanciamentosAtivos() {
        return this.financiamentos.filter(f => f.status === 'ativo');
    }

    /**
     * Obtém extrato de uma parcela
     * @param {number} financiamentoId - ID do financiamento
     * @param {number} numeroParcela - Número da parcela
     * @returns {Object} Detalhes da parcela
     */
    obterExtratoParecla(financiamentoId, numeroParcela) {
        const fin = this.financiamentos.find(f => f.id === financiamentoId);
        if (!fin) throw new Error('Financiamento não encontrado');

        const parcela = fin.parcelas.find(p => p.numeroParcela === numeroParcela);
        if (!parcela) throw new Error('Parcela não encontrada');

        return {
            financiamento: fin.nome,
            parcela: numeroParcela,
            ...parcela,
            status: parcela.pago ? 'Pago' : 'A Pagar'
        };
    }

    /**
     * Simula financiamento (sem salvar)
     * @param {Object} config - Configuração
     * @returns {Object} Simulação
     */
    simularFinanciamento(config) {
        const { principal, taxaMensal, meses, tipo = 'price' } = config;

        const parcelas = tipo === 'sac'
            ? this.calcularSAC(principal, taxaMensal, meses)
            : this.calcularTabelaPrice(principal, taxaMensal, meses);

        const primeiraParcel = parcelas[0];
        const ultimaParcela = parcelas[parcelas.length - 1];
        const valorTotal = parcelas.reduce((acc, p) => acc + p.valor, 0);
        const jurosTotal = parcelas.reduce((acc, p) => acc + p.juros, 0);

        return {
            tipo,
            principal,
            taxaMensal,
            meses,
            primeiraParcel: primeiraParcel.valor,
            ultimaParcela: ultimaParcela.valor,
            valorTotal: parseFloat(valorTotal.toFixed(2)),
            jurosTotal: parseFloat(jurosTotal.toFixed(2)),
            parcelasAmostra: parcelas.slice(0, 3) // Primeiras 3 como exemplo
        };
    }

    /**
     * Exportar amortização para CSV
     * @param {number} financiamentoId - ID do financiamento
     * @returns {string} CSV formatado
     */
    exportarAmortizacaoCSV(financiamentoId) {
        const fin = this.financiamentos.find(f => f.id === financiamentoId);
        if (!fin) throw new Error('Financiamento não encontrado');

        let csv = `Financiamento: ${fin.nome}\n`;
        csv += `Principal: R$ ${fin.principal.toFixed(2)}\n`;
        csv += `Taxa Mensal: ${fin.taxaMensal}%\n`;
        csv += `Tipo: ${fin.tipo === 'sac' ? 'SAC' : 'Price'}\n\n`;

        csv += 'Parcela,Vencimento,Valor,Juros,Amortização,Saldo Devedor,Status,Data Pagamento\n';

        fin.parcelas.forEach(p => {
            const status = p.pago ? 'Pago' : 'A Pagar';
            const dataPag = p.dataPagamento || '-';
            csv += `${p.numeroParcela},${p.dataVencimento},${p.valor.toFixed(2)},${p.juros.toFixed(2)},${p.amortizacao.toFixed(2)},${p.saldoDevedor.toFixed(2)},${status},${dataPag}\n`;
        });

        return csv;
    }

    /**
     * Salva financiamentos no localStorage
     */
    salvarFinanciamentos() {
        if (window.seguranca && window.seguranca.sessaoAtiva) {
            window.seguranca.salvarSeguro(this.CHAVE_FINANCIAMENTOS, this.financiamentos);
        } else {
            localStorage.setItem(this.CHAVE_FINANCIAMENTOS, JSON.stringify(this.financiamentos));
        }
    }

    /**
     * Carrega financiamentos do localStorage
     */
    carregarFinanciamentos() {
        try {
            let dados;
            if (window.seguranca && window.seguranca.sessaoAtiva) {
                dados = window.seguranca.carregarSeguro(this.CHAVE_FINANCIAMENTOS);
            } else {
                dados = JSON.parse(localStorage.getItem(this.CHAVE_FINANCIAMENTOS) || '[]');
            }
            this.financiamentos = dados || [];
        } catch (erro) {
            console.error('Erro ao carregar financiamentos:', erro);
            this.financiamentos = [];
        }
    }

    /**
     * Deletar financiamento
     * @param {number} financiamentoId - ID do financiamento
     */
    deletarFinanciamento(financiamentoId) {
        const index = this.financiamentos.findIndex(f => f.id === financiamentoId);
        if (index === -1) throw new Error('Financiamento não encontrado');

        this.financiamentos.splice(index, 1);
        this.salvarFinanciamentos();
    }

    /**
     * Gerar relatório visual de todas as parcelas
     * @param {number} financiamentoId - ID do financiamento
     * @returns {string} HTML formatado
     */
    gerarRelatorioHTML(financiamentoId) {
        const fin = this.financiamentos.find(f => f.id === financiamentoId);
        if (!fin) throw new Error('Financiamento não encontrado');

        const resumo = this.obterResumoFinanciamento(financiamentoId);

        let html = `
        <div style="font-family: Arial; margin: 20px;">
            <h2>📋 Relatório de Financiamento</h2>
            <h3>${fin.nome}</h3>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <div><strong>Principal:</strong> R$ ${fin.principal.toFixed(2)}</div>
                <div><strong>Taxa Mensal:</strong> ${fin.taxaMensal}%</div>
                <div><strong>Total de Parcelas:</strong> ${fin.meses}</div>
                <div><strong>Tipo:</strong> ${fin.tipo === 'sac' ? 'SAC' : 'Price (Parcelas Iguais)'}</div>
                <div><strong>Status:</strong> ${fin.status}</div>
                <div><strong>Juros Total:</strong> R$ ${resumo.jurosTotal.toFixed(2)}</div>
            </div>

            <h3>📊 Andamento</h3>
            <div style="background: #f0f0f0; height: 20px; border-radius: 5px; overflow: hidden;">
                <div style="background: #4CAF50; height: 100%; width: ${resumo.percentualPago}%;"></div>
            </div>
            <p>${resumo.percentualPago}% Pago (${resumo.parcelaspagas}/${fin.meses} parcelas)</p>

            <h3>📅 Próximas Parcelas</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr style="background: #f0f0f0;">
                    <th style="border: 1px solid #ddd; padding: 8px;">Parcela</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Vencimento</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Valor</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Juros</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
                </tr>
        `;

        fin.parcelas.slice(0, 5).forEach(p => {
            const statusClass = p.pago ? 'color: green;' : 'color: red;';
            const statusText = p.pago ? '✅ Pago' : '⏳ A Pagar';
            html += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${p.numeroParcela}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${p.dataVencimento}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">R$ ${p.valor.toFixed(2)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">R$ ${p.juros.toFixed(2)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; ${statusClass}">${statusText}</td>
                </tr>
            `;
        });

        html += `</table></div>`;
        return html;
    }
}

// Instância global
let gerenciadorFinanciamento = new GerenciadorFinanciamento();
