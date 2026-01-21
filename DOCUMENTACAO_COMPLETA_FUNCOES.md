# 📚 DOCUMENTAÇÃO COMPLETA DE FUNÇÕES

**Controle Financeiro v2.2** - Documentação de Todas as Funções

---

## 📖 Índice de Navegação

### 🔐 [Segurança (seguranca.js)](#segurança)
- Criptografia
- Validação
- Sanitização
- Armazenamento Seguro
- Auditoria
- Gerenciamento de Sessão
- Funções Globais de Segurança

### 💼 [Aplicação (script.js)](#aplicação)
- Gerenciamento de Dados
- Transações Fixas e Variáveis
- Receitas e Investimentos
- Metas e Objetivos
- Gráficos e Relatórios
- Segurança e Backup

---

# 🔐 SEGURANÇA

## Classe: GerenciadorSeguranca

### Criptografia

#### `criptografar(dados)`
**Criptografa dados sensíveis com AES-256**

```javascript
// Assinatura
criptografar(dados: any): string

// Parâmetros
- dados: any → Dados a criptografar (objeto, string, número, etc)

// Retorno
string → Dados criptografados em Base64 ou null se erro

// Exemplo
const dados = { nome: "João", valor: 1000 };
const criptografado = seguranca.criptografar(dados);
// Resultado: "U2FsdGVkX1..." (Base64 criptografado)
```

---

#### `descriptografar(dadosCriptografados)`
**Descriptografa dados criptografados com AES-256**

```javascript
// Assinatura
descriptografar(dadosCriptografados: string): any

// Parâmetros
- dadosCriptografados: string → Dados criptografados em Base64

// Retorno
any → Dados originais descriptografados ou null

// Exemplo
const criptografado = "U2FsdGVkX1...";
const dados = seguranca.descriptografar(criptografado);
// Resultado: { nome: "João", valor: 1000 }
```

---

#### `hash256(texto)`
**Cria hash SHA-256 (não reversível, ideal para senhas)**

```javascript
// Assinatura
hash256(texto: string): string

// Parâmetros
- texto: string → Texto a fazer hash

// Retorno
string → Hash SHA-256

// Exemplo
const senha = "minha_senha_123";
const hash = seguranca.hash256(senha);
// Resultado: "a1b2c3d4e5f6..." (hash SHA-256)
```

---

### Validação

#### `validarTransacao(valor, descricao, data, categoria)`
**Valida uma transação completa**

```javascript
// Assinatura
validarTransacao(valor: number, descricao: string, data: string, categoria: string): string[]

// Parâmetros
- valor: number → Valor em R$
- descricao: string → Texto descritivo (3-200 caracteres)
- data: string → Data ISO (YYYY-MM-DD, não futura)
- categoria: string → Nome da categoria

// Retorno
string[] → Array de erros (vazio se válido)

// Exemplo
const erros = seguranca.validarTransacao(150.50, "Supermercado", "2026-01-20", "Alimentação");
if (erros.length === 0) {
    console.log("✅ Transação válida!");
} else {
    console.log("❌ Erros:", erros);
}
```

---

#### `validarValor(valor)`
**Valida um valor monetário**

```javascript
// Assinatura
validarValor(valor: number): boolean

// Parâmetros
- valor: number → Valor a validar

// Retorno
boolean → true se 0 < valor ≤ 999.999.999

// Exemplo
seguranca.validarValor(150.50);  // true
seguranca.validarValor(-10);     // false
seguranca.validarValor(0);       // false
```

---

#### `validarData(data)`
**Valida uma data em formato ISO**

```javascript
// Assinatura
validarData(data: string): boolean

// Parâmetros
- data: string → Data ISO (YYYY-MM-DD)

// Retorno
boolean → true se data válida e não futura

// Exemplo
seguranca.validarData("2026-01-20");  // true (passado/presente)
seguranca.validarData("2026-12-31");  // false (futuro)
seguranca.validarData("invalid");     // false
```

---

#### `validarDescricao(texto)`
**Valida texto de descrição**

```javascript
// Assinatura
validarDescricao(texto: string): boolean

// Parâmetros
- texto: string → Texto a validar

// Retorno
boolean → true se 3 ≤ comprimento ≤ 200

// Exemplo
seguranca.validarDescricao("Compra no supermercado");  // true
seguranca.validarDescricao("ab");                      // false (muito curto)
```

---

#### `validarEmail(email)`
**Valida um endereço de email**

```javascript
// Assinatura
validarEmail(email: string): boolean

// Parâmetros
- email: string → Email a validar

// Retorno
boolean → true se formato válido

// Exemplo
seguranca.validarEmail("usuario@gmail.com");  // true
seguranca.validarEmail("email_invalido");     // false
```

---

### Sanitização

#### `sanitizar(texto)`
**Escapa caracteres HTML para evitar XSS**

```javascript
// Assinatura
sanitizar(texto: string): string

// Parâmetros
- texto: string → Texto a sanitizar

// Retorno
string → Texto seguro para HTML

// Exemplo
const perigoso = "<script>alert('hack')</script>";
const seguro = seguranca.sanitizar(perigoso);
// Resultado: "&lt;script&gt;alert('hack')&lt;/script&gt;"
```

---

#### `limparTexto(texto)`
**Remove caracteres perigosos e HTML**

```javascript
// Assinatura
limparTexto(texto: string): string

// Parâmetros
- texto: string → Texto a limpar

// Retorno
string → Texto limpo

// Exemplo
const texto = "  <b>Texto</b>  \x00\x01 ";
const limpo = seguranca.limparTexto(texto);
// Resultado: "Texto"
```

---

### Armazenamento Seguro

#### `salvarSeguro(chave, dados)`
**Salva dados criptografados no localStorage**

```javascript
// Assinatura
salvarSeguro(chave: string, dados: any): boolean

// Parâmetros
- chave: string → Chave do localStorage
- dados: any → Dados a salvar

// Retorno
boolean → true se sucesso

// Exemplo
const transacoes = [{ id: 1, valor: 100, data: "2026-01-20" }];
seguranca.salvarSeguro('transacoes_financeiras', transacoes);
// ✅ Dados salvos criptografados

// Internamente:
// 1. JSON.stringify(dados)
// 2. CryptoJS.AES.encrypt() com CHAVE_CRIPTOGRAFIA
// 3. localStorage.setItem()
// 4. Auditoria registrada
```

