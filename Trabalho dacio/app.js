/* ════════════════════════════════════════════════════════════
   MARIDO DE ALUGUEL — app.js
   ────────────────────────────────────────────────────────────
   Sumário:
   1.  DADOS            → lista de profissionais
   2.  ESTADO           → variáveis de controle da UI
   3.  UTILITÁRIOS      → helpers de DOM e formatação
   4.  RÉGUA DECORATIVA → gera as marcações da fita métrica
   5.  RENDER: CARD     → template do card de profissional
   6.  RENDER: GRID     → busca, filtro e ordenação
   7.  COMPARAÇÃO       → seleção, scroll+highlight, grid e barra flutuante
   8.  CATEGORIAS       → atalhos de filtro rápido
   9.  BUSCA DO HERO    → integração do campo do topo com o app
   10. NAVBAR MOBILE    → menu hambúrguer
   11. MODAL            → cadastro de prestador
   12. TOASTS           → notificações temporárias
   13. SCROLL REVEAL    → animação de entrada ao rolar a página
   14. INICIALIZAÇÃO    → bootstrap da aplicação
   ════════════════════════════════════════════════════════════ */


/* ════════════════════════════════════════════════════════════
   1. DADOS
   Em produção, viria de uma API. Aqui, um array fixo simula
   o banco de profissionais cadastrados na plataforma.
   ════════════════════════════════════════════════════════════ */
const PRESTADORES = [
  {
    id: 1, os: '0412', nome: 'Carlos Eduardo', iniciais: 'CE', categoria: 'Elétrica',
    tags: ['Instalação', 'Quadro de força', 'CFTV'],
    avaliacao: 4.9, numAvaliacoes: 87, preco: 120, distancia: 1.2,
    verificado: true, destaque: true, corAvatar: 'rust',
  },
  {
    id: 2, os: '0287', nome: 'Roberto Silva', iniciais: 'RS', categoria: 'Hidráulica',
    tags: ['Vazamento', 'Caixa d\'água', 'Registro'],
    avaliacao: 4.7, numAvaliacoes: 54, preco: 90, distancia: 2.5,
    verificado: true, destaque: false, corAvatar: 'alt',
  },
  {
    id: 3, os: '0163', nome: 'Ana Pinturas', iniciais: 'AP', categoria: 'Pintura',
    tags: ['Textura', 'Fachada', 'Acabamento'],
    avaliacao: 4.8, numAvaliacoes: 102, preco: 65, distancia: 0.8,
    verificado: true, destaque: false, corAvatar: 'alt2',
  },
  {
    id: 4, os: '0509', nome: 'Marcos Pedreiro', iniciais: 'MP', categoria: 'Alvenaria',
    tags: ['Reforma', 'Contrapiso', 'Reboco'],
    avaliacao: 4.5, numAvaliacoes: 38, preco: 150, distancia: 3.1,
    verificado: false, destaque: false, corAvatar: 'rust',
  },
  {
    id: 5, os: '0334', nome: 'Verde Jardim', iniciais: 'VJ', categoria: 'Jardim',
    tags: ['Poda', 'Paisagismo', 'Irrigação'],
    avaliacao: 4.7, numAvaliacoes: 45, preco: 80, distancia: 1.5,
    verificado: true, destaque: false, corAvatar: 'alt',
  },
  {
    id: 6, os: '0578', nome: 'Fernanda Costa', iniciais: 'FC', categoria: 'Elétrica',
    tags: ['Iluminação', 'Automação', 'Manutenção'],
    avaliacao: 4.9, numAvaliacoes: 61, preco: 110, distancia: 4.0,
    verificado: true, destaque: false, corAvatar: 'alt2',
  },
  {
    id: 7, os: '0221', nome: 'João Henrique', iniciais: 'JH', categoria: 'Hidráulica',
    tags: ['Desentupimento', 'Aquecedor'],
    avaliacao: 4.6, numAvaliacoes: 33, preco: 85, distancia: 2.0,
    verificado: false, destaque: false, corAvatar: 'rust',
  },
  {
    id: 8, os: '0490', nome: 'Renata Alves', iniciais: 'RA', categoria: 'Pintura',
    tags: ['Interna', 'Verniz', 'Grafiato'],
    avaliacao: 4.4, numAvaliacoes: 22, preco: 58, distancia: 3.6,
    verificado: true, destaque: false, corAvatar: 'alt',
  },
  {
    id: 9, os: '0602', nome: 'Diego Martins', iniciais: 'DM', categoria: 'Alvenaria',
    tags: ['Drywall', 'Acabamento fino'],
    avaliacao: 4.8, numAvaliacoes: 29, preco: 135, distancia: 1.8,
    verificado: true, destaque: false, corAvatar: 'alt2',
  },
];


