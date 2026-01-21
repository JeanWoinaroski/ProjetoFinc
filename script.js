let transacoes = [];
let receitas = [];
let despesasFixas = [];
let investimentos = [];
let metas = {};
let categoriasCustom = [];
let saldoInicial = 0;
let rendaMensal = 10000;
let objetivos = []; // 🟢 Nova variável para objetivos

const CHAVE_LOCAL_STORAGE = 'transacoes_financeiras';
const CHAVE_RECEITAS = 'receitas_financeiras';
const CHAVE_FIXAS = 'despesas_fixas';
const CHAVE_METAS = 'metas_financeiras';
const CHAVE_CATEGORIAS = 'categorias_custom';
const CHAVE_CONFIG = 'configuracoes_financeiras';
const CHAVE_INVESTIMENTOS = 'investimentos_financeiros';
const CHAVE_OBJETIVOS = 'OBJETIVOS';

// Categorias padrão
const categoriasBase = [
    { nome: 'Alimentação', emoji: '🍔' },
    { nome: 'Transporte', emoji: '🚗' },
    { nome: 'Saúde', emoji: '⚕️' },
    { nome: 'Educação', emoji: '📚' },
    { nome: 'Lazer', emoji: '🎮' },
    { nome: 'Utilities', emoji: '💡' },
    { nome: 'Salário', emoji: '💳' },
    { nome: 'Freelance', emoji: '🎯' },
    { nome: 'Outros', emoji: '📌' }
];

// Carrega dados ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    // 🔐 PASSO 1: Inicializar segurança
    inicializarSeguranca();
    
    // 🔐 PASSO 2: Abrir sessão com proteção por senha
    const sessaoAberta = abrirSessaoSegura();
    
    if (!sessaoAberta) {
        alert('❌ Acesso negado. A aplicação será recarregada.');
        location.reload();
        return;
    }
    
    // 🔐 PASSO 3: Carregar dados criptografados
    carregarDados();
    carregarConfiguracoes();
    preencherDataAtual();
    atualizarSelectCategorias();
    atualizarTabelaReceitas();
    carregarMesesHeatmap();
    atualizarTela();
    definirDataAtual();
    
    // 🔐 PASSO 4: Adicionar botão de logout na interface
    adicionarBotaoLogout();
});

function obterDataHoje() {
    return new Date().toISOString().split('T')[0];
}

function preencherDataAtual() {
    const campo = document.getElementById('data');
    if (campo) campo.value = obterDataHoje();
}

function definirDataAtual() {
    const campo = document.getElementById('dataReceita');
    if (campo) campo.value = obterDataHoje();
}

function salvarDados() {
    const dados = {
        [CHAVE_LOCAL_STORAGE]: transacoes,
        [CHAVE_FIXAS]: despesasFixas,
        [CHAVE_METAS]: metas,
        [CHAVE_CATEGORIAS]: categoriasCustom,
        [CHAVE_RECEITAS]: receitas,
        [CHAVE_INVESTIMENTOS]: investimentos,
        [CHAVE_CONFIG]: { saldoInicial, rendaMensal }
    };
    
    // 🔐 SEGURO: Salvar cada chave criptografada
    Object.entries(dados).forEach(([chave, valor]) => {
        if (seguranca && seguranca.sessaoAtiva) {
            seguranca.salvarSeguro(chave, valor);
        } else {
            // Fallback se segurança não estiver ativa (não recomendado)
            localStorage.setItem(chave, JSON.stringify(valor));
        }
    });
}

function carregarDados() {
    // 🔐 SEGURO: Carregar descriptografado
    if (seguranca && seguranca.sessaoAtiva) {
        transacoes = seguranca.carregarSeguro(CHAVE_LOCAL_STORAGE) || [];
        despesasFixas = seguranca.carregarSeguro(CHAVE_FIXAS) || [];
        metas = seguranca.carregarSeguro(CHAVE_METAS) || {};
        categoriasCustom = seguranca.carregarSeguro(CHAVE_CATEGORIAS) || [];
        receitas = seguranca.carregarSeguro(CHAVE_RECEITAS) || [];
        investimentos = seguranca.carregarSeguro(CHAVE_INVESTIMENTOS) || [];
        objetivos = seguranca.carregarSeguro(CHAVE_OBJETIVOS) || [];
        
        const config = seguranca.carregarSeguro(CHAVE_CONFIG) || { saldoInicial: 0, rendaMensal: 10000 };
        saldoInicial = config.saldoInicial || 0;
        rendaMensal = config.rendaMensal || 10000;
    } else {
        // Fallback não seguro (apenas para testes)
        const dados = localStorage.getItem(CHAVE_LOCAL_STORAGE);
        transacoes = dados ? JSON.parse(dados) : [];

        const dadosFixas = localStorage.getItem(CHAVE_FIXAS);
        despesasFixas = dadosFixas ? JSON.parse(dadosFixas) : [];

        const dadosMetas = localStorage.getItem(CHAVE_METAS);
        metas = dadosMetas ? JSON.parse(dadosMetas) : {};

        const dadosCateg = localStorage.getItem(CHAVE_CATEGORIAS);
        categoriasCustom = dadosCateg ? JSON.parse(dadosCateg) : [];

        const dadosReceitas = localStorage.getItem(CHAVE_RECEITAS);
        receitas = dadosReceitas ? JSON.parse(dadosReceitas) : [];

        const dadosInvestimentos = localStorage.getItem(CHAVE_INVESTIMENTOS);
        investimentos = dadosInvestimentos ? JSON.parse(dadosInvestimentos) : [];

        const dadosConfig = localStorage.getItem(CHAVE_CONFIG);
        const config = dadosConfig ? JSON.parse(dadosConfig) : { saldoInicial: 0, rendaMensal: 10000 };
        saldoInicial = config.saldoInicial || 0;
        rendaMensal = config.rendaMensal || 10000;
        
        objetivos = JSON.parse(localStorage.getItem(CHAVE_OBJETIVOS) || '[]');
    }
}


function obterTodasCategorias() {
    return [...categoriasBase, ...categoriasCustom];
}

function classificarCategoria(descricao) {
    const desc = descricao.toLowerCase();
    
    // Dicionário de palavras-chave
    const regras = {
        'Alimentação': ['supermercado', 'padaria', 'açougue', 'restaurante', 'delivery', 'pizza', 'mc', 'burger', 'fruta', 'alimento', 'mercado', 'pão', 'café', 'bar', 'lanchonete', 'comida'],
        'Transporte': ['uber', 'taxi', 'ônibus', 'metrô', 'combustível', 'gasolina', 'abastecimento', 'estacionamento', 'transporte', 'passagem', 'viagem', 'carro', 'moto'],
        'Saúde': ['farmácia', 'remédio', 'hospital', 'médico', 'dentista', 'clínica', 'saúde', 'vacina', 'exame', 'medicamento'],
        'Educação': ['escola', 'universidade', 'curso', 'educação', 'livro', 'apostila', 'aula', 'formação'],
        'Lazer': ['cinema', 'jogo', 'game', 'netflix', 'spotify', 'steam', 'playstation', 'xbox', 'diversão', 'entretenimento', 'show', 'música'],
        'Utilities': ['energia', 'água', 'telefone', 'internet', 'conta', 'bill', 'concessionária', 'eletricidade'],
        'Outros': []
    };

    for (const [categoria, palavras] of Object.entries(regras)) {
        if (palavras.some(palavra => desc.includes(palavra))) {
            return categoria;
        }
    }
    
    return 'Outros';
}

function atualizarSelectCategorias() {
    const todasCategorias = obterTodasCategorias();
    const selectFormulario = document.getElementById('categoria');
    const selectFiltro = document.getElementById('filtroCategoria');

    [selectFormulario, selectFiltro].forEach(select => {
        const opcaoAtual = select.value;
        select.innerHTML = '<option value="">Selecione Categoria</option>';
        todasCategorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.nome;
            option.textContent = `${cat.emoji} ${cat.nome}`;
            select.appendChild(option);
        });
        select.value = opcaoAtual;
    });

    atualizarCateoriasUI();
}

function adicionarCategoria() {
    const nome = document.getElementById('novaCategoria').value.trim();
    const emoji = document.getElementById('novaEmojiCategoria').value.trim();

    if (!nome) {
        alert("❌ Digite o nome da categoria!");
        return;
    }
    if (!emoji) {
        alert("❌ Selecione um emoji!");
        return;
    }

    const existe = obterTodasCategorias().some(c => c.nome === nome);
    if (existe) {
        alert("❌ Essa categoria já existe!");
        return;
    }

    categoriasCustom.push({ nome, emoji });
    salvarDados();

    document.getElementById('novaCategoria').value = '';
    document.getElementById('novaEmojiCategoria').value = '';

    atualizarSelectCategorias();
    alert("✅ Categoria adicionada!");
}

function deletarCategoria(nome) {
    if (confirm(`Tem certeza que deseja deletar a categoria "${nome}"?`)) {
        categoriasCustom = categoriasCustom.filter(c => c.nome !== nome);
        salvarDados();
        atualizarSelectCategorias();
        alert("✅ Categoria removida!");
    }
}

function atualizarCateoriasUI() {
    const container = document.getElementById('categoriasContainer');
    if (categoriasCustom.length === 0) {
        container.innerHTML = '<div class="vazio">📭 Nenhuma categoria customizada</div>';
        return;
    }

    let html = '';
    categoriasCustom.forEach(cat => {
        html += `<div class="cat-item">
            <strong>${cat.emoji} ${cat.nome}</strong>
            <button class="danger" onclick="deletarCategoria('${cat.nome}')" style="margin-top: 10px;">🗑️ Deletar</button>
        </div>`;
    });
    container.innerHTML = html;
}

function obterGastoMesAtual(categoria) {
    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

    return transacoes
        .filter(t => t.categoria === categoria && t.data.startsWith(mesAtual))
        .reduce((sum, t) => sum + t.valor, 0);
}

function fazarBackup() {
    const dados = {
        transacoes,
        metas,
        categoriasCustom,
        dataBackup: new Date().toLocaleString('pt-BR')
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `backup_financas_${new Date().toISOString().split('T')[0]}.json`);
    link.click();

    alert("✅ Backup realizado com sucesso!");
}

function restaurarBackup(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = (e) => {
        try {
            const dados = JSON.parse(e.target.result);
            if (confirm(`Restaurar backup de ${dados.dataBackup}? Os dados atuais serão sobrescritos!`)) {
                transacoes = dados.transacoes || [];
                metas = dados.metas || {};
                categoriasCustom = dados.categoriasCustom || [];
                salvarDados();
                atualizarSelectCategorias();
                atualizarTela();
                alert("✅ Backup restaurado com sucesso!");
            }
        } catch (erro) {
            alert("❌ Erro ao restaurar arquivo!");
        }
    };
    leitor.readAsText(arquivo);
    
    document.getElementById('inputBackup').value = '';
}

function sincronizarNuvem() {
    const dados = {
        transacoes,
        metas,
        categoriasCustom,
        dataSincronizacao: new Date().toLocaleString('pt-BR')
    };

    // Simula sincronização com nuvem (você pode integrar com Firebase, Google Drive, etc)
    const texto = JSON.stringify(dados, null, 2);
    alert(`☁️ Dados sincronizados!\n\nTamanho: ${(texto.length / 1024).toFixed(2)} KB\nData: ${dados.dataSincronizacao}\n\nDica: Para sincronização real, integre com Firebase, Google Drive ou OneDrive!`);
}