---

#### `carregarSeguro(chave)`
**Carrega dados descriptografados do localStorage**

```javascript
// Assinatura
carregarSeguro(chave: string): any

// Parâmetros
- chave: string → Chave do localStorage

// Retorno
any → Dados descriptografados ou null

// Exemplo
const transacoes = seguranca.carregarSeguro('transacoes_financeiras');
if (transacoes) {
    console.log("Transações carregadas:", transacoes);
} else {
    console.log("Nenhuma transação salva");
}
```

---

#### `limparSeguro(chave)`
**Remove dados do localStorage de forma segura**

```javascript
// Assinatura
limparSeguro(chave: string): void

// Parâmetros
- chave: string → Chave a remover

// Exemplo
seguranca.limparSeguro('transacoes_financeiras');
// localStorage.removeItem() e auditoria registrada
```

---

### Auditoria

#### `registrarAuditoria(acao, detalhes)`
**Registra ação na auditoria (máximo 500 entradas)**

```javascript
// Assinatura
registrarAuditoria(acao: string, detalhes?: object): void

// Parâmetros
- acao: string → Nome da ação (ex: "LOGIN", "DADOS_SALVOS")
- detalhes: object → Informações adicionais

// Exemplo
seguranca.registrarAuditoria('TRANSACAO_ADICIONADA', {
    valor: 150.50,
    categoria: 'Alimentação',
    timestamp: Date.now()
});

// Log armazenado:
// {
//   acao: 'TRANSACAO_ADICIONADA',
//   timestamp: 1234567890,
//   detalhes: { valor: 150.50, ... }
// }
```

---

#### `obterAuditoria(filtro)`
**Retorna logs de auditoria com filtro opcional**

```javascript
// Assinatura
obterAuditoria(filtro?: string): object[]

// Parâmetros
- filtro: string (opcional) → Filtrar por ação

// Retorno
object[] → Array de logs

// Exemplo
// Todos os logs
const todosLogs = seguranca.obterAuditoria();

// Apenas logins
const loginsApenas = seguranca.obterAuditoria('LOGIN');

// Resultado:
// [
//   { acao: "LOGIN", timestamp: 1234567890, detalhes: {...} },
//   { acao: "DADOS_SALVOS", timestamp: 1234567891, detalhes: {...} }
// ]
```

---

#### `exportarAuditoria()`
**Exporta auditoria como arquivo JSON**

```javascript
// Assinatura
exportarAuditoria(): void

// Retorno
void (faz download de arquivo)

// Exemplo
seguranca.exportarAuditoria();
// ✅ Download: auditoria_2026-01-20.json

// Arquivo contém:
// [
//   { acao: "LOGIN", timestamp: ..., detalhes: {...} },
//   { acao: "DADOS_SALVOS", timestamp: ..., detalhes: {...} },
//   ...
// ]
```

---

### Gerenciamento de Sessão

#### `abrirSessao(senha)`
**Abre sessão de usuário (valida senha)**

```javascript
// Assinatura
abrirSessao(senha: string): boolean

// Parâmetros
- senha: string → Senha do usuário

// Retorno
boolean → true se login bem-sucedido

// Exemplo
const sucesso = seguranca.abrirSessao("minha_senha_123");
if (sucesso) {
    console.log("✅ Sessão aberta!");
} else {
    console.log("❌ Senha incorreta!");
}

// Proteções:
// - Máximo 3 tentativas
// - Bloqueio por 15 minutos após 3 falhas
// - Hash SHA-256 para comparação
```

---

#### `fecharSessao()`
**Encerra sessão do usuário**

```javascript
// Assinatura
fecharSessao(): void

// Exemplo
seguranca.fecharSessao();
// ✅ Sessão encerrada
// - sessaoAtiva = false
// - Timer parado
// - Auditoria registrada
```

---

#### `iniciarMonitorSessao()`
**Monitora inatividade (auto-logout após 30 min)**

```javascript
// Assinatura
iniciarMonitorSessao(): void

// Comportamento
- Escuta mouse, teclado, toque
- Reseta timeout a cada atividade
- Auto-logout após 30 minutos de inatividade
- Aviso no title do navegador

// Exemplo
seguranca.iniciarMonitorSessao();
// Monitor ativo até fecharSessao()
```

---

#### `atualizarAtividade()`
**Atualiza timestamp da última atividade**

```javascript
// Assinatura
atualizarAtividade(): void

// Exemplo
seguranca.atualizarAtividade();
// Reseta contador de inatividade
```

---

#### `obterStatusSessao()`
**Retorna status atual da sessão**

```javascript
// Assinatura
obterStatusSessao(): object

// Retorno
object → Status com: sessaoAtiva, tempoInatividade, etc

// Exemplo
const status = seguranca.obterStatusSessao();
console.log(status);
// Resultado:
// {
//   sessaoAtiva: true,
//   ultimaAtividade: 1234567890,
//   tempoExpiracao: "00:15:30"
// }
```

---

#### `exibirStatus()`
**Exibe status da sessão no console**

```javascript
// Assinatura
exibirStatus(): void

// Exemplo
seguranca.exibirStatus();
// Console:
// 📊 Status da Sessão:
// Ativa: true
// Tempo Restante: 25 min 30 seg
```

---

#### `gerarRelatorio()`
**Gera relatório completo de segurança**

```javascript
// Assinatura
gerarRelatorio(): object

// Retorno
object → Relatório com estatísticas

// Exemplo
const relatorio = seguranca.gerarRelatorio();
console.log(relatorio);
// {
//   tempoSessao: "05:30:00",
//   acoesRegistradas: 156,
//   ultimaAcao: "DADOS_SALVOS",
//   tentativasLogin: 1,
//   ...
// }
```

---

### Funções Globais de Segurança

