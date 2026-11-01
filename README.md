# Conversor de Moeda

SPA em React para **conversão e análise de moedas** com as taxas de referência do Banco Central Europeu, consumidas da API pública [Frankfurter](https://frankfurter.dev/v1/). Implementada a partir do protótipo do Figma (tema escuro, verde esmeralda).

Funcionalidades, todas em uma única página:

- **Conversor** — valor com máscara monetária, moeda de origem e destino, inversão rápida, valores rápidos, resultado com paridade, inverso e data da cotação.
- **Série histórica** — períodos 7D / 30D / 90D / 1A, gráfico de linha com média móvel (MA-7), taxa atual, menor, maior, variação total e média ponderada.
- **Moedas disponíveis** — tabela com busca, filtros por região, ordenação, variação do último pregão, tendência de 7 pregões (sparkline) e ação para usar a moeda no conversor.
- **Exportação CSV** — gerada no navegador, sem bibliotecas.
- Estados de carregamento, erro (com "Tentar novamente"), vazio e sucesso; layout responsivo (desktop, tablet e mobile).

---

## 1. Como rodar localmente

### Pré-requisitos

- Node.js compatível com o Vite instalado: `^20.19.0 || >=22.12.0`. O ambiente utilizado neste projeto tem Node.js 24.16.0 e npm 11.13.0.
- npm, incluído na instalação do Node.js.
- Acesso à internet para instalar dependências e consultar as cotações.

Confira a instalação no terminal:

```bash
node --version
npm --version
```

### Instalação e execução

1. Abra a pasta do projeto no VS Code e acesse **Terminal > Novo Terminal**. O terminal deve estar na pasta que contém `package.json`.
2. No Windows, para acessar a pasta atual do projeto pelo PowerShell:

```powershell
cd "C:\Users\edugu\Desktop\conversor-moedas\conversor-moedas"
```

Em outro computador, substitua o caminho pela pasta onde você salvou o projeto.

3. Instale as dependências usando as versões registradas em `package-lock.json`:

```bash
npm ci
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

5. Abra o endereço mostrado no terminal, normalmente `http://localhost:5173`. Se a porta estiver ocupada, o Vite poderá utilizar outra. As alterações no código são atualizadas no navegador durante o desenvolvimento.

Para encerrar o servidor, pressione **Ctrl+C** no terminal.

A aplicação roda no navegador e consulta a API diretamente. Não é necessário configurar backend, banco de dados, chave de API ou arquivo `.env`. As fontes também são carregadas do Google Fonts.

### Build e prévia de produção

Gere os arquivos de produção:

```bash
npm run build
```

O resultado fica na pasta `dist/`. Para conferir esse resultado localmente:

```bash
npm run preview
```

Abra o endereço exibido no terminal, normalmente `http://localhost:4173`. Execute o build novamente após alterar o código para atualizar essa prévia. O comando `preview` serve para conferência local do build.

| Comando | Finalidade |
| --- | --- |
| `npm ci` | Instala as dependências a partir do lockfile; recria `node_modules` |
| `npm run dev` | Inicia o desenvolvimento com atualização automática |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Exibe localmente o build gerado |

### Problemas comuns

- **`npm` não reconhecido:** verifique a instalação do Node.js e reabra o terminal.
- **Erro de versão do Node.js:** confira `node --version` e utilize uma versão compatível com o requisito acima.
- **PowerShell bloqueia `npm.ps1`:** execute os comandos com `npm.cmd`, por exemplo `npm.cmd run dev`, ou use o Prompt de Comando.
- **Cotações não carregam:** verifique a conexão com a internet e tente atualizar as taxas novamente.
- **Favicon antigo:** recarregue com **Ctrl+F5**, pois o navegador pode manter o ícone em cache.

---

## 2. Stack e por que Tailwind

| Camada | Escolha |
| --- | --- |
| Linguagem | JavaScript com JSX e módulos ES |
| Ambiente e pacotes | Node.js e npm |
| API HTTP | Frankfurter v1, consumida com Fetch API nativa |
| Build | Vite 7 + `@vitejs/plugin-react` |
| UI | React 19 (componentes funcionais, JSX, JavaScript) |
| Estilos | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Gráfico principal | Recharts |
| Sparklines | SVG puro |
| Declaração de props | `prop-types` (presente no código; React 19 não executa automaticamente essas validações em componentes funcionais) |

**Por que Tailwind:** o protótipo é um dashboard com muitos cartões que repetem os mesmos tokens (fundo navy, painéis, verde de alta, vermelho de queda, mono para números). Os tokens ficam declarados uma vez em `src/styles/index.css` (`@theme`) e viram classes (`bg-card`, `text-up`, `bg-down-soft`…), o que mantém a fidelidade visual sem dezenas de arquivos CSS e deixa os estados (`hover:`, `focus-within:`, `disabled:`) explícitos no próprio componente.

---

## 3. Estrutura de pastas

```
src/
├── main.jsx                      # ponto de entrada (StrictMode)
├── App.jsx                       # estado compartilhado (Lifting State Up) e composição da página
├── constants/
│   └── index.js                  # URLs, períodos, valores rápidos, pares do ticker, regiões, paginação
├── services/
│   └── frankfurterApi.js         # ÚNICO módulo que faz fetch; validação de respostas e ApiError
├── hooks/
│   ├── useApiResource.js         # base: useEffect + AbortController + estados loading/success/error
│   ├── useCurrencies.js          # lista de moedas (nomes em pt-BR via Intl)
│   ├── useExchangeRate.js        # taxa atual do par selecionado
│   ├── useHistoricalRates.js     # série do período + média móvel + resumo estatístico
│   ├── useMarketSnapshot.js      # 1 requisição que alimenta ticker e tabela
│   ├── useDebounce.js            # busca da tabela
│   ├── useMediaQuery.js          # ajustes do gráfico em telas estreitas
│   └── useToast.js               # feedback da exportação
├── utils/
│   ├── formatters.js             # moeda, número, taxa, % (pt-BR), nomes e símbolos de moedas
│   ├── dates.js                  # datas UTC e formatos "24 Out", "24/10/2024"
│   ├── rates.js                  # taxa cruzada, variação, média móvel, resumo, linhas da tabela
│   ├── currencyTable.js          # filtrar, ordenar, paginar e montar o CSV da tabela
│   ├── csv.js                    # gerador de CSV genérico e download no navegador
│   └── amountInput.js            # máscara do valor e validação da conversão
├── components/
│   ├── layout/                   # Header, MarketTicker, Footer
│   ├── converter/                # CurrencyConverter, AmountField, CurrencySelect, QuickAmounts, ConversionResult
│   ├── history/                  # HistoricalAnalysis, PeriodSelector, StatCard, HistoryChart
│   ├── currencies/               # CurrencyTable, SortableHeader, Sparkline, Pagination
│   └── ui/                       # Icons, ChangeBadge, CurrencyBadge, Feedback (Skeleton, Spinner, mensagens, Toast)
├── assets/                       # (reservado; ícones são SVG inline)
└── styles/
    └── index.css                 # Tailwind + tokens de cor/tipografia do protótipo
```

Regra de organização: **componentes só apresentam**. Chamadas à API ficam em `services`, ciclo de vida das requisições em `hooks`, e cálculos/formatação em `utils` (funções puras, fáceis de testar).

---

## 4. Como a API é consumida

Base: `https://api.frankfurter.dev/v1` — todas as chamadas passam por `src/services/frankfurterApi.js`.

| Uso na tela | Endpoint | Hook |
| --- | --- | --- |
| Lista de moedas | `GET /currencies` | `useCurrencies` |
| Conversão | `GET /latest?base=BRL&symbols=USD` | `useExchangeRate` |
| Série histórica | `GET /2024-09-24..?base=BRL&symbols=USD` | `useHistoricalRates` |
| Ticker + tabela | `GET /{hoje-14d}..?base=EUR` (todas as moedas) | `useMarketSnapshot` |

**Uma requisição para a tabela inteira.** A série de mercado vem em base EUR com todas as moedas; taxa em BRL, taxa em USD, variação do último pregão e tendência 7D de cada moeda são calculadas por **taxa cruzada** (`crossRate` em `utils/rates.js`): `1 A em B = taxa(EUR→B) / taxa(EUR→A)`. Isso evita ~30 chamadas por atualização.

**Tratamento de falhas** (`request()` no serviço):

- erro de rede → `ApiError` "Não foi possível conectar à API";
- HTTP não-OK → mensagem por status (404, 422, 429, 5xx…);
- JSON inválido ou formato inesperado → `ApiError` de formato;
- taxas não numéricas, datas inválidas e moedas sem cotação são descartadas;
- cada resposta guarda `status` e `latencyMs` (exibidos no ticker como `200 OK · 42ms`).

**Evitando requisições desnecessárias:**

- `useApiResource` só refaz a chamada quando as dependências declaradas mudam e cancela a anterior com `AbortController` (sem condição de corrida ao trocar moedas rapidamente);
- com moedas iguais, os hooks de taxa e de série ficam desabilitados e não chamam a API;
- durante uma atualização, os últimos dados válidos continuam na tela (sem "piscar");
- a busca na tabela é local e com debounce de 250 ms.

> As datas da API são em UTC e as taxas do BCE são publicadas em dias úteis por volta das 16:00 CET; fins de semana e feriados não têm cotação nova.

---

## 5. Conceitos React aplicados

| Conceito | Onde |
| --- | --- |
| **React e JSX** | Todos os arquivos `.jsx` em `components/` |
| **Componentes funcionais** | Toda a interface; nenhum componente de classe |
| **Declarações de props** | `PropTypes` em todos os componentes (ex.: `CurrencySelect`, `HistoryChart`, `CurrencyTable`) |
| **Eventos controlados** | `AmountField` (input com máscara), `CurrencySelect` (select), busca da tabela, botões de período, filtros, paginação, `onSubmit` do formulário |
| **useState** | Estado local da tabela (busca, região, ordenação, página); estado compartilhado no `App` |
| **Lifting State Up** | `App.jsx` guarda `from`, `to`, `amount`, período e chave de atualização. O conversor altera as moedas, o gráfico usa o mesmo par, e o botão "Converter" da tabela também altera o par do conversor |
| **useEffect** | `useApiResource` (requisições + cancelamento), `useDebounce`, `useMediaQuery`, `useToast` |
| **Custom Hooks** | `useCurrencies`, `useExchangeRate`, `useHistoricalRates`, `useMarketSnapshot`, `useDebounce`, `useMediaQuery`, `useToast` |
| **Arrays e objetos** | `map/filter/reduce/sort` em `rates.js` e `currencyTable.js`; `Object.entries/fromEntries` no serviço; ordenação sempre em cópia (`[...rows]`), sem mutação |
| **Gráficos** | `HistoryChart` com Recharts (linha, média móvel tracejada, linha de pico, tooltip); `Sparkline` em SVG puro |
| **CSV utilitário** | `utils/csv.js` (`toCsv`, `downloadCsv`, `exportToCsv`) — genérico, sem dependências |

`useMemo` é usado para dados derivados (linhas da tabela, ticker, série com média móvel), evitando recalcular e evitando estado duplicado.

---

## 6. Exportação CSV

O botão **Exportar CSV** da tabela exporta **todas as moedas filtradas/ordenadas** (não só a página atual), já convertendo o valor do conversor para cada uma.

Colunas: `Data da cotação; Moeda base; Moeda de destino; Nome da moeda; Taxa (1 base = X destino); Valor base; Valor convertido; Taxa em BRL; Taxa em USD; Variação 24h (%)`.

O arquivo usa `;` como separador, vírgula decimal e BOM UTF-8, para abrir corretamente no Excel em português. Sucesso ou erro aparecem em um aviso no canto da tela.

---

## 7. Decisões de interpretação do protótipo

O protótipo foi seguido fielmente; onde ele era ambíguo ou mostrava algo que a API não fornece, a escolha foi:

- **Ícone de bandeira** — o protótipo usa um marcador genérico. Emojis de bandeira não renderizam no Windows, então o marcador mostra o símbolo da moeda (`R$`, `$`, `€`).
- **"Auditado"** — a API não fornece auditoria; o selo foi trocado por **"Fonte BCE"**, que é verdadeiro.
- **"Média ponderada"** — implementada como média ponderada pelo tempo: cada taxa pesa pelos dias em que esteve vigente (a de sexta cobre o fim de semana). O texto abaixo indica a volatilidade (baixa/moderada/alta), pelo desvio-padrão das variações diárias.
- **"Spread médio"** — a API não fornece spread (compra/venda). Exibimos **"Oscilação média diária"**, a média da diferença absoluta entre cotações consecutivas.
- **"Variação 24h"** — é a variação em relação ao **pregão anterior** do BCE (não há cotação intradiária).
- **Ordenação por nome** — o protótipo mostra setas apenas em código e taxas; a ordenação por nome foi adicionada por ser requisito. Clicar alterna crescente → decrescente → ordem padrão.
- **Filtros por região** — a API não informa regiões; os grupos estão em `constants/index.js`.
- **Quantidade de moedas** — o protótipo diz "33"; o número exibido é o que a API retornar.
- **Valor do conversor** — máscara de caixa eletrônico (os dígitos entram pela direita), que impede valores mal formatados. O resultado acompanha o par selecionado; o valor é confirmado ao clicar em **Converter Agora**, que também busca a taxa mais recente.
- **Gráfico no celular** — menos datas no eixo X e sem os sufixos "(Pico)"/"(Hoje)" para não sobrepor.
- **Números** — todos em formato pt-BR (`0,1845`), inclusive no eixo do gráfico, por consistência com o restante da página.

---

## 8. Acessibilidade

- Labels associados a todos os campos; selects nativos (teclado e leitor de tela funcionam sem código extra) com visual do protótipo sobreposto.
- Foco visível em todos os elementos interativos; link "Pular para o conversor".
- `aria-pressed` em períodos, filtros e valores rápidos; `aria-sort` nos cabeçalhos ordenáveis; `aria-current` na paginação.
- `aria-live` no resultado da conversão, na contagem da tabela e nos avisos.
- Gráfico com descrição textual (`role="img"` + `aria-label`); variações anunciadas como "alta de / queda de".
- Botões desabilitados durante requisições; respeita `prefers-reduced-motion`.

---

## 9. Git e GitHub

O `.gitignore` já ignora `node_modules/`, `dist/`, logs, `.env*` e arquivos de editor/SO.

```bash
# 1. Iniciar o repositório
git init
git branch -M main

# 2. Primeiro commit
git add .
git commit -m "chore: configurar projeto React com Vite e Tailwind"

# 3. Criar o repositório vazio no GitHub (sem README) e conectar
git remote add origin https://github.com/SEU-USUARIO/conversor-de-moeda.git
git push -u origin main

# 4. Fluxo com branches para novas funcionalidades
git checkout -b feat/exportacao-csv
# ...alterações...
git add .
git commit -m "feat: adicionar exportação CSV"
git push -u origin feat/exportacao-csv
# abra um Pull Request no GitHub e faça o merge em main
```

Com o GitHub CLI, os passos 3 e o push viram um só: `gh repo create conversor-de-moeda --public --source=. --push`.

### Sugestão de commits convencionais

Para quem quiser reconstruir o histórico em etapas:

```
chore: configurar projeto React com Vite e Tailwind
feat: criar serviço da API Frankfurter com tratamento de erros
feat: adicionar hooks de moedas, taxa atual e série histórica
feat: adicionar conversor de moedas
feat: adicionar inversão de moedas e valores rápidos
feat: implementar gráfico histórico com média móvel
feat: adicionar resumo estatístico do período
feat: adicionar tabela de moedas com busca, filtros e ordenação
feat: adicionar tendência 7D com sparkline em SVG
feat: adicionar exportação CSV
fix: tratar erro na requisição de taxas
fix: cancelar requisições obsoletas ao trocar moedas
style: ajustar layout responsivo do gráfico no mobile
docs: documentar arquitetura e uso da API no README
```

---

Dados: [Frankfurter](https://frankfurter.dev) · taxas de referência do Banco Central Europeu, para fins analíticos e informativos.

## 10. Logo e favicon

A imagem local `public/logo.png` é utilizada pelo cabeçalho e pelo ícone da aba. O arquivo é um PNG de 256×256 px, referenciado como `/logo.png`.

No cabeçalho, a imagem tem dimensões de 40×40 px, `object-contain` para preservar a proporção e `alt=""` por ser decorativa ao lado do título. No `index.html`, o favicon declara o tipo `image/png`.

Antes de publicar, confirme a licença de uso do ícone premium do Iconscout ou substitua-o por uma imagem com licença adequada.