/* ════════════════════════════════════════════════════════════
   2. ESTADO
   Tudo o que muda durante o uso da página fica centralizado
   aqui — facilita saber "o que pode mudar" sem ler o arquivo
   inteiro.
   ════════════════════════════════════════════════════════════ */
const estado = {
  termoBusca: '',
  categoriaAtiva: '',     // '' = todas
  criterioOrdem: 'avaliacao',
  comparando: new Set(),  // ids dos profissionais marcados para comparar (máx 3)
};


/* ════════════════════════════════════════════════════════════
   3. UTILITÁRIOS
   ════════════════════════════════════════════════════════════ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR');
}

function estrelas(nota) {
  const cheias = Math.floor(nota);
  const meia = nota - cheias >= 0.5;
  return '★'.repeat(cheias) + (meia ? '½' : '');
}

function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}


/* ════════════════════════════════════════════════════════════
   4. RÉGUA DECORATIVA
   Gera as marcações (ticks) da fita métrica do hero via JS,
   já que a quantidade depende da largura real da tela —
   muito mais limpo do que tentar fazer isso só em CSS.
   ════════════════════════════════════════════════════════════ */
function montarRegua() {
  const container = $('#rulerTicks');
  if (!container) return;
  container.innerHTML = '';

  const largura = container.parentElement.offsetWidth || window.innerWidth;
  const espaco = 14; // px entre cada marcação
  const quantidade = Math.ceil(largura / espaco);

  const frag = document.createDocumentFragment();
  for (let i = 0; i < quantidade; i++) {
    const tick = document.createElement('span');
    const principal = i % 5 === 0;
    tick.className = 'ruler__tick' + (principal ? ' ruler__tick--major' : '');
    tick.style.height = principal ? '26px' : (i % 1 === 0 ? '14px' : '9px');
    frag.appendChild(tick);
  }
  container.appendChild(frag);
}


/* ════════════════════════════════════════════════════════════
   5. RENDER: CARD DE PROFISSIONAL
   Recebe um objeto de PRESTADORES e devolve uma <div> pronta
   (elemento DOM real, não string — facilita anexar listeners).
   ════════════════════════════════════════════════════════════ */
function criarCardProfissional(p) {
  const card = document.createElement('article');
  card.className = 'pro-card';
  card.dataset.id = p.id;

  const marcado = estado.comparando.has(p.id);

  card.innerHTML = `
    ${p.destaque ? '<span class="pro-card__badge">Melhor custo-benefício</span>' : ''}

    <div class="pro-card__head">
      <div class="avatar avatar--${p.corAvatar === 'rust' ? '' : p.corAvatar}">${p.iniciais}</div>
      <div class="meta">
        <span class="pro-card__os">OS Nº ${p.os}</span>
        <div class="pro-card__name">
          ${p.nome}
          ${p.verificado ? '<span class="pro-card__verified">✓ Verif.</span>' : ''}
        </div>
        <span class="pro-card__cat">${p.categoria}</span>
      </div>
    </div>

    <div class="pro-card__stars">${estrelas(p.avaliacao)} <span class="pro-card__rating-num">${p.avaliacao.toFixed(1)} · ${p.numAvaliacoes} avaliações</span></div>

    <div class="pro-card__tags">
      ${p.tags.map(t => `<span class="pro-card__tag">${t}</span>`).join('')}
    </div>

    <div class="pro-card__divider"></div>

    <div class="pro-card__foot">
      <div>
        <div class="pro-card__price">R$ ${formatarPreco(p.preco)}<small>/hora</small></div>
        <div class="pro-card__dist">📍 ${p.distancia.toLocaleString('pt-BR')} km de você</div>
      </div>
      <label class="pro-card__compare ${marcado ? 'is-checked' : ''}">
        <input type="checkbox" data-compare-id="${p.id}" ${marcado ? 'checked' : ''}>
        Comparar
      </label>
    </div>
  `;

  // Listener do checkbox de comparação
  const checkbox = $('input[type="checkbox"]', card);
  checkbox.addEventListener('change', () => alternarComparacao(p.id, checkbox));

  return card;
}


/* ════════════════════════════════════════════════════════════
   6. RENDER: GRID DE RESULTADOS (busca + filtro + ordenação)
   ════════════════════════════════════════════════════════════ */