#### `inicializarSeguranca()`
**Inicializa o gerenciador de segurança**

```javascript
// Assinatura
inicializarSeguranca(): void

// Exemplo
inicializarSeguranca();
// ✅ GerenciadorSeguranca criado
// ✅ Armazena em: let seguranca = new GerenciadorSeguranca()

// Chamada automática em DOMContentLoaded
```

---

#### `abrirSessaoSegura()`
**Abre sessão com prompt de senha**

```javascript
// Assinatura
abrirSessaoSegura(): boolean

// Retorno
boolean → true se sessão aberta

// Exemplo
const sessao = abrirSessaoSegura();
if (sessao) {
    console.log("✅ Acesso concedido!");
} else {
    console.log("❌ Acesso negado!");
}

// Comportamento:
// 1. Prompt para senha
// 2. Se primeira vez: salva hash
// 3. Se repetida: compara com hash
// 4. Inicia monitor de sessão
```

---

#### `fecharSessaoSegura()`
**Fecha sessão segura**

```javascript
// Assinatura
fecharSessaoSegura(): void

// Exemplo
fecharSessaoSegura();
// ✅ Sessão encerrada
// ✅ Redirecionado para login
```

---

---

# 💼 APLICAÇÃO

## Gerenciamento de Dados

### `obterDataHoje()`
**Retorna data de hoje em formato ISO**

```javascript
// Assinatura
obterDataHoje(): string

// Retorno
string → YYYY-MM-DD (ex: "2026-01-20")

// Exemplo
const hoje = obterDataHoje();
console.log(hoje);  // "2026-01-20"
```

---

### `preencherDataAtual()`
**Preenche campo de data com data de hoje**

```javascript
// Assinatura
preencherDataAtual(): void

// Afeta
#data → Campo input[type="date"]

// Exemplo
preencherDataAtual();
// Seta automaticamente a data do campo
```

---

### `definirDataAtual()`
**Define data atual no campo de receita**

```javascript
// Assinatura
definirDataAtual(): void

// Afeta
#dataReceita → Campo input[type="date"]

// Exemplo
definirDataAtual();
// Seta automaticamente a data do campo de receita
```

---

### `salvarDados()`
**Salva todos os dados no localStorage (criptografado)**

```javascript
// Assinatura
salvarDados(): void

// Salva
- transacoes (variáveis)
- despesasFixas
- metas
- categoriasCustom
- receitas
- investimentos
- configurações (saldoInicial, rendaMensal)

// Exemplo
salvarDados();
// ✅ Todos os dados salvos criptografados

// Internamente:
// seguranca.salvarSeguro() para cada chave
```

---

### `carregarDados()`
**Carrega todos os dados do localStorage (descriptografado)**

```javascript
// Assinatura
carregarDados(): void

// Carrega
- Todas as chaves criptografadas
- Descriptografa automaticamente
- Preenche variáveis globais

// Exemplo
carregarDados();
// ✅ Dados carregados e prontos
```

---

## Categorias

### `obterTodasCategorias()`
**Retorna categorias padrão + customizadas**

```javascript
// Assinatura
obterTodasCategorias(): object[]

// Retorno
object[] → Array com todas as categorias

// Exemplo
const categorias = obterTodasCategorias();
// [
//   { nome: "Alimentação", emoji: "🍔" },
//   { nome: "Transporte", emoji: "🚗" },
//   { nome: "Minha Categoria", emoji: "⭐" }
// ]
```

---

### `classificarCategoria(descricao)`
**Classifica transação automaticamente por descrição**

```javascript
// Assinatura
classificarCategoria(descricao: string): string

// Parâmetros
- descricao: string → Texto descritivo

// Retorno
string → Nome da categoria detectada

// Exemplo
classificarCategoria("Supermercado Carrefour");
// Resultado: "Alimentação"

classificarCategoria("Uber para trabalho");
// Resultado: "Transporte"

classificarCategoria("Netflix");
// Resultado: "Lazer"

// Palavras-chave usadas:
// - Alimentação: supermercado, padaria, restaurante, etc
// - Transporte: uber, taxi, gasolina, etc
// - Saúde: farmácia, médico, hospital, etc
// - Educação: escola, curso, livro, etc
// - Lazer: cinema, netflix, spotify, etc
// - Utilities: energia, água, internet, etc
```

---

### `atualizarSelectCategorias()`
**Atualiza dropdowns de categoria em toda a página**

```javascript
// Assinatura
atualizarSelectCategorias(): void

// Afeta
#categoria → Select principal
#filtroCategoria → Select de filtro

// Exemplo
atualizarSelectCategorias();
// Preenche ambos os selects com todas as categorias
```

---

### `adicionarCategoria()`
**Adiciona nova categoria customizada**

```javascript
// Assinatura
adicionarCategoria(): void

// Lê de
#novaCategoria → Nome da categoria
#novaEmojiCategoria → Emoji

// Exemplo
// HTML: <input id="novaCategoria" value="Saúde Pet">
//       <input id="novaEmojiCategoria" value="🐕">
adicionarCategoria();
// ✅ Categoria adicionada: { nome: "Saúde Pet", emoji: "🐕" }
```

---

### `deletarCategoria(nome)`
**Remove categoria customizada**

```javascript
// Assinatura
deletarCategoria(nome: string): void

// Parâmetros
- nome: string → Nome da categoria a deletar

// Exemplo
deletarCategoria("Saúde Pet");
// ✅ Categoria removida

// Nota: Não remove categorias padrão
```

---

### `atualizarCateoriasUI()`
**Atualiza lista de categorias na UI**

```javascript
// Assinatura
atualizarCateoriasUI(): void

// Afeta
#categoriasContainer → Display das categorias

// Exemplo
atualizarCateoriasUI();
// Renderiza todas as categorias customizadas
```

---

### `obterGastoMesAtual(categoria)`
**Calcula gasto total da categoria no mês**

```javascript
// Assinatura
obterGastoMesAtual(categoria: string): number

// Parâmetros
- categoria: string → Nome da categoria

// Retorno
number → Total em R$

// Exemplo
const gastoAlimentacao = obterGastoMesAtual("Alimentação");
console.log(gastoAlimentacao);  // 1250.50
```