function adicionarFixa() {
    const descricao = document.getElementById("descricaoFixa").value.trim();
    const categoria = document.getElementById("categoriaFixa").value;
    const valor = parseFloat(document.getElementById("valorFixo").value);

    if (!descricao) {
        alert("❌ Preencha a descrição!");
        return;
    }
    if (!categoria || categoria === "") {
        alert("❌ Selecione uma categoria!");
        return;
    }
    if (!valor || valor <= 0) {
        alert("❌ Digite um valor válido!");
        return;
    }

    despesasFixas.push({
        id: Date.now(),
        descricao,
        categoria,
        valor: parseFloat(valor.toFixed(2)),
        pago: false
    });

    salvarDados();
    document.getElementById("descricaoFixa").value = "";
    document.getElementById("categoriaFixa").value = "";
    document.getElementById("valorFixo").value = "";
    atualizarTela();
    alert("✅ Despesa fixa adicionada!");
}

function adicionarVariavel() {
    const data = document.getElementById("data").value;
    const descricao = document.getElementById("descricao").value.trim();
    const categoria = document.getElementById("categoria").value;
    const valor = parseFloat(document.getElementById("valor").value);

    if (!data) {
        alert("❌ Preencha a data!");
        return;
    }
    if (!descricao) {
        alert("❌ Preencha a descrição!");
        return;
    }
    if (!categoria || categoria === "") {
        alert("❌ Selecione uma categoria!");
        return;
    }
    if (!valor || valor <= 0) {
        alert("❌ Digite um valor válido!");
        return;
    }

    transacoes.push({
        id: Date.now(),
        data,
        descricao,
        categoria,
        valor: parseFloat(valor.toFixed(2)),
        pago: false
    });

    salvarDados();
    document.getElementById("descricao").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("valor").value = "";
    preencherDataAtual();
    atualizarTela();
    alert("✅ Despesa variável adicionada!");
}

function deletarFixa(id) {
    if (confirm("Tem certeza que deseja deletar esta despesa fixa?")) {
        despesasFixas = despesasFixas.filter(d => d.id !== id);
        salvarDados();
        atualizarTela();
    }
}

function deletarVariavel(id) {
    if (confirm("Tem certeza que deseja deletar esta despesa?")) {
        transacoes = transacoes.filter(t => t.id !== id);
        salvarDados();
        atualizarTela();
    }
}

function marcarPagaFixa(id) {
    const despesa = despesasFixas.find(d => d.id === id);
    if (despesa) {
        despesa.pago = !despesa.pago;
        salvarDados();
        atualizarTela();
    }
}

function marcarPagaVariavel(id) {
    const transacao = transacoes.find(t => t.id === id);
    if (transacao) {
        transacao.pago = !transacao.pago;
        salvarDados();
        atualizarTela();
    }
}

function atualizarTela() {
    atualizarResumo();
    atualizarDashboardExecutivo();
    atualizarPendentes();
    atualizarTabelaFixas();
    atualizarTabelaVariaveis();
    atualizarTabelaConsolidada();
    atualizarGraficos();
    atualizarInteligencia();
    atualizarComparativo();
    atualizarTabelaInvestimentos();
    atualizarGraficoInvestimentos();
    atualizarResumoInvestimentos();
    gerarAlertas();
    
    // 🟢 NOVAS 10 FEATURES
    atualizarGraficoEvolucaoSaldo();
    atualizarSaudeFinanceira();
    gerarAlertasInteligentes();
    gerarPrevisaoCaixa();
    gerarComparativoVoce();
    atualizarMetasProgresso();
    gerarRelatorioPersonalizado();
    atualizarEficiencia();
    atualizarHeatmap();
    atualizarObjetivos();
}

// ====== FUNÇÕES DE CONFIGURAÇÃO ======
function carregarConfiguracoes() {
    const config = JSON.parse(localStorage.getItem(CHAVE_CONFIG)) || { saldoInicial: 0, rendaMensal: 10000 };
    saldoInicial = config.saldoInicial || 0;
    rendaMensal = config.rendaMensal || 10000;
    if (document.getElementById('saldoInicial')) {
        document.getElementById('saldoInicial').value = saldoInicial;
    }
    if (document.getElementById('rendaMensal')) {
        document.getElementById('rendaMensal').value = rendaMensal;
    }
}

function salvarConfiguracoes() {
    saldoInicial = parseFloat(document.getElementById('saldoInicial').value) || 0;
    rendaMensal = parseFloat(document.getElementById('rendaMensal').value) || 10000;
    const config = { saldoInicial, rendaMensal };
    localStorage.setItem(CHAVE_CONFIG, JSON.stringify(config));
    atualizarTela();
    alert('✅ Configurações salvas!');
}

// ====== FUNÇÕES DE RECEITAS (RENDA) ======
function adicionarReceita() {
    const data = document.getElementById('dataReceita').value;
    const descricao = document.getElementById('descricaoReceita').value.trim();
    const categoria = document.getElementById('categoriaReceita').value;
    const valor = parseFloat(document.getElementById('valorReceita').value) || 0;

    if (!data || !descricao || valor <= 0) {
        alert('⚠️ Preencha todos os campos corretamente!');
        return;
    }

    receitas.push({
        id: Date.now(),
        data,
        descricao,
        categoria,
        valor
    });

    document.getElementById('formReceita').reset();
    definirDataAtual();
    salvarDados();
    atualizarTabelaReceitas();
    atualizarTela();
}

function deletarReceita(id) {
    if (confirm('Tem certeza que deseja deletar esta receita?')) {
        receitas = receitas.filter(r => r.id !== id);
        salvarDados();
        atualizarTabelaReceitas();
        atualizarTela();
    }
}