function listaFiltrada() {
  const termo = normalizar(estado.termoBusca.trim());

  let lista = PRESTADORES.filter(p => {
    const bateTexto = !termo
      || normalizar(p.nome).includes(termo)
      || normalizar(p.categoria).includes(termo)
      || p.tags.some(t => normalizar(t).includes(termo));
    const bateCategoria = !estado.categoriaAtiva || p.categoria === estado.categoriaAtiva;
    return bateTexto && bateCategoria;
  });

  lista.sort((a, b) => {
    switch (estado.criterioOrdem) {
      case 'preco':     return a.preco - b.preco;
      case 'distancia':  return a.distancia - b.distancia;
      case 'avaliacao':
      default:           return b.avaliacao - a.avaliacao;
    }
  });

  return lista;
}

function renderizarGrid() {
  const grid = $('#proGrid');
  const vazio = $('#appEmpty');
  const contador = $('#resultCount');

  const lista = listaFiltrada();

  grid.innerHTML = '';
  if (lista.length === 0) {
    vazio.classList.remove('hidden');
  } else {
    vazio.classList.add('hidden');
    const frag = document.createDocumentFragment();
    lista.forEach(p => frag.appendChild(criarCardProfissional(p)));
    grid.appendChild(frag);
  }

  const plural = lista.length === 1 ? 'profissional encontrado' : 'profissionais encontrados';
  contador.textContent = `${lista.length} ${plural}`;
}

function ligarControlesDeBusca() {
  $('#appSearchInput').addEventListener('input', e => {
    estado.termoBusca = e.target.value;
    renderizarGrid();
  });

  $('#appCategorySelect').addEventListener('change', e => {
    estado.categoriaAtiva = e.target.value;
    sincronizarCategoriasAtivas();
    renderizarGrid();
  });

  $$('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.sort-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      estado.criterioOrdem = btn.dataset.sort;
      renderizarGrid();
    });
  });
}


/* ════════════════════════════════════════════════════════════
   7. COMPARAÇÃO
   ─────────────────────────────────────────────────────────
   Estado: Set de IDs (máx 3).
   Ao atingir 2 selecionados pela primeira vez:
     • Scroll suave até a seção #comparar
     • Highlight visual temporário (borda verde + brilho)
   A barra flutuante sincroniza a cada mudança de estado.
   ════════════════════════════════════════════════════════════ */

/* Controle para disparar o scroll+highlight só uma vez por sessão */
let _scrollDisparado = false;
let _highlightTimer  = null;

function alternarComparacao(id, checkboxEl) {
  if (checkboxEl.checked) {
    if (estado.comparando.size >= 3) {
      checkboxEl.checked = false;
      mostrarToast('Máximo de 3 profissionais — remova um para trocar.');
      return;
    }
    estado.comparando.add(id);
  } else {
    estado.comparando.delete(id);
    // Reset do scroll para que seja disparado novamente se o usuário
    // remover e depois voltar a ter 2 selecionados.
    if (estado.comparando.size < 2) _scrollDisparado = false;
  }

  // Atualiza o label do card sem re-renderizar o card inteiro
  const label = checkboxEl.closest('.pro-card__compare');
  label.classList.toggle('is-checked', checkboxEl.checked);

  // Renderiza o grid de comparação
  renderizarComparacao();

  // Sincroniza a barra flutuante
  atualizarBarraComparacao();

  // Dispara o fluxo de destaque ao atingir 2 selecionados
  if (estado.comparando.size === 2 && !_scrollDisparado) {
    _scrollDisparado = true;
    dispararDestaqueComparacao();
  }
}