---

## Backup e Restauração

### `fazarBackup()`
**Faz download de backup completo dos dados**

```javascript
// Assinatura
fazarBackup(): void

// Faz Download
backup_YYYY-MM-DD.json → Arquivo JSON com todos os dados

// Exemplo
fazarBackup();
// ✅ Download iniciado: backup_2026-01-20.json

// Arquivo contém:
// {
//   transacoes: [...],
//   despesasFixas: [...],
//   metas: {...},
//   categoriasCustom: [...],
//   receitas: [...],
//   investimentos: [...],
//   config: {...}
// }
```

---

### `restaurarBackup(event)`
**Restaura dados de arquivo de backup**

```javascript
// Assinatura
restaurarBackup(event: Event): void

// Parâmetros
- event: Event → Evento do input file

// Exemplo
// HTML: <input type="file" id="inputBackup" onchange="restaurarBackup(event)">
// Usuário seleciona arquivo backup_*.json
// ✅ Dados restaurados
// ✅ Página recarregada
```

---

### `sincronizarNuvem()`
**Sincronização com nuvem (placeholder)**

```javascript
// Assinatura
sincronizarNuvem(): void

// Status
Implementado como estrutura base
Pronto para integração com serviços (Google Drive, OneDrive, etc)

// Exemplo
sincronizarNuvem();
// 🔄 Sincronizando dados...
```

---

## Transações - Despesas Fixas

### `adicionarFixa()`
**Adiciona nova despesa fixa**

```javascript
// Assinatura
adicionarFixa(): void

// Lê de
#descricaoFixa → Descrição
#valorFixa → Valor
#dataFixa → Data
#categoria → Categoria

// Validações
- Valor > 0
- Descrição válida
- Data não futura
- Categoria selecionada

// Exemplo
// HTML: Preenchido com:
// Descrição: "Aluguel"
// Valor: 1500
// Data: 2026-01-20
// Categoria: Habitação
adicionarFixa();
// ✅ Despesa fixa adicionada
```

---

### `deletarFixa(id)`
**Remove despesa fixa**

```javascript
// Assinatura
deletarFixa(id: string): void

// Parâmetros
- id: string → ID da despesa

// Exemplo
deletarFixa("fix_123");
// ✅ Despesa removida
```

---

### `marcarPagaFixa(id)`
**Marca despesa fixa como paga**

```javascript
// Assinatura
marcarPagaFixa(id: string): void

// Parâmetros
- id: string → ID da despesa

// Exemplo
marcarPagaFixa("fix_123");
// ✅ Marcada como paga
// Visual muda (strikethrough)
```

---

### `atualizarTabelaFixas()`
**Renderiza tabela de despesas fixas**

```javascript
// Assinatura
atualizarTabelaFixas(): void

// Afeta
#tabelaFixas → Tabela HTML

// Exemplo
atualizarTabelaFixas();
// Renderiza todas as despesas fixas com:
// - Descrição
// - Valor
// - Data
// - Status (Paga/Pendente)
// - Ações (Deletar, Marcar como Paga)
```

---

## Transações - Despesas Variáveis

### `adicionarVariavel()`
**Adiciona nova despesa variável**

```javascript
// Assinatura
adicionarVariavel(): void

// Lê de
#descricao → Descrição
#valor → Valor
#data → Data
#categoria → Categoria

// Validações
- Mesmas que adicionarFixa()
- Auto-classifica categoria se vazia

// Exemplo
adicionarVariavel();
// ✅ Despesa variável adicionada
```

---

### `deletarVariavel(id)`
**Remove despesa variável**

```javascript
// Assinatura
deletarVariavel(id: string): void

// Parâmetros
- id: string → ID da transação

// Exemplo
deletarVariavel("var_456");
// ✅ Transação removida
```

---

### `marcarPagaVariavel(id)`
**Marca despesa variável como paga**

```javascript
// Assinatura
marcarPagaVariavel(id: string): void

// Parâmetros
- id: string → ID da transação

// Exemplo
marcarPagaVariavel("var_456");
// ✅ Status alterado
```

---

### `atualizarTabelaVariaveis()`
**Renderiza tabela de despesas variáveis**

```javascript
// Assinatura
atualizarTabelaVariaveis(): void

// Afeta
#tabelaVariaveis → Tabela HTML

// Exemplo
atualizarTabelaVariaveis();
// Renderiza todas as despesas variáveis
```

---

## Receitas

### `adicionarReceita()`
**Adiciona nova receita**

```javascript
// Assinatura
adicionarReceita(): void

// Lê de
#descricaoReceita → Descrição
#valorReceita → Valor
#dataReceita → Data
#categoriaReceita → Categoria

// Exemplo
adicionarReceita();
// ✅ Receita adicionada

// Valores típicos:
// - Salário
// - Freelance
// - Venda de produtos
// - Investimentos
```

---

### `deletarReceita(id)`
**Remove receita**

```javascript
// Assinatura
deletarReceita(id: string): void

// Parâmetros
- id: string → ID da receita

// Exemplo
deletarReceita("rec_789");
// ✅ Receita removida
```

---

### `atualizarTabelaReceitas()`
**Renderiza tabela de receitas**

```javascript
// Assinatura
atualizarTabelaReceitas(): void

// Afeta
#tabelaReceitas → Tabela HTML

// Exemplo
atualizarTabelaReceitas();
// Renderiza todas as receitas
```

---

## Investimentos

### `adicionarInvestimento()`
**Adiciona novo investimento**

```javascript
// Assinatura
adicionarInvestimento(): void

// Lê de
#descricaoInvest → Descrição
#valorInvest → Valor inicial
#dataInvest → Data
#tipoInvest → Tipo (Ação, Fundo, Criptmoeda, etc)

// Exemplo
adicionarInvestimento();
// ✅ Investimento adicionado

// Tipos suportados:
// - Ação
// - Fundo
// - Criptmoeda
// - Imóvel
// - Outro
```