function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function atualizarTabelaReceitas() {
    const tbody = document.getElementById('corpoReceitas');
    if (!tbody) return;
    
    if (receitas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999; padding: 20px;">Nenhuma receita adicionada ainda</td></tr>';
        return;
    }

    tbody.innerHTML = receitas.map(receita => {
        const categoria = categoriasBase.find(c => c.nome === receita.categoria) || categoriasBase[6];
        return `
            <tr>
                <td style="text-align: center;">${categoria.emoji}</td>
                <td>${formatarData(receita.data)}</td>
                <td>${receita.descricao}</td>
                <td>${receita.categoria}</td>
                <td style="text-align: right; color: #6fdd9c; font-weight: bold;">+R$ ${receita.valor.toFixed(2)}</td>
                <td style="text-align: center;">
                    <button onclick="deletarReceita(${receita.id})" style="background: #ff7b7b; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">Deletar</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ====== FUNÇÕES DE INVESTIMENTOS ======
function adicionarInvestimento() {
    const valor = parseFloat(document.getElementById('valorInvestimento').value) || 0;
    const tipo = document.getElementById('tipoInvestimento').value;
    const descricao = document.getElementById('descricaoInvestimento').value.trim();
    const data = document.getElementById('dataInvestimento').value;

    if (!valor || !tipo || !descricao || !data) {
        alert('⚠️ Preencha todos os campos corretamente!');
        return;
    }

    investimentos.push({
        id: Date.now(),
        valor,
        tipo,
        descricao,
        data
    });

    document.getElementById('valorInvestimento').value = '';
    document.getElementById('tipoInvestimento').value = '';
    document.getElementById('descricaoInvestimento').value = '';
    document.getElementById('dataInvestimento').value = '';
    
    salvarInvestimentos();
    atualizarTabelaInvestimentos();
    atualizarGraficoInvestimentos();
    atualizarResumoInvestimentos();
}

function deletarInvestimento(id) {
    if (confirm('Tem certeza que deseja deletar este investimento?')) {
        investimentos = investimentos.filter(i => i.id !== id);
        salvarInvestimentos();
        atualizarTabelaInvestimentos();
        atualizarGraficoInvestimentos();
        atualizarResumoInvestimentos();
    }
}

function salvarInvestimentos() {
    localStorage.setItem(CHAVE_INVESTIMENTOS, JSON.stringify(investimentos));
}

function obterCorInvestimento(tipo) {
    const cores = {
        'Renda Fixa': '#6fdd9c',
        'Ações': '#ff7b7b',
        'Criptomoedas': '#ffa500',
        'Imóveis': '#764ba2'
    };
    return cores[tipo] || '#667eea';
}

function atualizarTabelaInvestimentos() {
    const tbody = document.getElementById('tabelaInvestimentos');
    if (!tbody) return;

    if (investimentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999; padding: 20px;">Nenhum investimento registrado ainda</td></tr>';
        return;
    }

    tbody.innerHTML = [...investimentos]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .map(inv => `
            <tr>
                <td>${formatarData(inv.data)}</td>
                <td><span style="background: ${obterCorInvestimento(inv.tipo)}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 0.85em; font-weight: 600;">${inv.tipo}</span></td>
                <td>${inv.descricao}</td>
                <td style="text-align: right; color: #667eea; font-weight: bold;">R$ ${inv.valor.toFixed(2)}</td>
                <td style="text-align: center;">
                    <button onclick="deletarInvestimento(${inv.id})" style="background: #ff7b7b; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">Deletar</button>
                </td>
            </tr>
        `).join('');
}

function atualizarResumoInvestimentos() {
    const totalInvestido = investimentos.reduce((sum, inv) => sum + inv.valor, 0);
    const maiorInvestimento = investimentos.length > 0 ? Math.max(...investimentos.map(inv => inv.valor)) : 0;

    document.getElementById('totalInvestido').textContent = totalInvestido.toFixed(2);
    document.getElementById('totalInvestimentos').textContent = investimentos.length;
    document.getElementById('maiorInvestimento').textContent = maiorInvestimento.toFixed(2);
}

function atualizarGraficoInvestimentos() {
    const canvas = document.getElementById('graficoInvestimentos');
    if (!canvas) return;

    const tipos = {};
    investimentos.forEach(inv => {
        tipos[inv.tipo] = (tipos[inv.tipo] || 0) + inv.valor;
    });

    const labels = Object.keys(tipos);
    const dados = Object.values(tipos);
    const cores = ['#6fdd9c', '#ff7b7b', '#667eea', '#ffa500', '#764ba2', '#00bcd4', '#ff9800', '#e91e63'];

    if (window.graficoInvestimentosChart) window.graficoInvestimentosChart.destroy();

    window.graficoInvestimentosChart = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: { labels, datasets: [{ data: dados, backgroundColor: cores.slice(0, labels.length), borderColor: '#fff', borderWidth: 2 }] },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 15, font: { size: 12 } } },
                tooltip: { callbacks: { label: ctx => `R$ ${ctx.parsed.toFixed(2)} (${((ctx.parsed / dados.reduce((a, b) => a + b)) * 100).toFixed(1)}%)` } }
            }
        }
    });
}

// ====== ANÁLISE E FILTROS ======
function filtrarPorPeriodo() {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;

    if (!dataInicio || !dataFim) {
        alert('⚠️ Selecione as datas de início e fim!');
        return;
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    const transacoesFiltradas = transacoes.filter(t => {
        const [ano, mes, dia] = t.data.split('-');
        const data = new Date(ano, mes - 1, dia);
        return data >= inicio && data <= fim;
    });

    const receitasFiltradas = receitas.filter(r => {
        const [ano, mes, dia] = r.data.split('-');
        const data = new Date(ano, mes - 1, dia);
        return data >= inicio && data <= fim;
    });

    const despesasFixasFiltradas = despesasFixas.filter(d => {
        const [ano, mes, dia] = d.data.split('-');
        const data = new Date(ano, mes - 1, dia);
        return data >= inicio && data <= fim;
    });

    const totalReceitas = receitasFiltradas.reduce((sum, r) => sum + r.valor, 0);
    const totalVariaveis = transacoesFiltradas.reduce((sum, t) => sum + t.valor, 0);
    const totalFixas = despesasFixasFiltradas.reduce((sum, d) => sum + d.valor, 0);
    const saldo = totalReceitas - totalVariaveis - totalFixas;

    const html = `
        <h4 style="color: #333; margin-bottom: 15px;">📊 Período: ${dataInicio} a ${dataFim}</h4>
        <div class="comparacao-grid">
            <div class="card-comparacao">
                <div class="card-comparacao-titulo">💰 Receitas</div>
                <div class="card-comparacao-valor">R$ ${totalReceitas.toFixed(2)}</div>
            </div>
            <div class="card-comparacao">
                <div class="card-comparacao-titulo">📌 Despesas Variáveis</div>
                <div class="card-comparacao-valor" style="color: #ff7b7b;">-R$ ${totalVariaveis.toFixed(2)}</div>
            </div>
            <div class="card-comparacao">
                <div class="card-comparacao-titulo">📋 Despesas Fixas</div>
                <div class="card-comparacao-valor" style="color: #ff7b7b;">-R$ ${totalFixas.toFixed(2)}</div>
            </div>
            <div class="card-comparacao">
                <div class="card-comparacao-titulo">💳 Saldo</div>
                <div class="card-comparacao-valor" style="color: ${saldo >= 0 ? '#6fdd9c' : '#ff7b7b'};">${saldo >= 0 ? '+' : ''}R$ ${saldo.toFixed(2)}</div>
            </div>
        </div>
    `;
    const container = document.getElementById('containerAnalisisePeriodo');
    if (container) {
        container.innerHTML = html;
    }
}

function limparFiltro() {
    document.getElementById('dataInicio').value = '';
    document.getElementById('dataFim').value = '';
    const container = document.getElementById('containerAnalisisePeriodo');
    if (container) {
        container.innerHTML = '<p style="color: #999; text-align: center;">Selecione um período para análise</p>';
    }
}

// ====== COMPARATIVO MÊS A MÊS ======
function atualizarComparativo() {
    const container = document.getElementById('containerComparativo');
    if (!container) return;

    const agora = new Date();
    const meses = [];
    const dadosMeses = [];

    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
        const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const chave = `${ano}-${mes}`;
        
        const receitasMes = receitas.filter(r => r.data.substring(0, 7) === chave).reduce((s, r) => s + r.valor, 0);
        const despesasMes = transacoes.filter(t => t.data.substring(0, 7) === chave).reduce((s, t) => s + t.valor, 0);
        const fixasMes = despesasFixas.filter(f => f.data.substring(0, 7) === chave).reduce((s, f) => s + f.valor, 0);
        
        meses.push({
            mes: d.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }),
            data: chave
        });
        
        dadosMeses.push({
            receitas: receitasMes,
            despesas: despesasMes + fixasMes,
            saldo: receitasMes - despesasMes - fixasMes
        });
    }

    // Calcular variação
    let html = '<h4 style="color: #333; margin-bottom: 15px;">📈 Últimos 6 Meses</h4>';
    html += '<div class="comparacao-grid">';
    
    dadosMeses.forEach((mes, idx) => {
        const mesPosterior = idx < dadosMeses.length - 1 ? dadosMeses[idx + 1] : null;
        const variacao = mesPosterior ? ((mes.saldo - mesPosterior.saldo) / Math.abs(mesPosterior.saldo || 1)) * 100 : 0;
        const sinal = variacao >= 0 ? '↑' : '↓';
        const cor = variacao >= 0 ? '#6fdd9c' : '#ff7b7b';

        html += `
            <div class="card-comparacao">
                <div class="card-comparacao-titulo">${meses[idx].mes}</div>
                <div class="card-comparacao-valor">R$ ${mes.saldo.toFixed(2)}</div>
                <div class="card-comparacao-variacao" style="color: ${cor};">
                    ${sinal} ${Math.abs(variacao).toFixed(1)}%
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// ====== RESUMO MENSAL DETALHADO ======
function gerarResumoMensal() {
    const mes = document.getElementById('mesSelecionado').value;
    
    if (!mes) {
        alert('⚠️ Selecione um mês!');
        return;
    }

    const [ano, mesPad] = mes.split('-');
    const mesStr = `${ano}-${mesPad}`;

    const receitasMes = receitas.filter(r => r.data.substring(0, 7) === mesStr);
    const transacoesMes = transacoes.filter(t => t.data.substring(0, 7) === mesStr);
    const fixasMes = despesasFixas.filter(f => f.data.substring(0, 7) === mesStr);

    const totalReceitas = receitasMes.reduce((s, r) => s + r.valor, 0);
    const totalVariaveis = transacoesMes.reduce((s, t) => s + t.valor, 0);
    const totalFixas = fixasMes.reduce((s, f) => s + f.valor, 0);
    const saldoMes = totalReceitas - totalVariaveis - totalFixas;

    let html = `<h4 style="color: #333; margin-bottom: 15px;">📋 ${new Date(ano, mesPad - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h4>`;

    html += `
        <div class="comparacao-grid" style="margin-bottom: 20px;">
            <div class="card-comparacao">
                <div class="card-comparacao-titulo">💰 Receitas</div>
                <div class="card-comparacao-valor" style="color: #6fdd9c;">+R$ ${totalReceitas.toFixed(2)}</div>
            </div>
            <div class="card-comparacao">
                <div class="card-comparacao-titulo">📌 Variáveis</div>
                <div class="card-comparacao-valor" style="color: #ff7b7b;">-R$ ${totalVariaveis.toFixed(2)}</div>
            </div>
            <div class="card-comparacao">
                <div class="card-comparacao-titulo">📋 Fixas</div>
                <div class="card-comparacao-valor" style="color: #ff7b7b;">-R$ ${totalFixas.toFixed(2)}</div>
            </div>
            <div class="card-comparacao">
                <div class="card-comparacao-titulo">💳 Saldo</div>
                <div class="card-comparacao-valor" style="color: ${saldoMes >= 0 ? '#6fdd9c' : '#ff7b7b'};">${saldoMes >= 0 ? '+' : ''}R$ ${saldoMes.toFixed(2)}</div>
            </div>
        </div>
    `;

    // Tabela de receitas
    html += '<h5 style="color: #667eea; margin-top: 20px;">Receitas do Mês:</h5>';
    if (receitasMes.length > 0) {
        html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">';
        receitasMes.forEach(r => {
            const [a, m, d] = r.data.split('-');
            html += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 8px; width: 10%;">${d}/${m}</td>
                    <td style="padding: 8px;">${r.descricao}</td>
                    <td style="padding: 8px; text-align: right; color: #6fdd9c; font-weight: bold;">+R$ ${r.valor.toFixed(2)}</td>
                </tr>
            `;
        });
        html += '</table>';
    }

    // Tabela de despesas variáveis
    html += '<h5 style="color: #ff7b7b; margin-top: 20px;">Despesas Variáveis:</h5>';
    if (transacoesMes.length > 0) {
        html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">';
        transacoesMes.forEach(t => {
            const [a, m, d] = t.data.split('-');
            html += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 8px; width: 10%;">${d}/${m}</td>
                    <td style="padding: 8px;">${t.descricao}</td>
                    <td style="padding: 8px; text-align: right; color: #ff7b7b;">-R$ ${t.valor.toFixed(2)}</td>
                </tr>
            `;
        });
        html += '</table>';
    }

    // Tabela de despesas fixas
    html += '<h5 style="color: #ff7b7b; margin-top: 20px;">Despesas Fixas:</h5>';
    if (fixasMes.length > 0) {
        html += '<table style="width: 100%; border-collapse: collapse;">';
        fixasMes.forEach(f => {
            const [a, m, d] = f.data.split('-');
            html += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 8px; width: 10%;">${d}/${m}</td>
                    <td style="padding: 8px;">${f.descricao}</td>
                    <td style="padding: 8px; text-align: right; color: #ff7b7b;">-R$ ${f.valor.toFixed(2)}</td>
                </tr>
            `;
        });
        html += '</table>';
    }

    const container = document.getElementById('containerResumoMensal');
    if (container) {
        container.innerHTML = html;
    }
}

// ====== ALERTAS ======
function gerarAlertas() {
    const container = document.getElementById('containerAlertas');
    if (!container) return;

    let alertas = [];
    const agora = new Date();
    const mesCurrent = String(agora.getMonth() + 1).padStart(2, '0');
    const anoCurrent = agora.getFullYear();
    const mesAtual = `${anoCurrent}-${mesCurrent}`;

    // Calcular saldo atual
    const totalReceitas = receitas.filter(r => r.data.substring(0, 7) === mesAtual).reduce((s, r) => s + r.valor, 0);
    const totalVariaveis = transacoes.filter(t => t.data.substring(0, 7) === mesAtual).reduce((s, t) => s + t.valor, 0);
    const totalFixas = despesasFixas.filter(f => f.data.substring(0, 7) === mesAtual).reduce((s, f) => s + f.valor, 0);
    const saldoAtual = saldoInicial + totalReceitas - totalVariaveis - totalFixas;

    // Alerta 1: Saldo baixo
    if (saldoAtual < 1000) {
        alertas.push({
            tipo: 'critico',
            emoji: '⚠️',
            titulo: 'Saldo Crítico',
            mensagem: `Seu saldo está em R$ ${saldoAtual.toFixed(2)}`
        });
    } else if (saldoAtual < 3000) {
        alertas.push({
            tipo: 'aviso',
            emoji: '⚠️',
            titulo: 'Saldo Baixo',
            mensagem: `Seu saldo está em R$ ${saldoAtual.toFixed(2)}`
        });
    }

    // Alerta 2: Despesas acima do normal
    const mediaVariaveis = transacoes.length > 0 ? transacoes.reduce((s, t) => s + t.valor, 0) / transacoes.length : 0;
    if (mediaVariaveis > 0 && totalVariaveis > mediaVariaveis * 1.3) {
        alertas.push({
            tipo: 'aviso',
            emoji: '📈',
            titulo: 'Gastos Elevados',
            mensagem: `Despesas variáveis ${((totalVariaveis / mediaVariaveis - 1) * 100).toFixed(0)}% acima da média`
        });
    }

    // Alerta 3: Meta próxima do limite
    Object.keys(metas).forEach(categoria => {
        const gastoCategoria = transacoes.filter(t => t.categoria === categoria && t.data.substring(0, 7) === mesAtual).reduce((s, t) => s + t.valor, 0);
        if (gastoCategoria > metas[categoria] * 0.8) {
            alertas.push({
                tipo: 'aviso',
                emoji: '🎯',
                titulo: `Meta ${categoria}`,
                mensagem: `${((gastoCategoria / metas[categoria]) * 100).toFixed(0)}% da meta atingida`
            });
        }
    });

    // Alerta 4: Sem receitas no mês
    if (totalReceitas === 0) {
        alertas.push({
            tipo: 'aviso',
            emoji: '💰',
            titulo: 'Sem Receitas',
            mensagem: 'Nenhuma receita registrada este mês'
        });
    }

    // Renderizar alertas
    if (alertas.length === 0) {
        container.innerHTML = '<div style="color: #6fdd9c; text-align: center; padding: 20px;">✅ Tudo em dia!</div>';
    } else {
        let html = '';
        alertas.forEach(alerta => {
            html += `
                <div class="alerta ${alerta.tipo}">
                    <div style="font-weight: bold; margin-bottom: 5px;">${alerta.emoji} ${alerta.titulo}</div>
                    <div style="font-size: 13px;">${alerta.mensagem}</div>
                </div>
            `;
        });
        container.innerHTML = html;
    }
}

// ====== SALDO ACUMULADO ======
function calcularSaldoAcumulado() {
    const meses = {};
    const todasAsTransacoes = [
        ...receitas.map(r => ({ ...r, tipo: 'receita', valor: r.valor })),
        ...transacoes.map(t => ({ ...t, tipo: 'despesa', valor: -t.valor })),
        ...despesasFixas.map(f => ({ ...f, tipo: 'fixa', valor: -f.valor }))
    ];

    todasAsTransacoes.sort((a, b) => new Date(a.data) - new Date(b.data));

    let saldoAcum = saldoInicial;
    todasAsTransacoes.forEach(t => {
        const mesCh = t.data.substring(0, 7);
        if (!meses[mesCh]) meses[mesCh] = saldoAcum;
        saldoAcum += t.valor;
    });

    return { meses, saldoFinal: saldoAcum };
}

function obterDadosMes() {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    const mesCh = `${ano}-${mes}`;

    const receitas_mes = receitas.filter(r => r.data.substring(0, 7) === mesCh).reduce((sum, r) => sum + r.valor, 0);
    const variaveis = transacoes.filter(t => t.data.substring(0, 7) === mesCh).reduce((sum, t) => sum + t.valor, 0);
    const fixas = despesasFixas.filter(f => f.data.substring(0, 7) === mesCh).reduce((sum, f) => sum + f.valor, 0);

    return { receitas: receitas_mes, variaveis, fixas };
}

function atualizarResumo() {
    const { receitas: receitasExtra, variaveis, fixas } = obterDadosMes();
    const total = fixas + variaveis;
    const receitaTotal = rendaMensal + receitasExtra;
    const saldoMes = receitaTotal - total;

    document.getElementById("totalFixas").innerText = fixas.toFixed(2);
    document.getElementById("totalVariaveis").innerText = variaveis.toFixed(2);
    document.getElementById("totalPlanejado").innerText = total.toFixed(2);
    document.getElementById("saldoDisponivel").innerText = calcularSaldo(receitaTotal, total).toFixed(2);
}

function atualizarDashboardExecutivo() {
    const { receitas: receitasExtra, variaveis, fixas } = obterDadosMes();
    const totalReceitas = rendaMensal + receitasExtra;
    const totalDespesas = fixas + variaveis;
    const saldoMes = totalReceitas - totalDespesas;
    const saldoFinal = saldoInicial + saldoMes;
    const taxaPoupanca = totalReceitas > 0 ? ((saldoMes / totalReceitas) * 100) : 0;
    const corSaldo = saldoFinal >= 0 ? '#6fdd9c' : '#ff7b7b';

    document.getElementById("kpiReceitasMes").innerText = `R$ ${totalReceitas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;  
    document.getElementById("kpiReceitasSubtext").innerText = `+ Extras: R$ ${receitasExtra.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById("kpiDespesasMes").innerText = `R$ ${totalDespesas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById("kpiDespesasSubtext").innerText = `Fixas: R$ ${fixas.toFixed(2)} | Variáveis: R$ ${variaveis.toFixed(2)}`;
    
    const kpiSaldo = document.getElementById("kpiSaldoTotal");
    kpiSaldo.innerText = `R$ ${saldoFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    kpiSaldo.style.color = corSaldo;
    
    document.getElementById("kpiSaldoSubtext").innerText = `+ R$ ${saldoInicial.toFixed(2)} inicial`;
    document.getElementById("kpiTaxaPoupanca").innerText = `${taxaPoupanca.toFixed(1)}%`;
}

function atualizarPendentes() {
    const mesAtual = new Date().toISOString().slice(0, 7);
    const container = document.getElementById("containerPendentes");
    
    // Coleta todas as despesas pendentes
    let pendentes = [];

    // Despesas fixas pendentes
    despesasFixas.forEach(d => {
        if (!d.pago) {
            pendentes.push({
                id: d.id,
                descricao: d.descricao,
                categoria: d.categoria,
                valor: d.valor,
                tipo: "Fixa",
                data: "Recorrente"
            });
        }
    });

    // Despesas variáveis pendentes do mês atual
    transacoes.forEach(t => {
        if (!t.pago && t.data && t.data.startsWith(mesAtual)) {
            pendentes.push({
                id: t.id,
                descricao: t.descricao,
                categoria: t.categoria,
                valor: t.valor,
                tipo: "Variável",
                data: t.data
            });
        }
    });

    if (pendentes.length === 0) {
        container.innerHTML = '<div class="vazio">✅ Nenhum pagamento pendente!</div>';
        return;
    }

    // Calcula resumos
    let totalPendente = 0;
    let totalFixasPendentes = 0;
    let totalVariavelsPendentes = 0;
    let fixasPendentes = 0;
    let variaveisPendentes = 0;

    pendentes.forEach(p => {
        totalPendente += p.valor;
        if (p.tipo === "Fixa") {
            totalFixasPendentes += p.valor;
            fixasPendentes++;
        } else {
            totalVariavelsPendentes += p.valor;
            variaveisPendentes++;
        }
    });

    // Calcula percentual de pagamento
    let totalGeral = 0;
    despesasFixas.forEach(d => totalGeral += d.valor);
    const mesAtualVar = new Date().toISOString().slice(0, 7);
    transacoes.forEach(t => {
        if (t.data && t.data.startsWith(mesAtualVar)) {
            totalGeral += t.valor;
        }
    });

    const percentualPago = totalGeral > 0 ? ((totalGeral - totalPendente) / totalGeral) * 100 : 0;
    const percentualPendente = totalGeral > 0 ? (totalPendente / totalGeral) * 100 : 0;

    // Renderiza resumo
    let html = `
        <div class="resumo-pendentes">
            <h3 style="margin-top: 0; color: #d32f2f;">💳 Resumo de Pendentes</h3>
            <div class="resumo-pendentes-grid">
                <div class="resumo-item">
                    <div class="resumo-item-titulo">Total Pendente</div>
                    <div class="resumo-item-valor">R$ ${totalPendente.toFixed(2)}</div>
                </div>
                <div class="resumo-item">
                    <div class="resumo-item-titulo">Fixas Pendentes</div>
                    <div class="resumo-item-valor">${fixasPendentes}</div>
                </div>
                <div class="resumo-item">
                    <div class="resumo-item-titulo">Variáveis Pendentes</div>
                    <div class="resumo-item-valor">${variaveisPendentes}</div>
                </div>
                <div class="resumo-item">
                    <div class="resumo-item-titulo">Pago (%)</div>
                    <div class="resumo-item-valor">${percentualPago.toFixed(0)}%</div>
                </div>
            </div>
            <div class="barra-progresso" style="margin-top: 15px;">
                <div class="barra-progresso-preenchida" style="width: ${percentualPago}%"></div>
            </div>
        </div>
    `;

    // Renderiza cards de pendentes
    html += '<div class="container-pendentes">';
    pendentes.forEach(p => {
        const iconeTipo = p.tipo === "Fixa" ? "📌" : "📅";
        const classTipo = p.tipo === "Fixa" ? "Fixa" : "Variável";
        const dataPTBR = p.data === "Recorrente" ? "Recorrente" : new Date(p.data + "T00:00:00").toLocaleDateString('pt-BR');

        html += `
            <div class="card-pendente">
                <span class="card-pendente-tipo">${iconeTipo} ${classTipo}</span>
                <div class="card-pendente-desc">${p.descricao}</div>
                <div class="card-pendente-info">
                    <div class="card-pendente-info-item">
                        <strong>Categoria:</strong><br>${p.categoria}
                    </div>
                    <div class="card-pendente-info-item">
                        <strong>Data:</strong><br>${dataPTBR}
                    </div>
                </div>
                <div class="card-pendente-valor">R$ ${p.valor.toFixed(2)}</div>
                <button class="secondary" style="width: 100%; margin-top: 15px; padding: 8px;" onclick="marcarPagaFixa(${p.id})">✅ Marcar como Pago</button>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

function gerarLinhaTabela(item, tipo) {
    const classPago = item.pago ? 'linha-paga' : '';
    const checkboxIcon = item.pago ? '✅' : '⭕';
    const data = tipo === 'fixa' ? 'Recorrente' : formatarData(item.data);
    const funcMarcar = tipo === 'fixa' ? `marcarPagaFixa(${item.id})` : `marcarPagaVariavel(${item.id})`;
    const funcDeletar = tipo === 'fixa' ? `deletarFixa(${item.id})` : `deletarVariavel(${item.id})`;
    
    return `
        <tr class="${classPago}">
            <td style="text-align: center; cursor: pointer;" onclick="${funcMarcar}" class="checkbox-pago">${checkboxIcon}</td>
            <td>${tipo === 'fixa' ? '' : data}</td>
            <td><strong>${item.descricao}</strong></td>
            <td>${item.categoria}</td>
            <td style="text-align: right; font-weight: 600; color: #ff7b7b;">R$ ${item.valor.toFixed(2)}</td>
            <td style="text-align: center;">
                <button class="danger" onclick="${funcDeletar}">🗑️</button>
            </td>
        </tr>
    `;
}

function atualizarTabelaFixas() {
    const corpo = document.getElementById("corpoFixas");
    if (despesasFixas.length === 0) {
        corpo.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #5eb3d8; padding: 30px;">📭 Nenhuma despesa fixa cadastrada</td></tr>';
        return;
    }
    corpo.innerHTML = despesasFixas.map(d => gerarLinhaTabela(d, 'fixa')).join('');
}

function atualizarTabelaVariaveis() {
    const corpo = document.getElementById("corpoVariaveis");
    if (transacoes.length === 0) {
        corpo.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #5eb3d8; padding: 30px;">📭 Nenhuma despesa variável registrada</td></tr>';
        return;
    }
    corpo.innerHTML = transacoes.map(t => gerarLinhaTabela(t, 'variavel')).join('');
}

function atualizarCategoriaResumo() {
    const categorias = {};

    transacoes.forEach(t => {
        if (!categorias[t.categoria]) {
            categorias[t.categoria] = { entrada: 0, saida: 0 };
        }
        if (t.tipo === "Entrada") {
            categorias[t.categoria].entrada += t.valor;
        } else {
            categorias[t.categoria].saida += t.valor;
        }
    });

    const container = document.getElementById("categoriaResumo");
    if (Object.keys(categorias).length === 0) {
        container.innerHTML = '<div class="vazio">📭 Nenhuma categoria com transações</div>';
        return;
    }

    let html = '';
    Object.entries(categorias).forEach(([cat, valores]) => {
        const saldo = valores.entrada - valores.saida;
        html += `<div class="cat-item">
            <strong>${cat}</strong>
            <p>📈 Entrada: R$ ${valores.entrada.toFixed(2)}</p>
            <p>📉 Saída: R$ ${valores.saida.toFixed(2)}</p>
            <p style="color: ${saldo >= 0 ? '#11998e' : '#ee0979'}; font-weight: bold;">
                Saldo: R$ ${saldo.toFixed(2)}
            </p>
        </div>`;
    });

    container.innerHTML = html;
}

function atualizarTabelaConsolidada() {
    const corpo = document.getElementById("corpoConsolidado");
    const mesAtual = new Date().toISOString().slice(0, 7);
    
    // Cria array consolidado com fixas + variáveis do mês
    let consolidado = [];

    // Adiciona despesas fixas
    despesasFixas.forEach(f => {
        consolidado.push({
            data: "Recorrente",
            descricao: f.descricao,
            categoria: f.categoria,
            tipo: "Fixa",
            valor: f.valor
        });
    });

    // Adiciona despesas variáveis do mês atual
    transacoes.forEach(t => {
        if (t.data && t.data.startsWith(mesAtual)) {
            consolidado.push({
                data: t.data,
                descricao: t.descricao,
                categoria: t.categoria,
                tipo: "Variável",
                valor: t.valor
            });
        }
    });

    // Ordena por data (fixas primeiro, depois por data decrescente)
    consolidado.sort((a, b) => {
        if (a.tipo === "Fixa") return -1;
        if (b.tipo === "Fixa") return 1;
        return new Date(b.data) - new Date(a.data);
    });

    if (consolidado.length === 0) {
        corpo.innerHTML = '<tr><td colspan="5" class="vazio">📭 Nenhuma despesa registrada</td></tr>';
        return;
    }

    let html = '';
    consolidado.forEach(item => {
        const dataPTBR = item.data === "Recorrente" ? "Recorrente" : new Date(item.data + "T00:00:00").toLocaleDateString('pt-BR');
        const classTipo = item.tipo === "Fixa" ? "tipo-fixa" : "tipo-variavel";
        const classValor = item.tipo === "Fixa" ? "valor-fixa" : "valor-variavel";

        html += `<tr>
            <td>${dataPTBR}</td>
            <td>${item.descricao}</td>
            <td>${item.categoria}</td>
            <td><span class="${classTipo}">${item.tipo}</span></td>
            <td class="${classValor}" style="text-align: right;">R$ ${item.valor.toFixed(2)}</td>
        </tr>`;
    });

    corpo.innerHTML = html;
    atualizarCategoriaResumo();
}

function atualizarGraficos() {
    atualizarGraficoGastos();
    atualizarGraficoCategoria();
    atualizarGraficoMetas();
}

function atualizarGraficoGastos() {
    const meses = {};

    transacoes.forEach(t => {
        const mes = t.data.substring(0, 7);
        if (!meses[mes]) {
            meses[mes] = { entrada: 0, saida: 0 };
        }
        if (t.tipo === "Entrada") {
            meses[mes].entrada += t.valor;
        } else {
            meses[mes].saida += t.valor;
        }
    });

    const labels = Object.keys(meses).sort();
    const entradas = labels.map(m => meses[m].entrada);
    const saidas = labels.map(m => meses[m].saida);

    const ctx = document.getElementById('graficoGastos').getContext('2d');
    
    if (window.graficoGastosInstance) {
        window.graficoGastosInstance.destroy();
    }

    window.graficoGastosInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: entradas,
                    borderColor: '#6fdd9c',
                    backgroundColor: 'rgba(111, 221, 156, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: '#6fdd9c'
                },
                {
                    label: 'Despesas',
                    data: saidas,
                    borderColor: '#ff7b7b',
                    backgroundColor: 'rgba(255, 123, 123, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: '#ff7b7b'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: { font: { size: 12 }, usePointStyle: true }
                },
                title: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: function(value) { return 'R$ ' + value; } }
                }
            }
        }
    });
}

function atualizarGraficoCategoria() {
    const categorias = {};

    transacoes.forEach(t => {
        if (t.tipo === "Saída") {
            categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor;
        }
    });

    const labels = Object.keys(categorias);
    const dados = Object.values(categorias);

    if (labels.length === 0) return;

    const ctx = document.getElementById('graficoCategoria').getContext('2d');
    
    if (window.graficoCategoriaInstance) {
        window.graficoCategoriaInstance.destroy();
    }

    window.graficoCategoriaInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: dados,
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe',
                    '#00f2fe',
                    '#43e97b',
                    '#fa709a',
                    '#fee140',
                    '#30cfd0'
                ],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { font: { size: 12 }, padding: 15 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': R$ ' + context.parsed.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

function atualizarGraficoMetas() {
    const categorias = Object.keys(metas);
    const metasValores = Object.values(metas);
    const gastosValores = categorias.map(cat => obterGastoMesAtual(cat));

    const ctx = document.getElementById('graficoMetas');
    if (!ctx) return;

    if (categorias.length === 0) return;

    const context = ctx.getContext('2d');
    
    if (window.graficoMetasInstance) {
        window.graficoMetasInstance.destroy();
    }

    window.graficoMetasInstance = new Chart(context, {
        type: 'bar',
        data: {
            labels: categorias,
            datasets: [
                {
                    label: 'Meta',
                    data: metasValores,
                    backgroundColor: '#667eea',
                    borderRadius: 5
                },
                {
                    label: 'Gasto',
                    data: gastosValores,
                    backgroundColor: '#ff7b7b',
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: true,
                    labels: { font: { size: 12 } }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { callback: function(value) { return 'R$ ' + value; } }
                }
            }
        }
    });
}

// 📈 NOVO: Evolução do Saldo
// 📊 NOVO: Tendência de Gastos
// 🏆 NOVO: Top 5 Maiores Gastos
// 📅 NOVO: Gastos por Dia da Semana
// ⚖️ NOVO: Comparativo Entrada vs Saída
// 🥧 NOVO: Distribuição por Categoria (Entrada)


function exportarCSV() {
    if (transacoes.length === 0) {
        alert("❌ Nenhuma transação para exportar!");
        return;
    }

    let csv = "Data,Descrição,Categoria,Valor,Tipo\n";
    transacoes.forEach(t => {
        csv += `"${new Date(t.data).toLocaleDateString('pt-BR')}","${t.descricao}","${t.categoria}","${t.valor.toFixed(2)}","${t.tipo}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `financas_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
    link.click();

    alert("✅ Arquivo exportado com sucesso!");
}

function limparTudo() {
    if (confirm("⚠️ Tem CERTEZA que deseja limpar todos os dados? Esta ação não pode ser desfeita!")) {
        if (confirm("🚨 Confirme novamente para deletar TUDO:")) {
            transacoes = [];
            salvarDados();
            atualizarTela();
            alert("✅ Todos os dados foram removidos!");
        }
    }
}

// =============== 🤖 INTELIGÊNCIA ARTIFICIAL ===============

function gerarPrevisao() {
    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

    // Calcula gastos dos últimos 3 meses
    const ultimosTresMeses = {};
    transacoes.forEach(t => {
        if (t.tipo === 'Saída') {
            const mes = t.data.substring(0, 7);
            ultimosTresMeses[mes] = (ultimosTresMeses[mes] || 0) + t.valor;
        }
    });

    const valores = Object.values(ultimosTresMeses).slice(-3);
    
    if (valores.length === 0) {
        return 0;
    }

    // Média com ponderação (últimos meses têm mais peso)
    const media = valores.reduce((a, b) => a + b) / valores.length;
    const tendencia = valores.length >= 2 ? (valores[valores.length - 1] - valores[0]) / valores.length : 0;

    return media + tendencia;
}

function atualizarPrevisao() {
    const previsao = gerarPrevisao();
    const today = new Date();
    const diasFaltandoMes = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();

    const previsaoTotal = previsao;
    const mediadiaria = previsao / 30;

    document.getElementById('previsaoGasto').innerHTML = `
        <p>💰 Previsão para este mês: <strong style="color: #ff7b7b;">R$ ${previsaoTotal.toFixed(2)}</strong></p>
        <p>📊 Média diária: <strong style="color: #667eea;">R$ ${mediadiaria.toFixed(2)}</strong></p>
        <p>📅 Dias restantes: <strong style="color: #6fdd9c;">${diasFaltandoMes} dias</strong></p>
    `;
}

function gerarRecomendacoes() {
    const container = document.getElementById('recomendacoes');
    const categorias = {};
    let totalSaida = 0;

    transacoes.forEach(t => {
        if (t.tipo === 'Saída') {
            categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor;
            totalSaida += t.valor;
        }
    });

    const recomendacoes = [];
    Object.entries(categorias).forEach(([cat, valor]) => {
        const percentual = (valor / totalSaida) * 100;
        if (cat === 'Alimentação' && percentual > 35) recomendacoes.push('🍔 Alimentação alta!');
        if (cat === 'Lazer' && percentual > 20) recomendacoes.push('🎮 Entretenimento elevado.');
        if (cat === 'Transporte' && percentual > 20) recomendacoes.push('🚗 Transporte elevado.');
    });

    Object.entries(metas).forEach(([cat, meta]) => {
        if (obterGastoMesAtual(cat) > meta * 0.8) recomendacoes.push(`⚠️ ${cat} próxima do limite!`);
    });

    if (recomendacoes.length === 0) recomendacoes.push('✅ Gastos sob controle!');
    
    const container_elem = document.getElementById('recomendacoes');
    if (container_elem) {
        container_elem.innerHTML = recomendacoes.slice(0, 3).map(r => `<p style="margin: 5px 0; color: #6fdd9c;">• ${r}</p>`).join('');
    }
}

function gerarRelatorioPDF() {
    const elemento = document.createElement('div');
    elemento.style.padding = '20px';
    elemento.style.color = '#000';
    elemento.style.backgroundColor = '#fff';

    const hoje = new Date().toLocaleDateString('pt-BR');
    let entradaTotal = 0, saidaTotal = 0;

    transacoes.forEach(t => {
        if (t.tipo === 'Entrada') entradaTotal += t.valor;
        else saidaTotal += t.valor;
    });

    elemento.innerHTML = `
        <h1>📊 Relatório Financeiro</h1>
        <p><strong>Data:</strong> ${hoje}</p>
        <hr>
        <h2>Resumo</h2>
        <p><strong>Total de Entradas:</strong> R$ ${entradaTotal.toFixed(2)}</p>
        <p><strong>Total de Saídas:</strong> R$ ${saidaTotal.toFixed(2)}</p>
        <p><strong>Saldo:</strong> R$ ${(entradaTotal - saidaTotal).toFixed(2)}</p>
        <hr>
        <h2>Transações</h2>
        <table border="1" cellpadding="8" style="width: 100%;">
            <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Tipo</th></tr>
            ${transacoes.map(t => `<tr><td>${new Date(t.data).toLocaleDateString('pt-BR')}</td><td>${t.descricao}</td><td>${t.categoria}</td><td>R$ ${t.valor.toFixed(2)}</td><td>${t.tipo}</td></tr>`).join('')}
        </table>
    `;

    const opt = { margin: 10, filename: `relatorio_financeiro_${hoje.replace(/\//g, '-')}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' } };
    html2pdf().set(opt).from(elemento).save();
    alert('✅ PDF gerado com sucesso!');
}

function compartilharWhatsApp() {
    const entradas = transacoes.filter(t => t.tipo === 'Entrada').reduce((sum, t) => sum + t.valor, 0);
    const saidas = transacoes.filter(t => t.tipo === 'Saída').reduce((sum, t) => sum + t.valor, 0);
    const saldo = entradas - saidas;

    const mensagem = `💰 *Resumo Financeiro*\n\n📈 Entradas: R$ ${entradas.toFixed(2)}\n📉 Saídas: R$ ${saidas.toFixed(2)}\n💵 Saldo: R$ ${saldo.toFixed(2)}\n\n✨ Gerado pelo Controle Financeiro`;
    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank');
}

// Atualizar previsões e recomendações ao carregar
function atualizarInteligencia() {
    atualizarPrevisao();
    gerarRecomendacoes();
}

function calcularSaldo(receita, despesa) {
    return receita - despesa;
}

// ========== 🟢 NOVAS 10 FEATURES ==========

// 1️⃣ GRÁFICO DE EVOLUÇÃO DO SALDO
function atualizarGraficoEvolucaoSaldo() {
    const canvas = document.getElementById('graficoEvolucaoSaldo');
    if (!canvas) return;

    const meses = {};
    const hoje = new Date();
    
    // Últimos 12 meses
    for (let i = 11; i >= 0; i--) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        meses[chave] = saldoInicial;
    }

    // Acumula transações
    [...receitas, ...transacoes, ...despesasFixas].forEach(t => {
        const chave = t.data.substring(0, 7);
        if (meses[chave] !== undefined) {
            if (receitas.includes(t)) meses[chave] += t.valor;
            else meses[chave] -= t.valor;
        }
    });

    const labels = Object.keys(meses).map(m => {
        const [ano, mes] = m.split('-');
        return new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    });
    const dados = Object.values(meses);

    if (window.graficoEvolucaoChart) window.graficoEvolucaoChart.destroy();

    window.graficoEvolucaoChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Saldo Acumulado',
                data: dados,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, labels: { font: { size: 12 } } },
                tooltip: { callbacks: { label: ctx => `R$ ${ctx.parsed.y.toFixed(2)}` } }
            },
            scales: {
                y: {
                    ticks: { callback: v => `R$ ${v.toFixed(0)}` }
                }
            }
        }
    });
}

// 2️⃣ SCORE DE SAÚDE FINANCEIRA
function atualizarSaudeFinanceira() {
    const mesAtual = new Date().toISOString().slice(0, 7);
    const totalReceitas = receitas.filter(r => r.data.startsWith(mesAtual)).reduce((s, r) => s + r.valor, 0) + rendaMensal;
    const totalDespesas = transacoes.filter(t => t.data.startsWith(mesAtual)).reduce((s, t) => s + t.valor, 0) + despesasFixas.reduce((s, d) => s + d.valor, 0);
    const totalInvestido = investimentos.reduce((s, i) => s + i.valor, 0);
    
    const economia = totalReceitas - totalDespesas;
    const taxaEconomia = totalReceitas > 0 ? (economia / totalReceitas) * 100 : 0;
    const propFixas = totalReceitas > 0 ? (despesasFixas.reduce((s, d) => s + d.valor, 0) / totalReceitas) * 100 : 0;
    const propInvestimento = totalReceitas > 0 ? ((totalInvestido / totalReceitas) * 100) : 0;

    let score = 0;
    let recomendacao = '';

    // Taxa de economia (ideal >20%)
    if (taxaEconomia >= 30) { score += 35; }
    else if (taxaEconomia >= 20) { score += 28; }
    else if (taxaEconomia >= 10) { score += 15; }
    else if (taxaEconomia > 0) { score += 8; }

    // Fixas/Receita (ideal <60%)
    if (propFixas <= 40) { score += 35; }
    else if (propFixas <= 50) { score += 25; }
    else if (propFixas <= 60) { score += 15; }
    else { score += 5; }

    // Investimento/Receita (ideal >10%)
    if (propInvestimento >= 15) { score += 30; }
    else if (propInvestimento >= 10) { score += 25; }
    else if (propInvestimento >= 5) { score += 15; }
    else { score += 5; }

    // Recomendação
    if (score >= 80) recomendacao = "✅ Excelente! Sua saúde financeira está ótima. Continue assim!";
    else if (score >= 60) recomendacao = "🟡 Bom! Ainda há espaço para melhorias. Aumente a economia.";
    else if (score >= 40) recomendacao = "⚠️ Atenção! Reduza despesas fixas ou aumente receitas.";
    else recomendacao = "🔴 Crítico! Necessário reestruturação financeira urgente.";

    document.getElementById('scoreValor').textContent = Math.round(score);
    document.getElementById('metricaEconomia').textContent = taxaEconomia.toFixed(1) + '%';
    document.getElementById('statusEconomia').textContent = taxaEconomia >= 20 ? '✅' : '❌';
    document.getElementById('metricaFixas').textContent = propFixas.toFixed(1) + '%';
    document.getElementById('statusFixas').textContent = propFixas <= 60 ? '✅' : '❌';
    document.getElementById('metricaInvestimento').textContent = propInvestimento.toFixed(1) + '%';
    document.getElementById('statusInvestimento').textContent = propInvestimento >= 10 ? '✅' : '❌';
    document.getElementById('scoreRecomendacao').textContent = recomendacao;
}

// 3️⃣ ALERTAS INTELIGENTES EXPANDIDOS
function gerarAlertasInteligentes() {
    const container = document.getElementById('containerAlertasInteligentes');
    const mesAtual = new Date().toISOString().slice(0, 7);
    const alertas = [];

    const totalReceitas = receitas.filter(r => r.data.startsWith(mesAtual)).reduce((s, r) => s + r.valor, 0) + rendaMensal;
    const totalDespesas = transacoes.filter(t => t.data.startsWith(mesAtual)).reduce((s, t) => s + t.valor, 0) + despesasFixas.reduce((s, d) => s + d.valor, 0);
    const saldo = saldoInicial + totalReceitas - totalDespesas;

    // Gasto anormal
    const mediaGastos = transacoes.length > 0 ? transacoes.reduce((s, t) => s + t.valor, 0) / transacoes.length : 0;
    const gastoMesAtual = transacoes.filter(t => t.data.startsWith(mesAtual)).reduce((s, t) => s + t.valor, 0);
    if (gastoMesAtual > mediaGastos * 1.5 && gastoMesAtual > 0) {
        alertas.push({ tipo: 'critico', emoji: '📈', titulo: 'Gasto Anormal', msg: `Despesas ${((gastoMesAtual / mediaGastos - 1) * 100).toFixed(0)}% acima da média` });
    }

    // Saldo baixo
    if (saldo < 500) alertas.push({ tipo: 'critico', emoji: '⚠️', titulo: 'Saldo Crítico', msg: `R$ ${saldo.toFixed(2)}` });
    else if (saldo < 2000) alertas.push({ tipo: 'aviso', emoji: '⚠️', titulo: 'Saldo Baixo', msg: `R$ ${saldo.toFixed(2)}` });

    // Limite de meta próximo
    Object.entries(metas || {}).forEach(([cat, meta]) => {
        const gasto = transacoes.filter(t => t.categoria === cat && t.data.startsWith(mesAtual)).reduce((s, t) => s + t.valor, 0);
        if (gasto > meta * 0.9 && gasto <= meta) {
            alertas.push({ tipo: 'aviso', emoji: '🎯', titulo: `Meta ${cat}`, msg: `${((gasto / meta) * 100).toFixed(0)}% atingida` });
        } else if (gasto > meta) {
            alertas.push({ tipo: 'critico', emoji: '🚨', titulo: `Meta ${cat} ESTOURADA`, msg: `${((gasto / meta) * 100).toFixed(0)}% da meta` });
        }
    });

    // Sem receita
    if (totalReceitas === rendaMensal) {
        alertas.push({ tipo: 'aviso', emoji: '💰', titulo: 'Sem Receitas Extra', msg: 'Nenhuma receita adicional este mês' });
    }

    // Sem investimentos
    if (investimentos.length === 0) {
        alertas.push({ tipo: 'aviso', emoji: '💎', titulo: 'Sem Investimentos', msg: 'Considere diversificar seus investimentos' });
    }

    // Positivos
    if (saldo > totalReceitas * 0.3) {
        alertas.push({ tipo: 'positivo', emoji: '✨', titulo: 'Parabéns!', msg: 'Você está economizando bem!' });
    }

    let html = alertas.length === 0 ? '<div style="text-align: center; color: #6fdd9c; padding: 20px;">✅ Sem alertas! Tudo em dia</div>' : '';
    alertas.forEach(a => {
        html += `<div class="alerta-inteligente ${a.tipo}">
            <div class="alerta-icone">${a.emoji}</div>
            <div class="alerta-conteudo">
                <div class="alerta-titulo">${a.titulo}</div>
                <div class="alerta-mensagem">${a.msg}</div>
            </div>
        </div>`;
    });

    if (container) container.innerHTML = html;
}

// 4️⃣ PREVISÃO DE CAIXA
function gerarPrevisaoCaixa() {
    const container = document.getElementById('containerPrevisaoCaixa');
    if (!container) return;

    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    const diasMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    const diasPassados = hoje.getDate();
    
    const saldoHoje = saldoInicial + 
        receitas.filter(r => r.data.startsWith(mesAtual) && r.data <= hoje.toISOString().split('T')[0]).reduce((s, r) => s + r.valor, 0) + 
        rendaMensal -
        transacoes.filter(t => t.data.startsWith(mesAtual) && t.data <= hoje.toISOString().split('T')[0]).reduce((s, t) => s + t.valor, 0) -
        despesasFixas.reduce((s, d) => s + d.valor, 0);

    const gastoMedioDia = (transacoes.filter(t => t.data.startsWith(mesAtual)).reduce((s, t) => s + t.valor, 0) + despesasFixas.reduce((s, d) => s + d.valor, 0)) / diasPassados || 0;
    const diasFaltando = diasMes - diasPassados;

    const previsao7 = saldoHoje - (gastoMedioDia * 7);
    const previsao15 = saldoHoje - (gastoMedioDia * 15);
    const previsao30 = saldoHoje - (gastoMedioDia * diasFaltando);

    let html = `
        <div class="card-comparacao">
            <div class="card-comparacao-titulo">💰 Saldo Hoje</div>
            <div class="card-comparacao-valor" style="color: ${saldoHoje >= 0 ? '#6fdd9c' : '#ff7b7b'};">R$ ${saldoHoje.toFixed(2)}</div>
        </div>
        <div class="card-comparacao">
            <div class="card-comparacao-titulo">📅 Daqui 7 dias</div>
            <div class="card-comparacao-valor" style="color: ${previsao7 >= 0 ? '#6fdd9c' : '#ff7b7b'};">R$ ${previsao7.toFixed(2)}</div>
        </div>
        <div class="card-comparacao">
            <div class="card-comparacao-titulo">📅 Daqui 15 dias</div>
            <div class="card-comparacao-valor" style="color: ${previsao15 >= 0 ? '#6fdd9c' : '#ff7b7b'};">R$ ${previsao15.toFixed(2)}</div>
        </div>
        <div class="card-comparacao">
            <div class="card-comparacao-titulo">📅 Fim do mês</div>
            <div class="card-comparacao-valor" style="color: ${previsao30 >= 0 ? '#6fdd9c' : '#ff7b7b'};">R$ ${previsao30.toFixed(2)}</div>
        </div>
    `;

    container.innerHTML = html;
}

// 5️⃣ COMPARATIVO "VOCÊ VS VOCÊ"
function gerarComparativoVoce() {
    const container = document.getElementById('containerComparativoVoce');
    if (!container) return;

    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    const mesPassa = `${hoje.getMonth() === 0 ? hoje.getFullYear() - 1 : hoje.getFullYear()}-${String((hoje.getMonth() === 0 ? 12 : hoje.getMonth())).padStart(2, '0')}`;

    const receitasAtual = receitas.filter(r => r.data.startsWith(mesAtual)).reduce((s, r) => s + r.valor, 0) + rendaMensal;
    const despesasAtual = transacoes.filter(t => t.data.startsWith(mesAtual)).reduce((s, t) => s + t.valor, 0) + despesasFixas.reduce((s, d) => s + d.valor, 0);
    const saldoAtual = receitasAtual - despesasAtual;

    const receitasPassada = receitas.filter(r => r.data.startsWith(mesPassa)).reduce((s, r) => s + r.valor, 0) + rendaMensal;
    const despesasPassada = transacoes.filter(t => t.data.startsWith(mesPassa)).reduce((s, t) => s + t.valor, 0) + despesasFixas.reduce((s, d) => s + d.valor, 0);
    const saldoPassada = receitasPassada - despesasPassada;

    const variacao = saldoPassada > 0 ? ((saldoAtual - saldoPassada) / saldoPassada) * 100 : 0;
    const variacaoDespesa = despesasPassada > 0 ? ((despesasAtual - despesasPassada) / despesasPassada) * 100 : 0;

    let html = `
        <div class="card-comparacao">
            <div class="card-comparacao-titulo">💰 Receitas</div>
            <div class="card-comparacao-valor">R$ ${receitasAtual.toFixed(2)}</div>
            <div class="card-comparacao-variacao ${(receitasAtual >= receitasPassada ? 'variacao-positiva' : 'variacao-negativa')}">
                ${receitasAtual >= receitasPassada ? '↑' : '↓'} ${Math.abs(((receitasAtual - receitasPassada) / receitasPassada) * 100).toFixed(1)}%
            </div>
        </div>
        <div class="card-comparacao">
            <div class="card-comparacao-titulo">📌 Despesas</div>
            <div class="card-comparacao-valor">R$ ${despesasAtual.toFixed(2)}</div>
            <div class="card-comparacao-variacao ${(despesasAtual <= despesasPassada ? 'variacao-positiva' : 'variacao-negativa')}">
                ${despesasAtual <= despesasPassada ? '↓' : '↑'} ${Math.abs(variacaoDespesa).toFixed(1)}%
            </div>
        </div>
        <div class="card-comparacao">
            <div class="card-comparacao-titulo">💳 Saldo</div>
            <div class="card-comparacao-valor" style="color: ${saldoAtual >= saldoPassada ? '#6fdd9c' : '#ff7b7b'};">R$ ${saldoAtual.toFixed(2)}</div>
            <div class="card-comparacao-variacao ${(saldoAtual >= saldoPassada ? 'variacao-positiva' : 'variacao-negativa')}">
                ${saldoAtual >= saldoPassada ? '↑' : '↓'} ${Math.abs(variacao).toFixed(1)}%
            </div>
        </div>
        <div class="card-comparacao">
            <div class="card-comparacao-titulo">🏆 Top Gasto</div>
            <div class="card-comparacao-valor" id="topGasto">---</div>
            <div class="card-comparacao-variacao">Este mês</div>
        </div>
    `;

    container.innerHTML = html;

    // Calcular top 3 gastos
    const gastos = transacoes.filter(t => t.data.startsWith(mesAtual)).sort((a, b) => b.valor - a.valor);
    if (gastos.length > 0) {
        document.getElementById('topGasto').textContent = gastos[0].descricao.substring(0, 15) + '...';
    }
}

// 6️⃣ METAS COM PROGRESSO
function adicionarMeta() {
    const nome = document.getElementById('nomeMeta').value.trim();
    const valor = parseFloat(document.getElementById('valorMeta').value) || 0;

    if (!nome || valor <= 0) {
        alert('⚠️ Preencha todos os campos!');
        return;
    }

    if (!metas) metas = {};
    metas[nome] = valor;
    salvarDados();
    document.getElementById('nomeMeta').value = '';
    document.getElementById('valorMeta').value = '';
    atualizarMetasProgresso();
}

function atualizarMetasProgresso() {
    const container = document.getElementById('containerMetasProgresso');
    if (!metas || Object.keys(metas).length === 0) {
        container.innerHTML = '<div class="vazio">📭 Nenhuma meta cadastrada</div>';
        return;
    }

    const mesAtual = new Date().toISOString().slice(0, 7);
    let html = '';

    Object.entries(metas).forEach(([nome, limite]) => {
        const gasto = transacoes.filter(t => t.categoria === nome && t.data.startsWith(mesAtual)).reduce((s, t) => s + t.valor, 0);
        const percentual = (gasto / limite) * 100;
        const status = percentual <= 50 ? 'green' : percentual <= 80 ? 'yellow' : 'red';
        const emoji = percentual <= 80 ? '🟢' : percentual <= 100 ? '🟡' : '🔴';
        const diasRestantes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();

        html += `<div class="objetivo-card">
            <div class="objetivo-titulo">
                <div class="objetivo-nome">${emoji} ${nome}</div>
                <div style="color: #666; font-size: 0.9em;">R$ ${gasto.toFixed(2)} / R$ ${limite.toFixed(2)}</div>
            </div>
            <div class="objetivo-barra">
                <div class="objetivo-barra-preenchida" style="width: ${Math.min(percentual, 100)}%"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85em; color: #999;">
                <span>${percentual.toFixed(0)}% usado</span>
                <span>${diasRestantes} dias restantes</span>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

// 7️⃣ RELATÓRIO AUTOMATIZADO
function gerarRelatorioPersonalizado() {
    const tipo = document.getElementById('tipoRelatorio').value;
    if (!tipo) {
        alert('⚠️ Selecione um tipo de relatório!');
        return;
    }

    const container = document.getElementById('containerRelatorio');
    const hoje = new Date();
    let periodo = '';

    if (tipo === 'mensal') {
        periodo = hoje.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    } else if (tipo === 'trimestral') {
        const trimestre = Math.ceil((hoje.getMonth() + 1) / 3);
        periodo = `${trimestre}º Trimestre de ${hoje.getFullYear()}`;
    } else {
        periodo = `Ano de ${hoje.getFullYear()}`;
    }

    const meses = getMesesPeriodo(tipo);
    const totalReceitas = receitas.filter(r => meses.some(m => r.data.startsWith(m))).reduce((s, r) => s + r.valor, 0) + rendaMensal * meses.length;
    const totalDespesas = transacoes.filter(t => meses.some(m => t.data.startsWith(m))).reduce((s, t) => s + t.valor, 0) + despesasFixas.reduce((s, d) => s + d.valor, 0) * meses.length;

    let html = `<h4 style="color: #333; margin: 15px 0;">📊 ${periodo}</h4>
        <div class="comparacao-grid">
            <div class="card-comparacao">
                <div class="card-comparacao-titulo">💰 Receitas</div>
                <div class="card-comparacao-valor" style="color: #6fdd9c;">R$ ${totalReceitas.toFixed(2)}</div>
            </div>
            <div class="card-comparacao">
                <div class="card-comparacao-titulo">📌 Despesas</div>
                <div class="card-comparacao-valor" style="color: #ff7b7b;">-R$ ${totalDespesas.toFixed(2)}</div>
            </div>
            <div class="card-comparacao">
                <div class="card-comparacao-titulo">💳 Saldo</div>
                <div class="card-comparacao-valor" style="color: ${totalReceitas - totalDespesas >= 0 ? '#6fdd9c' : '#ff7b7b'};">R$ ${(totalReceitas - totalDespesas).toFixed(2)}</div>
            </div>
            <div class="card-comparacao">
                <div class="card-comparacao-titulo">💾 Taxa Economia</div>
                <div class="card-comparacao-valor">${((((totalReceitas - totalDespesas) / totalReceitas) * 100) || 0).toFixed(1)}%</div>
            </div>
        </div>`;

    container.innerHTML = html;
}

function getMesesPeriodo(tipo) {
    const hoje = new Date();
    const meses = [];

    if (tipo === 'mensal') {
        const m = String(hoje.getMonth() + 1).padStart(2, '0');
        meses.push(`${hoje.getFullYear()}-${m}`);
    } else if (tipo === 'trimestral') {
        const trimestre = Math.ceil((hoje.getMonth() + 1) / 3);
        const mesInicio = (trimestre - 1) * 3;
        for (let i = 0; i < 3; i++) {
            const m = String(mesInicio + i + 1).padStart(2, '0');
            meses.push(`${hoje.getFullYear()}-${m}`);
        }
    } else {
        for (let i = 0; i < 12; i++) {
            const m = String(i + 1).padStart(2, '0');
            meses.push(`${hoje.getFullYear()}-${m}`);
        }
    }

    return meses;
}

function exportarRelatorioJSON() {
    const relatorio = {
        dataExportacao: new Date().toLocaleString('pt-BR'),
        transacoes,
        receitas,
        despesasFixas,
        investimentos,
        metas,
        categorias: categoriasCustom,
        config: { saldoInicial, rendaMensal }
    };

    const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    alert('✅ Relatório exportado com sucesso!');
}

// 8️⃣ DASHBOARD DE EFICIÊNCIA
function atualizarEficiencia() {
    const container = document.getElementById('containerEficiencia');
    const mesAtual = new Date().toISOString().slice(0, 7);

    const totalReceitas = receitas.filter(r => r.data.startsWith(mesAtual)).reduce((s, r) => s + r.valor, 0) + rendaMensal;
    const totalFixas = despesasFixas.reduce((s, d) => s + d.valor, 0);
    const totalVariaveis = transacoes.filter(t => t.data.startsWith(mesAtual)).reduce((s, t) => s + t.valor, 0);
    const totalInvestido = investimentos.reduce((s, i) => s + i.valor, 0);

    const percFixas = (totalFixas / totalReceitas) * 100;
    const percVariaveis = (totalVariaveis / totalReceitas) * 100;
    const percInvestimento = (totalInvestido / totalReceitas) * 100 * 0.1; // Distribuído ao longo do ano
    const percEconomia = 100 - percFixas - percVariaveis - percInvestimento;

    let html = `
        <div class="eficiencia-item">
            <div class="eficiencia-titulo">📌 Despesas Fixas</div>
            <div class="eficiencia-valor">${percFixas.toFixed(1)}%</div>
            <div class="eficiencia-barra">
                <div class="eficiencia-barra-preenchida" style="width: ${Math.min(percFixas, 100)}%"></div>
            </div>
            <div class="eficiencia-status">Ideal: <60%</div>
        </div>
        <div class="eficiencia-item">
            <div class="eficiencia-titulo">📊 Despesas Variáveis</div>
            <div class="eficiencia-valor">${percVariaveis.toFixed(1)}%</div>
            <div class="eficiencia-barra">
                <div class="eficiencia-barra-preenchida" style="width: ${Math.min(percVariaveis, 100)}%"></div>
            </div>
            <div class="eficiencia-status">Ideal: <30%</div>
        </div>
        <div class="eficiencia-item">
            <div class="eficiencia-titulo">💎 Investimentos</div>
            <div class="eficiencia-valor">${percInvestimento.toFixed(1)}%</div>
            <div class="eficiencia-barra">
                <div class="eficiencia-barra-preenchida" style="width: ${Math.min(percInvestimento, 100)}%"></div>
            </div>
            <div class="eficiencia-status">Ideal: >10%</div>
        </div>
        <div class="eficiencia-item">
            <div class="eficiencia-titulo">💾 Economia</div>
            <div class="eficiencia-valor">${Math.max(percEconomia, 0).toFixed(1)}%</div>
            <div class="eficiencia-barra">
                <div class="eficiencia-barra-preenchida" style="width: ${Math.max(percEconomia, 0)}%"></div>
            </div>
            <div class="eficiencia-status">Ideal: >20%</div>
        </div>
    `;

    container.innerHTML = html;
}

// 9️⃣ MAPA DE DESPESAS (HEATMAP)
function atualizarHeatmap() {
    const select = document.getElementById('mesSelecionadoHeatmap');
    const mes = select.value;

    if (!mes) {
        document.getElementById('containerHeatmap').innerHTML = '<p style="text-align: center; color: #999;">Selecione um mês</p>';
        return;
    }

    const container = document.getElementById('containerHeatmap');
    const [ano, mesNum] = mes.split('-');
    const diasMes = new Date(ano, mesNum, 0).getDate();
    const despesasPorDia = {};

    transacoes.filter(t => t.data.startsWith(`${ano}-${mesNum}`)).forEach(t => {
        const dia = t.data.split('-')[2];
        despesasPorDia[dia] = (despesasPorDia[dia] || 0) + t.valor;
    });

    const maxGasto = Math.max(...Object.values(despesasPorDia), 1);

    let html = '<div class="heatmap-calendar">';
    for (let dia = 1; dia <= diasMes; dia++) {
        const diaPad = String(dia).padStart(2, '0');
        const gasto = despesasPorDia[diaPad] || 0;
        const intensidade = gasto / maxGasto;
        const cor = `rgba(255, ${123 * (1 - intensidade)}, ${123 * (1 - intensidade)}, ${0.3 + intensidade * 0.7})`;

        html += `<div class="heatmap-dia" style="background: ${cor};">
            <div class="heatmap-dia-numero">${dia}</div>
            <div class="heatmap-dia-valor">${gasto > 0 ? 'R$ ' + gasto.toFixed(0) : '-'}</div>
        </div>`;
    }
    html += '</div>';

    container.innerHTML = html;
}

// 🔟 SEGMENTAÇÃO POR OBJETIVO
function adicionarObjetivo() {
    const nome = document.getElementById('nomeObjetivo').value.trim();
    const tipo = document.getElementById('tipoObjetivo').value;
    const meta = parseFloat(document.getElementById('metaObjetivo').value) || 0;

    if (!nome || !tipo || meta <= 0) {
        alert('⚠️ Preencha todos os campos!');
        return;
    }

    if (!objetivos) objetivos = [];
    objetivos.push({
        id: Date.now(),
        nome,
        tipo,
        meta,
        economizado: 0,
        dataCriacao: new Date().toISOString().split('T')[0]
    });

    localStorage.setItem(CHAVE_OBJETIVOS, JSON.stringify(objetivos));
    document.getElementById('nomeObjetivo').value = '';
    document.getElementById('tipoObjetivo').value = '';
    document.getElementById('metaObjetivo').value = '';
    atualizarObjetivos();
}

function atualizarObjetivos() {
    const container = document.getElementById('containerObjetivos');
    const objetos = JSON.parse(localStorage.getItem(CHAVE_OBJETIVOS) || '[]');

    if (objetos.length === 0) {
        container.innerHTML = '<div class="vazio">🎯 Nenhum objetivo cadastrado</div>';
        return;
    }

    let html = '';
    objetos.forEach(obj => {
        const percentual = (obj.economizado / obj.meta) * 100;
        const emojiTipo = {
            'Emergência': '🛡️',
            'Aposentadoria': '🏖️',
            'Viagem': '✈️',
            'Imóvel': '🏠',
            'Carro': '🚗',
            'Educação': '📚',
            'Outro': '💼'
        }[obj.tipo] || '🎯';

        html += `<div class="objetivo-card">
            <div class="objetivo-titulo">
                <div class="objetivo-nome">${emojiTipo} ${obj.nome}</div>
                <div class="objetivo-tipo">${obj.tipo}</div>
            </div>
            <div class="objetivo-progresso">
                <span>R$ ${obj.economizado.toFixed(2)} / R$ ${obj.meta.toFixed(2)}</span>
                <span style="color: #667eea; font-weight: bold;">${percentual.toFixed(0)}%</span>
            </div>
            <div class="objetivo-barra">
                <div class="objetivo-barra-preenchida" style="width: ${Math.min(percentual, 100)}%"></div>
            </div>
            <button class="danger" onclick="deletarObjetivo(${obj.id})" style="width: 100%; margin-top: 10px;">🗑️ Remover</button>
        </div>`;
    });

    container.innerHTML = html;
}

function deletarObjetivo(id) {
    if (confirm('Deseja remover este objetivo?')) {
        let objetos = JSON.parse(localStorage.getItem('OBJETIVOS') || '[]');
        objetos = objetos.filter(o => o.id !== id);
        localStorage.setItem('OBJETIVOS', JSON.stringify(objetos));
        atualizarObjetivos();
    }
}

// Carregar meses no heatmap
function carregarMesesHeatmap() {
    const select = document.getElementById('mesSelecionadoHeatmap');
    const hoje = new Date();

    for (let i = 11; i >= 0; i--) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const option = document.createElement('option');
        option.value = `${ano}-${mes}`;
        option.textContent = new Date(ano, d.getMonth()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        select.appendChild(option);
    }
}

// ============================================
// 🔐 FUNÇÕES DE SEGURANÇA E CONTROLE
// ============================================

/**
 * Adiciona botão de logout e status de segurança no topo da página
 */
function adicionarBotaoLogout() {
    // Criar container de segurança
    const container = document.createElement('div');
    container.id = 'segurancaContainer';
    container.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 12px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        display: flex;
        gap: 10px;
        align-items: center;
    `;
    
    // Status da sessão
    const statusSpan = document.createElement('span');
    statusSpan.id = 'statusSessao';
    statusSpan.textContent = '🔐 Sessão Ativa';
    
    // Botão de logout
    const btnLogout = document.createElement('button');
    btnLogout.innerHTML = '🚪 Logout';
    btnLogout.style.cssText = `
        background: rgba(255,255,255,0.3);
        border: 1px solid rgba(255,255,255,0.5);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s;
    `;
    btnLogout.onmouseover = () => btnLogout.style.background = 'rgba(255,255,255,0.5)';
    btnLogout.onmouseout = () => btnLogout.style.background = 'rgba(255,255,255,0.3)';
    btnLogout.onclick = () => {
        if (confirm('Tem certeza que deseja sair?\n\nSeus dados serão salvos criptografados.')) {
            fecharSessaoSegura();
            location.reload();
        }
    };
    
    container.appendChild(statusSpan);
    container.appendChild(btnLogout);
    document.body.insertBefore(container, document.body.firstChild);
    
    // Atualizar status periodicamente
    setInterval(() => {
        if (seguranca && seguranca.sessaoAtiva) {
            const status = seguranca.obterStatusSessao();
            const minutos = Math.floor(status.tempoRestante / 60);
            statusSpan.innerHTML = `🔐 Sessão (${minutos}min restante)`;
        }
    }, 30000);
}

/**
 * Valida e adiciona uma transação com segurança
 */
function adicionarTransacaoSegura(valor, descricao, data, categoria) {
    if (!seguranca || !seguranca.sessaoAtiva) {
        alert('❌ Sessão expirada. Recarregando...');
        location.reload();
        return false;
    }
    
    // 🔐 VALIDAR DADOS
    const erros = seguranca.validarTransacao(valor, descricao, data, categoria);
    if (erros.length > 0) {
        alert('❌ Erros encontrados:\n' + erros.join('\n'));
        return false;
    }
    
    // 🔐 SANITIZAR DADOS
    const novaTransacao = {
        id: Date.now(),
        valor: parseFloat(valor),
        descricao: seguranca.limparTexto(descricao),
        data: data,
        categoria: seguranca.limparTexto(categoria),
        paga: false
    };
    
    // ✅ REGISTRAR AUDITORIA
    seguranca.registrarAuditoria('TRANSACAO_ADICIONADA', {
        valor: valor,
        categoria: categoria,
        data: data
    });
    
    return novaTransacao;
}

/**
 * Sanitiza HTML para renderização segura
 */
function renderizarSeguro(template, dados) {
    let html = template;
    Object.entries(dados).forEach(([chave, valor]) => {
        const valorSanitizado = seguranca.sanitizar(String(valor));
        html = html.replace(`{{${chave}}}`, valorSanitizado);
    });
    return html;
}

/**
 * Obtém relatório de segurança e auditoria
 */
function obterRelatorioSeguranca() {
    if (!seguranca) {
        alert('❌ Segurança não inicializada');
        return;
    }
    
    const relatorio = seguranca.gerarRelatorio();
    console.log('📊 Relatório de Segurança:', relatorio);
    
    const mensagem = `
📊 RELATÓRIO DE SEGURANÇA
════════════════════════════════════════

🔐 Status da Sessão:
  • Ativa: ${relatorio.statusSessao.ativa ? '✅ Sim' : '❌ Não'}
  • Bloqueada: ${relatorio.statusSessao.bloqueada ? '⚠️ Sim' : '✅ Não'}
  • Tempo Inativo: ${relatorio.statusSessao.tempoInativo}s
  • Tempo Restante: ${Math.floor(relatorio.statusSessao.tempoRestante / 60)}min

📝 Auditoria (últimas 24h):
  • Total de ações: ${relatorio.totalAuditorias}
  • Últimas ações registradas: ${relatorio.ultimasAcoes.length}

🛡️ Proteções Ativas:
  ✅ Criptografia AES-256
  ✅ Validação de Entrada
  ✅ Sanitização XSS
  ✅ Logs de Auditoria
  ✅ Timeout de Sessão (30 min)
  ✅ Rate Limiting de Autenticação

Digite no console: seguranca.exibirAuditoria() para ver histórico completo
    `;
    
    alert(mensagem);
    return relatorio;
}

/**
 * Exporta auditoria para arquivo JSON
 */
function exportarAuditoriaApp() {
    if (!seguranca) {
        alert('❌ Segurança não inicializada');
        return;
    }
    
    seguranca.exportarAuditoria();
    alert('✅ Auditoria exportada com sucesso!');
}

/**
 * Limpa TODOS os dados (com confirmação)
 */
function limparTodosDadosApp() {
    if (!seguranca) {
        alert('❌ Segurança não inicializada');
        return;
    }
    
    if (seguranca.limparTodosDados()) {
        salvarDados();
        alert('✅ Todos os dados foram removidos');
        location.reload();
    }
}

/**
 * Exibe status da sessão no console
 */
function exibirStatusSeguranca() {
    if (seguranca) {
        seguranca.exibirStatus();
    }
}

/**
 * Muda a senha (para próxima sessão)
 */
function mudarSenha() {
    const senhaAtual = prompt('Digite sua senha atual:');
    if (!senhaAtual) return;
    
    if (!seguranca.abrirSessao(senhaAtual)) {
        alert('❌ Senha atual incorreta');
        return;
    }
    
    const novaSenha = prompt('Digite a nova senha (mínimo 4 caracteres):');
    if (!novaSenha || novaSenha.length < 4) {
        alert('❌ Nova senha inválida');
        return;
    }
    
    const confirma = prompt('Confirme a nova senha:');
    if (confirma !== novaSenha) {
        alert('❌ As senhas não coincidem');
        return;
    }
    
    // Armazenar novo hash
    const hash = seguranca.hash256(novaSenha);
    localStorage.setItem('_hash_senha', hash);
    seguranca.registrarAuditoria('SENHA_ALTERADA');
    
    alert('✅ Senha alterada com sucesso!\n\nNa próxima sessão, use a nova senha.');
}

// ============================================
// 🔐 INTEGRAÇÃO COM FUNÇÕES EXISTENTES
// ============================================

/**
 * Override da função adicionarFixa() - com segurança
 */
const adicionarFixaOriginal = adicionarFixa;
adicionarFixa = function() {
    seguranca?.atualizarAtividade();
    return adicionarFixaOriginal.call(this);
};

/**
 * Override da função adicionarVariavel() - com segurança
 */
const adicionarVariavelOriginal = adicionarVariavel;
adicionarVariavel = function() {
    seguranca?.atualizarAtividade();
    return adicionarVariavelOriginal.call(this);
};

/**
 * Override da função adicionarReceita() - com segurança
 */
const adicionarReceitaOriginal = adicionarReceita;
adicionarReceita = function() {
    seguranca?.atualizarAtividade();
    return adicionarReceitaOriginal.call(this);
};

// Função para atualizar o título da página com status
function atualizarTituloPagina() {
    if (seguranca && seguranca.sessaoAtiva) {
        const status = seguranca.obterStatusSessao();
        document.title = `🔐 Controle Financeiro - Sessão Ativa (${Math.floor(status.tempoRestante / 60)}min)`;
    }
}

// Atualizar título periodicamente
setInterval(atualizarTituloPagina, 60000);