/* Scroll suave + highlight temporário da seção #comparar */
function dispararDestaqueComparacao() {
  const secao = $('#comparar');
  if (!secao) return;

  // 1. Pequeno delay para o usuário perceber o tick no checkbox antes do scroll
  setTimeout(() => {
    secao.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 280);

  // 2. Highlight começa logo após o scroll chegar (estimativa de duração do scroll)
  setTimeout(() => {
    // Limpa qualquer highlight anterior antes de iniciar
    if (_highlightTimer) clearTimeout(_highlightTimer);
    secao.classList.remove('is-fading');
    secao.classList.add('is-highlighted');

    // 3. Após 2 segundos, inicia o fade-out suave
    _highlightTimer = setTimeout(() => {
      secao.classList.add('is-fading');
      secao.classList.remove('is-highlighted');

      // 4. Limpa as classes após a transição de fade terminar
      setTimeout(() => secao.classList.remove('is-fading'), 900);
    }, 2000);
  }, 900);
}

/* Renderiza o grid de comparação (tabela lado a lado) */
function renderizarComparacao() {
  const vazio = $('#compareEmpty');
  const grid  = $('#compareGrid');
  const selecionados = PRESTADORES.filter(p => estado.comparando.has(p.id));

  if (selecionados.length < 2) {
    vazio.classList.remove('hidden');
    grid.classList.add('hidden');
    grid.innerHTML = '';
    return;
  }

  vazio.classList.add('hidden');
  grid.classList.remove('hidden');

  const melhorId = [...selecionados].sort((a, b) => b.avaliacao - a.avaliacao)[0].id;

  grid.innerHTML = selecionados.map(p => `
    <div class="compare-card ${p.id === melhorId ? 'is-winner' : ''}">
      ${p.id === melhorId ? '<span class="compare-card__crown">★ Melhor avaliado</span>' : ''}
      <div class="avatar avatar--${p.corAvatar === 'rust' ? '' : p.corAvatar}" style="margin:0 auto 10px">${p.iniciais}</div>
      <div class="compare-card__name">${p.nome}</div>
      <div class="compare-card__cat">${p.categoria}</div>
      <div class="compare-row"><span>Avaliação</span>  <strong>${p.avaliacao.toFixed(1)} ★</strong></div>
      <div class="compare-row"><span>Preço por hora</span><strong>R$ ${formatarPreco(p.preco)}</strong></div>
      <div class="compare-row"><span>Distância</span>   <strong>${p.distancia.toLocaleString('pt-BR')} km</strong></div>
      <div class="compare-row"><span>Verificado</span>  <strong>${p.verificado ? 'Sim ✓' : 'Não'}</strong></div>
      <button class="btn btn--solid compare-card__cta" data-orcamento="${p.nome}">Pedir orçamento</button>
    </div>
  `).join('');

  $$('[data-orcamento]', grid).forEach(btn => {
    btn.addEventListener('click', () => {
      mostrarToast(`Orçamento solicitado para ${btn.dataset.orcamento}.`);
    });
  });
}

/* ────────────────────────────────────────────────────────────
   BARRA FLUTUANTE DE COMPARAÇÃO
   Sincroniza avatars, contador, hint text e estado do CTA
   a cada mudança no Set estado.comparando.
───────────────────────────────────────────────────────────── */
function atualizarBarraComparacao() {
  const barra    = $('#compareBar');
  const avatares = $('#compareBarAvatars');
  const count    = $('#compareBarCount');
  const hint     = $('#compareBarHint');
  const cta      = $('#compareBarCta');
  const ctaLabel = $('#compareBarCtaLabel');
  const clear    = $('#compareBarClear');

  const n = estado.comparando.size;
  const selecionados = PRESTADORES.filter(p => estado.comparando.has(p.id));

  // Mostra/esconde a barra e sinaliza ao body para reposicionar toasts
  barra.classList.toggle('is-visible', n > 0);
  document.body.classList.toggle('compare-bar-open', n > 0);

  if (n === 0) return;

  // ── Avatars: exibe os selecionados + slots vazios até 3 ──
  const corMap = { rust: '', alt: 'compare-bar__avatar--alt', alt2: 'compare-bar__avatar--alt2' };
  let htmlAvatares = selecionados.map(p =>
    `<div class="compare-bar__avatar ${corMap[p.corAvatar] || ''}" title="${p.nome}">${p.iniciais}</div>`
  ).join('');
  // Slots vazios para os espaços disponíveis (visual de "encaixe")
  for (let i = n; i < 3; i++) {
    htmlAvatares += `<div class="compare-bar__avatar compare-bar__avatar--empty" title="Slot livre">+</div>`;
  }
  avatares.innerHTML = htmlAvatares;

  // ── Contador ──
  const plural = n === 1 ? 'profissional selecionado' : 'profissionais selecionados';
  count.textContent = `${n} ${plural}`;

  // ── Hint text: orienta o usuário conforme o estado ──
  if (n === 1) {
    hint.textContent = 'Selecione mais 1 ou 2 para comparar.';
  } else if (n === 2) {
    hint.textContent = 'Pronto para comparar! Adicione mais 1 se quiser.';
  } else {
    hint.textContent = 'Comparação com 3 profissionais.';
  }

  // ── CTA: ativo somente com 2+ selecionados ──
  const podeComparar = n >= 2;
  cta.disabled = !podeComparar;

  if (podeComparar) {
    ctaLabel.textContent = 'Ver comparação';
    // Pulsa uma vez para chamar atenção quando o CTA se habilita
    cta.classList.remove('is-ready');
    void cta.offsetWidth; // força reflow para reiniciar a animação
    cta.classList.add('is-ready');
  } else {
    ctaLabel.textContent = 'Selecione mais 1';
  }
}

/* Liga os botões da barra flutuante */
function ligarBarraComparacao() {
  // CTA → scroll até a seção de comparação
  $('#compareBarCta').addEventListener('click', () => {
    if (estado.comparando.size < 2) return;
    const secao = $('#comparar');
    secao.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Dispara highlight novamente ao clicar no CTA (mesmo que já tenha sido)
    setTimeout(() => {
      const s = $('#comparar');
      if (_highlightTimer) clearTimeout(_highlightTimer);
      s.classList.remove('is-fading');
      s.classList.add('is-highlighted');
      _highlightTimer = setTimeout(() => {
        s.classList.add('is-fading');
        s.classList.remove('is-highlighted');
        setTimeout(() => s.classList.remove('is-fading'), 900);
      }, 1800);
    }, 600);
  });

  // Limpar seleção
  $('#compareBarClear').addEventListener('click', () => {
    estado.comparando.clear();
    _scrollDisparado = false;
    // Desmarca todos os checkboxes visíveis
    $$('.pro-card__compare input').forEach(cb => {
      cb.checked = false;
      cb.closest('.pro-card__compare').classList.remove('is-checked');
    });
    renderizarComparacao();
    atualizarBarraComparacao();
  });
}


/* ════════════════════════════════════════════════════════════
   8. CATEGORIAS
   Cards de atalho que filtram o app abaixo e rolam até ele.
   ════════════════════════════════════════════════════════════ */
function sincronizarCategoriasAtivas() {
  $$('.cat-card').forEach(card => {
    card.classList.toggle('is-active', card.dataset.cat === estado.categoriaAtiva && card.dataset.cat !== '');
  });
}

function ligarCategorias() {
  $$('.cat-card').forEach(card => {
    card.addEventListener('click', () => {
      const categoria = card.dataset.cat;
      estado.categoriaAtiva = categoria;
      $('#appCategorySelect').value = categoria;
      sincronizarCategoriasAtivas();
      renderizarGrid();
      $('#buscar').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}


/* ════════════════════════════════════════════════════════════
   9. BUSCA DO HERO
   O campo de busca do topo só "encaminha" o termo para o app
   de busca de verdade, mais abaixo na página.
   ════════════════════════════════════════════════════════════ */
function ligarBuscaHero() {
  $('#heroSearch').addEventListener('submit', e => {
    e.preventDefault();
    const termo = $('#heroInput').value.trim();
    aplicarBuscaEIrParaApp(termo);
  });

  $$('.chip-link[data-suggest]').forEach(btn => {
    btn.addEventListener('click', () => aplicarBuscaEIrParaApp(btn.dataset.suggest));
  });
}

function aplicarBuscaEIrParaApp(termo) {
  estado.termoBusca = termo;
  estado.categoriaAtiva = '';
  $('#appSearchInput').value = termo;
  $('#appCategorySelect').value = '';
  sincronizarCategoriasAtivas();
  renderizarGrid();
  $('#buscar').scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/* ════════════════════════════════════════════════════════════
   10. NAVBAR MOBILE
   ════════════════════════════════════════════════════════════ */
function ligarMenuMobile() {
  const burger = $('#burger');
  const menu = $('#navMobile');

  burger.addEventListener('click', () => {
    const aberto = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(aberto));
  });

  // Fecha o menu ao clicar em qualquer link dele
  $$('a', menu).forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}


/* ════════════════════════════════════════════════════════════
   11. MODAL DE CADASTRO DE PRESTADOR
   ════════════════════════════════════════════════════════════ */
function ligarModal() {
  const modal = $('#providerModal');
  const abrir = () => { modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); };
  const fechar = () => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); };

  $('#providerSignupBtn').addEventListener('click', e => { e.preventDefault(); abrir(); });
  $('#modalClose').addEventListener('click', fechar);

  // Fecha ao clicar fora do painel
  modal.addEventListener('click', e => { if (e.target === modal) fechar(); });

  // Fecha com a tecla Esc
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) fechar();
  });

  $('#modalForm').addEventListener('submit', e => {
    e.preventDefault();
    fechar();
    e.target.reset();
    mostrarToast('Cadastro enviado! Em breve entraremos em contato.');
  });
}