---

### `deletarInvestimento(id)`
**Remove investimento**

```javascript
// Assinatura
deletarInvestimento(id: string): void

// Parâmetros
- id: string → ID do investimento

// Exemplo
deletarInvestimento("inv_101");
// ✅ Investimento removido
```

---

### `obterCorInvestimento(tipo)`
**Retorna cor associada ao tipo de investimento**

```javascript
// Assinatura
obterCorInvestimento(tipo: string): string

// Parâmetros
- tipo: string → Tipo de investimento

// Retorno
string → Cor em formato hexadecimal

// Cores
- Ação: #FF6B6B (vermelho)
- Fundo: #4ECDC4 (turquesa)
- Criptmoeda: #FFE66D (amarelo)
- Imóvel: #95E1D3 (verde claro)
- Outro: #C7CEEA (roxo)

// Exemplo
const cor = obterCorInvestimento("Criptmoeda");
// Resultado: "#FFE66D"
```

---

### `atualizarTabelaInvestimentos()`
**Renderiza tabela de investimentos**

```javascript
// Assinatura
atualizarTabelaInvestimentos(): void

// Afeta
#tabelaInvestimentos → Tabela HTML

// Exemplo
atualizarTabelaInvestimentos();
// Renderiza todos os investimentos
```

---

### `atualizarResumoInvestimentos()`
**Atualiza resumo de investimentos**

```javascript
// Assinatura
atualizarResumoInvestimentos(): void

// Calcula
- Total investido
- Valor atual
- Rentabilidade por tipo

// Exemplo
atualizarResumoInvestimentos();
// Exibe resumo no dashboard
```

---

### `atualizarGraficoInvestimentos()`
**Atualiza gráfico de investimentos**

```javascript
// Assinatura
atualizarGraficoInvestimentos(): void

// Tipo
Gráfico Pizza (distribuição por tipo)

// Exemplo
atualizarGraficoInvestimentos();
// Renderiza gráfico com Chart.js
```

---

## Metas

### `adicionarMeta()`
**Adiciona nova meta financeira**

```javascript
// Assinatura
adicionarMeta(): void

// Lê de
#nomeMeta → Nome da meta
#valorMeta → Valor alvo
#categoriaMeta → Categoria

// Exemplo
adicionarMeta();
// ✅ Meta adicionada

// Exemplos de metas:
// - Economizar R$5.000
// - Reduzir despesas em 20%
// - Investir R$10.000
```

---

### `atualizarMetasProgresso()`
**Atualiza progresso de metas**

```javascript
// Assinatura
atualizarMetasProgresso(): void

// Calcula
- Percentual de progresso
- Valor economizado vs. meta
- Status (em dia, atrasada, concluída)

// Exemplo
atualizarMetasProgresso();
// Renderiza barra de progresso
```

---

## Objetivos

### `adicionarObjetivo()`
**Adiciona novo objetivo financeiro**

```javascript
// Assinatura
adicionarObjetivo(): void

// Lê de
#nomeObjetivo → Nome do objetivo
#valorObjetivo → Valor total
#prazoBjetivo → Meses para atingir

// Exemplo
adicionarObjetivo();
// ✅ Objetivo adicionado

// Exemplos:
// - Viagem (R$5.000 em 6 meses)
// - Carro novo (R$30.000 em 12 meses)
// - Casa própria (R$200.000 em 24 meses)
```

---

### `atualizarObjetivos()`
**Renderiza lista de objetivos com progresso**

```javascript
// Assinatura
atualizarObjetivos(): void

// Afeta
#objetivosContainer → Lista HTML

// Exemplo
atualizarObjetivos();
// Exibe cada objetivo com:
// - Nome
// - Valor total
// - Valor economizado
// - Percentual de progresso
// - Data prevista
```

---

### `deletarObjetivo(id)`
**Remove objetivo**

```javascript
// Assinatura
deletarObjetivo(id: string): void

// Parâmetros
- id: string → ID do objetivo

// Exemplo
deletarObjetivo("obj_202");
// ✅ Objetivo removido
```

---

## Gráficos e Análises

### `atualizarGraficos()`
**Atualiza todos os gráficos da página**

```javascript
// Assinatura
atualizarGraficos(): void

// Atualiza
- Gráfico de gastos (barras)
- Gráfico de categorias (pizza)
- Gráfico de metas (progresso)
- Evolução de saldo (linha)

// Exemplo
atualizarGraficos();
// Todos os gráficos recarregados com dados atuais
```

---

### `atualizarGraficoGastos()`
**Gráfico de gastos mensais**

```javascript
// Assinatura
atualizarGraficoGastos(): void

// Tipo
Gráfico de Barras (gastos por mês)

// Afeta
#graficoGastos → Canvas Chart.js

// Exemplo
atualizarGraficoGastos();
// Renderiza últimos 12 meses de gastos
```

---

### `atualizarGraficoCategoria()`
**Gráfico de gastos por categoria**

```javascript
// Assinatura
atualizarGraficoCategoria(): void

// Tipo
Gráfico Pizza (distribuição por categoria)

// Afeta
#graficoCategoria → Canvas Chart.js

// Exemplo
atualizarGraficoCategoria();
// Renderiza % de gastos em cada categoria
```

---

### `atualizarGraficoMetas()`
**Gráfico de progresso de metas**

```javascript
// Assinatura
atualizarGraficoMetas(): void

// Tipo
Gráfico de Barras Horizontal (progresso)

// Afeta
#graficoMetas → Canvas Chart.js

// Exemplo
atualizarGraficoMetas();
// Renderiza barra de progresso para cada meta
```

---

### `atualizarGraficoEvolucaoSaldo()`
**Gráfico da evolução do saldo**

```javascript
// Assinatura
atualizarGraficoEvolucaoSaldo(): void

// Tipo
Gráfico de Linha (saldo ao longo do tempo)

// Afeta
#graficoSaldo → Canvas Chart.js

// Exemplo
atualizarGraficoEvolucaoSaldo();
// Mostra como saldo evoluiu mês a mês
```

---

### `atualizarHeatmap()`
**Mapa de calor de gastos por dia**

```javascript
// Assinatura
atualizarHeatmap(): void

// Tipo
Heatmap customizado (cores = intensidade)

// Cores
- Verde claro: gastos baixos
- Amarelo: gastos médios
- Vermelho: gastos altos

// Exemplo
atualizarHeatmap();
// Mostra padrões de gasto por dia da semana
```

---

## Relatórios

### `gerarResumoMensal()`
**Gera resumo completo do mês**

```javascript
// Assinatura
gerarResumoMensal(): void

// Conteúdo
- Total de receitas
- Total de despesas fixas
- Total de despesas variáveis
- Saldo do mês
- Categorias top 3
- Metas realizadas

// Exemplo
gerarResumoMensal();
// Renderiza em container específico
```

---

### `gerarRelatorioPDF()`
**Gera relatório em PDF para download**

```javascript
// Assinatura
gerarRelatorioPDF(): void

// Faz Download
relatorio_YYYY-MM.pdf → Documento PDF

// Conteúdo
- Resumo mensal
- Gráficos
- Tabelas
- Recomendações

// Exemplo
gerarRelatorioPDF();
// ✅ Download: relatorio_2026-01.pdf
```

---

### `gerarRelatorioPersonalizado()`
**Gera relatório customizado por período**

```javascript
// Assinatura
gerarRelatorioPersonalizado(): void

// Lê de
#periodoRelatorio → Período (Mês, Trimestre, Ano, Custom)

// Exemplo
// Selecionar período "Último Trimestre"
gerarRelatorioPersonalizado();
// Renderiza relatório customizado
```

---

### `exportarRelatorioJSON()`
**Exporta dados de relatório como JSON**

```javascript
// Assinatura
exportarRelatorioJSON(): void

// Faz Download
relatorio_dados.json → Arquivo JSON

// Exemplo
exportarRelatorioJSON();
// ✅ Download iniciado
```

---

### `exportarCSV()`
**Exporta transações como CSV**

```javascript
// Assinatura
exportarCSV(): void

// Faz Download
transacoes.csv → Arquivo CSV (Excel)

// Colunas
- Data
- Descrição
- Categoria
- Valor
- Tipo

// Exemplo
exportarCSV();
// ✅ Download: transacoes.csv
```

---

## Filtros e Análises

### `filtrarPorPeriodo()`
**Filtra transações por período**

```javascript
// Assinatura
filtrarPorPeriodo(): void

// Lê de
#filtroData → Data inicial
#filtroDataFim → Data final

// Afeta
Renderização das tabelas

// Exemplo
// Selecionar: 01/01/2026 a 31/01/2026
filtrarPorPeriodo();
// ✅ Tabelas filtradas para janeiro
```

---

### `limparFiltro()`
**Remove filtros e exibe todos os dados**

```javascript
// Assinatura
limparFiltro(): void

// Exemplo
limparFiltro();
// ✅ Filtros removidos, exibindo tudo
```

---

### `atualizarComparativo()`
**Comparativo de gastos (este mês vs. mês anterior)**

```javascript
// Assinatura
atualizarComparativo(): void

// Calcula
- Diferença de gastos
- % de variação
- Categorias que aumentaram

// Exemplo
atualizarComparativo();
// Renderiza comparação interativa
```

---

### `gerarAlertas()`
**Gera alertas de gastos altos**

```javascript
// Assinatura
gerarAlertas(): void

// Verifica
- Gastos acima da meta
- Categorias com gastos altos
- Despesas não pagas

// Exemplo
gerarAlertas();
// ⚠️ Alertas renderizados

// Exemplo de alerta:
// "⚠️ Alimentação atingiu 120% da meta!"
```

---

### `gerarPrevisao()`
**Prevê gastos para os próximos meses**

```javascript
// Assinatura
gerarPrevisao(): void

// Usa
- Histórico de gastos
- Padrões de consumo
- Despesas fixas conhecidas

// Exemplo
gerarPrevisao();
// Renderiza previsão para próximos 3 meses
```

---

### `gerarPrevisaoCaixa()`
**Prevê saldo de caixa futuro**

```javascript
// Assinatura
gerarPrevisaoCaixa(): void

// Calcula
- Saldo estimado para cada mês
- Comportamento baseado em histórico

// Exemplo
gerarPrevisaoCaixa();
// "Seu saldo em março será ~R$5.000"
```

---

## Análises Inteligentes

### `calcularSaudefinanceira()`
**Calcula score de saúde financeira**

```javascript
// Assinatura
atualizarSaudeFinanceira(): void

// Critérios
- Razão despesa/receita
- Emergência (3-6 meses)
- Diversificação
- Crescimento de saldo

// Score
0-20: 🔴 Crítico
21-40: 🟠 Ruim
41-60: 🟡 Aceitável
61-80: 🟢 Bom
81-100: 🟢🟢 Excelente

// Exemplo
atualizarSaudeFinanceira();
// "Sua saúde financeira: 75/100 🟢"
```

---

### `gerarAlertasInteligentes()`
**Alertas baseados em IA simples**

```javascript
// Assinatura
gerarAlertasInteligentes(): void

// Tipos de alerta
- Meta próxima de ser atingida
- Padrão de gasto anormal
- Oportunidade de economia
- Despesa recorrente não paga

// Exemplo
gerarAlertasInteligentes();
// "💡 Você gasta mais com alimentação na sexta!"
```

---

### `gerarRecomendacoes()`
**Recomendações financeiras personalizadas**

```javascript
// Assinatura
gerarRecomendacoes(): void

// Baseado em
- Padrões de gasto
- Metas estabelecidas
- Histórico de comportamento

// Exemplo
gerarRecomendacoes();
// "Sugestão: Reduza gastos com lazer em 15%"
```

---

### `gerarComparativoVoce()`
**Compara seu gasto com média de usuários**

```javascript
// Assinatura
gerarComparativoVoce(): void

// Mostra
- Você vs. média
- Você vs. economizadores
- Seu melhor mês

// Exemplo
gerarComparativoVoce();
// "Você gasta 30% menos com transporte"
```