/* ════════════════════════════════════════════════════════════
   12. TOASTS
   Notificações temporárias no canto da tela. Cada chamada
   cria um elemento, agenda sua saída e depois o remove do DOM.
   ════════════════════════════════════════════════════════════ */
function mostrarToast(mensagem) {
  const pilha = $('#toastStack');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensagem;
  pilha.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 220);
  }, 3200);
}


/* ════════════════════════════════════════════════════════════
   13. SCROLL REVEAL
   ─────────────────────────────────────────────────────────
   Usa IntersectionObserver para revelar o conteúdo em fade
   suave conforme a página é rolada — sem bibliotecas externas.

   Dois níveis de cobertura:
   • Grupos com stagger: elementos lado a lado (grids, listas)
     entram em sequência com um pequeno atraso entre eles,
     em vez de surgirem todos no mesmo instante.
   • Elementos isolados: títulos de seção, painéis, blocos de
     texto — cada um revela no seu próprio ritmo ao entrar.
   ════════════════════════════════════════════════════════════ */
function ligarScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('is-visible');
        observer.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

  // Aplica .reveal com um atraso escalonado a cada item de uma lista,
  // criando o efeito de entrada "em cascata" dentro do grupo.
  function prepararGrupo(seletor, passoMs = 80, maxItens = 8) {
    $$(seletor).forEach(grupo => {
      Array.from(grupo.children).slice(0, maxItens).forEach((item, i) => {
        item.classList.add('reveal');
        item.style.setProperty('--reveal-delay', `${i * passoMs}ms`);
        observer.observe(item);
      });
    });
  }

  // Aplica .reveal a elementos isolados (sem stagger entre si)
  function prepararIsolados(seletor, variante = '') {
    $$(seletor).forEach(el => {
      el.classList.add('reveal');
      if (variante) el.classList.add(variante);
      observer.observe(el);
    });
  }

  // ── Grupos com stagger (cascata) ──
  prepararGrupo('.how__list', 90);
  prepararGrupo('.cat-grid', 60);
  prepararGrupo('#proGrid', 70, 9);
  prepararGrupo('.numbers__grid', 100);
  prepararGrupo('.compare-grid', 90);
  prepararGrupo('.trust__list', 110);

  // ── Blocos isolados (fade individual, sem cascata) ──
  // Hero fica acima da dobra: revela imediato (sem esperar o observer)
  // para a primeira impressão da página não parecer atrasada.
  $$('.hero__copy > *').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${i * 70}ms`);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-visible')));
  });
  const heroPanel = $('.hero__panel');
  if (heroPanel) {
    heroPanel.classList.add('reveal', 'reveal--soft');
    heroPanel.style.setProperty('--reveal-delay', '180ms');
    requestAnimationFrame(() => requestAnimationFrame(() => heroPanel.classList.add('is-visible')));
  }

  prepararIsolados('.trustbar__inner', 'reveal--soft');
  prepararIsolados('.section-head');
  prepararIsolados('.trust__copy > *');
  prepararIsolados('.review-card', 'reveal--soft');
  prepararIsolados('.provider-cta__inner > *');
  prepararIsolados('.footer__inner > *', 'reveal--soft');
}

/* Anima a entrada dos cards de profissional sempre que o grid
   é refeito (busca/filtro) — usa apenas uma classe CSS, sem
   esconder o conteúdo caso o JS demore para rodar. */
function observarNovosCards() {
  const grid = $('#proGrid');
  new MutationObserver((mutations) => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList.contains('pro-card')) {
          node.classList.add('pro-card--enter');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => node.classList.add('pro-card--enter-active'));
          });
        }
      });
    });
  }).observe(grid, { childList: true });
}


/* ════════════════════════════════════════════════════════════
   14. INICIALIZAÇÃO
   ════════════════════════════════════════════════════════════ */
function iniciar() {
  montarRegua();
  window.addEventListener('resize', debounce(montarRegua, 200));

  ligarControlesDeBusca();
  ligarCategorias();
  ligarBuscaHero();
  ligarMenuMobile();
  ligarModal();
  ligarBarraComparacao();
  observarNovosCards();

  renderizarGrid();
  renderizarComparacao();
  atualizarBarraComparacao();

  ligarScrollReveal();
}

function debounce(fn, espera) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), espera);
  };
}

document.addEventListener('DOMContentLoaded', iniciar);