---

## Segurança na Aplicação

### `adicionarBotaoLogout()`
**Adiciona botão de logout na página**

```javascript
// Assinatura
adicionarBotaoLogout(): void

// Cria
Botão fixo "🚪 Logout" no canto superior direito

// Exemplo
adicionarBotaoLogout();
// ✅ Botão adicionado e funcional
```

---

### `adicionarTransacaoSegura(valor, descricao, data, categoria)`
**Adiciona transação com validação completa**

```javascript
// Assinatura
adicionarTransacaoSegura(valor: number, descricao: string, data: string, categoria: string): boolean

// Parâmetros
- valor: number
- descricao: string
- data: string (ISO)
- categoria: string

// Retorno
boolean → true se sucesso

// Exemplo
const sucesso = adicionarTransacaoSegura(150.50, "Supermercado", "2026-01-20", "Alimentação");
if (sucesso) {
    console.log("✅ Transação segura adicionada!");
} else {
    console.log("❌ Validação falhou");
}
```

---

### `renderizarSeguro(template, dados)`
**Renderiza HTML de forma segura (sanitizado)**

```javascript
// Assinatura
renderizarSeguro(template: string, dados: object): string

// Parâmetros
- template: string → Template HTML
- dados: object → Dados a interpolados

// Retorno
string → HTML seguro (sanitizado)

// Exemplo
const html = renderizarSeguro(
    '<div>{{nome}} gastou R$ {{valor}}</div>',
    { nome: 'João', valor: 100 }
);
// Resultado: '<div>João gastou R$ 100</div>'
// Caracteres perigosos são escapados
```

---

### `obterRelatorioSeguranca()`
**Retorna relatório completo de segurança**

```javascript
// Assinatura
obterRelatorioSeguranca(): object

// Retorno
object → Relatório com:
- Sessão ativa
- Último login
- Tentativas de acesso
- Ações registradas
- Alertas de segurança

// Exemplo
const relatorio = obterRelatorioSeguranca();
console.log(relatorio);
// {
//   sessaoAtiva: true,
//   ultimoLogin: "2026-01-20 10:30:00",
//   tentativas: 1,
//   acoesRegistradas: 156,
//   alertas: []
// }
```

---

### `exportarAuditoriaApp()`
**Exporta auditoria completa da app como JSON**

```javascript
// Assinatura
exportarAuditoriaApp(): void

// Faz Download
auditoria_YYYY-MM-DD.json → Arquivo JSON

// Conteúdo
- Todos os acessos
- Todas as ações
- Timestamps
- Detalhes

// Exemplo
exportarAuditoriaApp();
// ✅ Download: auditoria_2026-01-20.json
```

---

### `limparTodosDadosApp()`
**Limpa TODOS os dados com confirmação**

```javascript
// Assinatura
limparTodosDadosApp(): void

// Segurança
- Pede confirmação dupla
- Backup automático antes
- Registro em auditoria

// Exemplo
limparTodosDadosApp();
// "Tem certeza? (2x confirmação)"
// ✅ Dados limpos
```

---

### `mudarSenha()`
**Altera senha de acesso da sessão**

```javascript
// Assinatura
mudarSenha(): void

// Processo
1. Pede senha atual (para validar)
2. Pede nova senha
3. Pede confirmação
4. Salva novo hash SHA-256

// Exemplo
mudarSenha();
// "Digite sua senha atual:"
// "Digite a nova senha:"
// "Confirme a nova senha:"
// ✅ Senha alterada
```

---

### `exibirStatusSeguranca()`
**Exibe status de segurança no console**

```javascript
// Assinatura
exibirStatusSeguranca(): void

// Exibe
- Sessão ativa
- Tempo de expiração
- Últimas ações
- Alertas

// Exemplo
exibirStatusSeguranca();
// Console:
// 🔐 Status de Segurança:
// Sessão: ✅ Ativa
// Tempo: 25 min 30 seg
```

---

### `atualizarTituloPagina()`
**Atualiza título da aba com tempo restante de sessão**

```javascript
// Assinatura
atualizarTituloPagina(): void

// Exemplo
// Título normal: "🔐 Controle Financeiro - Seguro"
// Título com timeout: "⏰ 15:30 - Controle Financeiro"

atualizarTituloPagina();
// Atualizado a cada segundo
```

---

## Gerenciamento de Interface

### `atualizarTela()`
**Atualiza todas as seções da página**

```javascript
// Assinatura
atualizarTela(): void

// Atualiza
- Resumo
- Tabelas
- Gráficos
- Metas
- Alertas
- Tudo em um comando

// Exemplo
atualizarTela();
// ✅ Página completa atualizada
```

---

### `atualizarResumo()`
**Atualiza resumo do dashboard**

```javascript
// Assinatura
atualizarResumo(): void

// Calcula
- Total de receitas
- Total de despesas fixas
- Total de despesas variáveis
- Saldo líquido

// Exemplo
atualizarResumo();
// Valores atualizados em tempo real
```

---

### `atualizarDashboardExecutivo()`
**Atualiza dashboard com KPIs principais**

```javascript
// Assinatura
atualizarDashboardExecutivo(): void

// KPIs
- Receita mensal
- Despesas mensais
- Saldo
- Taxa de economia
- Saúde financeira

// Exemplo
atualizarDashboardExecutivo();
// Dashboard com números-chave atualizado
```

---

### `atualizarPendentes()`
**Atualiza lista de despesas pendentes**

```javascript
// Assinatura
atualizarPendentes(): void

// Mostra
- Despesas fixas não pagas
- Despesas variáveis não pagas
- Total pendente

// Exemplo
atualizarPendentes();
// "Você tem R$ 2.500 em despesas pendentes"
```

---

### `atualizarTabelaConsolidada()`
**Tabela consolidada de todas as transações**

```javascript
// Assinatura
atualizarTabelaConsolidada(): void

// Mostra
- Todas as transações
- Ordenadas por data
- Com opções de filtro

// Exemplo
atualizarTabelaConsolidada();
// Tabela renderizada
```

---

## Utilitários

### `formatarData(data)`
**Formata data ISO para formato brasileiro**

```javascript
// Assinatura
formatarData(data: string): string

// Parâmetros
- data: string → Data ISO (2026-01-20)

// Retorno
string → Data formatada (20/01/2026)

// Exemplo
formatarData("2026-01-20");
// Resultado: "20/01/2026"
```

---

### `calcularSaldo(receita, despesa)`
**Calcula saldo (receita - despesa)**

```javascript
// Assinatura
calcularSaldo(receita: number, despesa: number): number

// Parâmetros
- receita: number
- despesa: number

// Retorno
number → Saldo (positivo ou negativo)

// Exemplo
const saldo = calcularSaldo(5000, 3000);
// Resultado: 2000
```

---

### `carregarConfiguracoes()`
**Carrega configurações do usuário**

```javascript
// Assinatura
carregarConfiguracoes(): void

// Carrega
- Saldo inicial
- Renda mensal
- Tema
- Idioma

// Exemplo
carregarConfiguracoes();
// Configurações prontas para uso
```

---

### `salvarConfiguracoes()`
**Salva configurações do usuário**

```javascript
// Assinatura
salvarConfiguracoes(): void

// Lê de
- Campos de configuração HTML

// Exemplo
// Usuário altera valores
salvarConfiguracoes();
// ✅ Configurações salvas
```

---

### `obterDadosMes()`
**Retorna dados consolidados do mês atual**

```javascript
// Assinatura
obterDadosMes(): object

// Retorno
object → {
  receitas: number,
  despesasFixas: number,
  despesasVariaveis: number,
  saldo: number,
  ...
}

// Exemplo
const dados = obterDadosMes();
console.log(dados.saldo);  // R$ 2.500
```

---

### `calcularSaldoAcumulado()`
**Calcula saldo acumulado desde o início**

```javascript
// Assinatura
calcularSaldoAcumulado(): number

// Retorno
number → Saldo total acumulado

// Exemplo
const acumulado = calcularSaldoAcumulado();
// Resultado: 25000 (saldo desde o primeiro dia)
```

---

### `getMesesPeriodo(tipo)`
**Retorna array de meses para período**

```javascript
// Assinatura
getMesesPeriodo(tipo: string): string[]

// Parâmetros
- tipo: string → "mes" | "trimestre" | "ano"

// Retorno
string[] → Array com meses

// Exemplo
getMesesPeriodo("trimestre");
// Resultado: ["Jan", "Fev", "Mar"]
```

---

### `carregarMesesHeatmap()`
**Carrega dados de heatmap por mês**

```javascript
// Assinatura
carregarMesesHeatmap(): void

// Carrega
- Últimos 12 meses de gastos
- Dados para visualização

// Exemplo
carregarMesesHeatmap();
// Heatmap pronto para renderizar
```

---

### `salvarInvestimentos()`
**Salva investimentos no localStorage**

```javascript
// Assinatura
salvarInvestimentos(): void

// Exemplo
salvarInvestimentos();
// ✅ Investimentos salvos
```

---

### `atualizarEficiencia()`
**Calcula e atualiza índices de eficiência**

```javascript
// Assinatura
atualizarEficiencia(): void

// Calcula
- Eficiência de gastos
- ROI de investimentos
- Velocidade de acúmulo

// Exemplo
atualizarEficiencia();
// "Sua eficiência de gastos: 92%"
```

---

### `gerarLinhaTabela(item, tipo)`
**Gera linha HTML para tabela**

```javascript
// Assinatura
gerarLinhaTabela(item: object, tipo: string): string

// Parâmetros
- item: object → Dados da linha
- tipo: string → "fixa" | "variavel" | "receita"

// Retorno
string → HTML da linha <tr>

// Exemplo
const linha = gerarLinhaTabela(
    { id: 1, valor: 100, data: "2026-01-20" },
    "variavel"
);
// Resultado: "<tr>...</tr>"
```

---

### `compartilharWhatsApp()`
**Compartilha resumo via WhatsApp**

```javascript
// Assinatura
compartilharWhatsApp(): void

// Cria
Mensagem com resumo financeiro para compartilhar

// Exemplo
compartilharWhatsApp();
// Abre WhatsApp com menagem pré-preenchida
```

---

---

## 📊 RESUMO ESTATÍSTICO

```
Total de Funções: 118

Distribuição:
├─ Segurança (seguranca.js): 28 funções
│  ├─ Criptografia: 3
│  ├─ Validação: 6
│  ├─ Sanitização: 2
│  ├─ Armazenamento: 3
│  ├─ Auditoria: 3
│  ├─ Sessão: 7
│  ├─ Relatórios: 2
│  └─ Globais: 2
│
└─ Aplicação (script.js): 90 funções
   ├─ Dados: 3
   ├─ Categorias: 6
   ├─ Backup: 2
   ├─ Despesas Fixas: 5
   ├─ Despesas Variáveis: 4
   ├─ Receitas: 3
   ├─ Investimentos: 6
   ├─ Metas: 2
   ├─ Objetivos: 4
   ├─ Gráficos: 6
   ├─ Relatórios: 6
   ├─ Filtros: 4
   ├─ Análises: 8
   ├─ Utilitários: 14
   └─ Interface: 7
```

---

## 🎓 COMO USAR ESTA DOCUMENTAÇÃO

**1. Procurar uma função específica:**
```
Ctrl+F (ou Cmd+F) → Digite o nome da função
```

**2. Entender o fluxo:**
```
1. Leia a descrição
2. Veja os parâmetros
3. Veja o retorno
4. Estude o exemplo
```

**3. Implementar novo recurso:**
```
1. Identifique funções necessárias
2. Combine com funções existentes
3. Siga o padrão de segurança
4. Teste completamente
```

---

## 🚀 Pronto para Usar!

Agora você tem referência completa de todas as 118 funções da sua aplicação!

**Próximos passos:**
- Estude as funções de segurança
- Entenda o fluxo de dados
- Customize conforme necessário
- Implemente novos recursos usando as funções existentes

Good coding! 🎉
