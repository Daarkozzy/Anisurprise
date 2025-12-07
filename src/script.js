document.addEventListener('DOMContentLoaded', () => {
  // ====== Variáveis ======
  let currentGenre = "";
  const genreButtons = document.querySelectorAll('.genre-btn');
  const animeButton = document.getElementById('anime-button');
  const animeContainer = document.getElementById('anime-container');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const toggleBtn = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const burgerMenu = document.getElementById('burger');
  const navbarMenu = document.getElementById('menu');

  // Ícones completos para alternância de tema
  const sunIcon = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M12 3v2m0 14v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 7a5 5 0 100 10 5 5 0 000-10z"/>
    </svg>`;
  const moonIcon = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>`;

  function updateIcon(theme){
    if(!toggleBtn) return;
    toggleBtn.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
  }

  // Inicializa tema (usa localStorage ou preferencia do sistema)
  const savedTheme = localStorage.getItem('theme');
  if(savedTheme){
    html.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const init = prefersDark ? 'dark' : 'light';
    html.setAttribute('data-theme', init);
    updateIcon(init);
  }

  if(toggleBtn){
    toggleBtn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateIcon(next);
    });
  }

  // Menu burger mobile
  if(burgerMenu && navbarMenu){
    burgerMenu.addEventListener('click', () => {
      burgerMenu.classList.toggle('is-active');
      navbarMenu.classList.toggle('is-active');
    });

    document.querySelectorAll('.menu-link').forEach(link => {
      link.addEventListener('click', () => {
        burgerMenu.classList.remove('is-active');
        navbarMenu.classList.remove('is-active');
      });
    });
  }

  // ====== Gêneros ======
  genreButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      genreButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGenre = btn.getAttribute('data-value').trim();
    });
  });

  // ====== Helpers ======
  function showSpinner(show){
    if(!loadingSpinner) return;
    loadingSpinner.style.display = show ? 'inline-block' : 'none';
  }

  function showMessage(htmlMessage){
    if(!animeContainer) return;
    animeContainer.innerHTML = `<div class="anime-card" style="padding:20px;text-align:center"><p style="color:var(--muted)">${htmlMessage}</p></div>`;
  }

  // Tradução (MyMemory) com timeout simples
  async function traduzirTexto(textoIngles){
    if(!textoIngles) return "Sinopse indisponível.";
    const curto = textoIngles.substring(0, 800);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(curto)}&langpair=en|pt`;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if(!res.ok) return textoIngles;
      const data = await res.json();
      let traducao = data.responseData?.translatedText || textoIngles;
      if(textoIngles.length > 800) traducao += " ... (leia mais no site oficial)";
      return traducao;
    } catch (err){
      return textoIngles;
    }
  }

  // ====== Busca Anime Aleatório com filtro de gênero ======
  async function fetchRandomAnimeWithFilter(genre){
    try {
      let attempts = 0, anime = null;
      const maxAttempts = 18;
      while(attempts < maxAttempts){
        attempts++;
        const response = await fetch('https://api.jikan.moe/v4/random/anime');
        if(!response.ok) {
          // desacelera em caso de rate-limit
          await new Promise(r => setTimeout(r, 600));
          continue;
        }
        const data = await response.json();
        anime = data.data;
        if(!anime) continue;

        // só aceitar TV para consistência
        if(anime.type && anime.type.toLowerCase() !== 'tv') {
          anime = null;
          continue;
        }

        if(genre){
          // compara nomes de gêneros (lowercase), aceita partial match (ex: sci-fi / Sci-Fi)
          const hasGenre = (anime.genres || []).some(g => g.name.toLowerCase() === genre.toLowerCase() || g.name.toLowerCase().includes(genre.toLowerCase()));
          if(!hasGenre) {
            anime = null;
            continue;
          }
        }
        if(anime) return anime;
      }
      return null;
    } catch (err){
      console.error('Erro ao buscar anime:', err);
      return null;
    }
  }

  // Exibe anime em card
  async function showRandomAnime(){
    if(!animeButton) return;
    animeButton.disabled = true;
    showSpinner(true);
    animeContainer.innerHTML = '';

    const anime = await fetchRandomAnimeWithFilter(currentGenre);
    if(!anime){
      showMessage('Puxa, não encontrei um anime apropriado agora. Tente novamente ou escolha outro gênero.');
      animeButton.disabled = false;
      showSpinner(false);
      return;
    }

    const title = anime.title_english || anime.title || 'Título desconhecido';
    const image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
    const rawSynopsis = anime.synopsis || 'Sinopse indisponível.';
    const translatedSynopsis = await traduzirTexto(rawSynopsis);
    const year = anime.year || '—';
    const genres = (anime.genres || []).map(g => g.name).join(', ') || 'N/A';
    const score = anime.score ? anime.score.toFixed(2) : 'N/A';
    const episodes = anime.episodes || '—';
    const status = anime.status || 'N/A';

    let trailerHTML = '';
    if(anime.trailer && anime.trailer.url){
      trailerHTML = `<a href="${anime.trailer.url}" target="_blank" rel="noopener noreferrer" class="trailer-link">▶️ Ver Trailer</a>`;
    }

    animeContainer.innerHTML = `
      <article class="anime-card" role="article">
        <div class="card-image-wrapper">
          <img src="${image}" alt="${title}" class="card-image" />
        </div>
        <div class="card-content-wrapper">
          <div class="card-header">
            <h2>${title}</h2>
            <div class="meta">⭐ ${score} • ${year} • ${episodes} ep • ${status}</div>
          </div>

          <div class="genres"><strong>Gêneros:</strong> ${genres}</div>

          <div class="synopsis-box">
            <h3>Sinopse</h3>
            <p class="synopsis-text">${translatedSynopsis}</p>
          </div>

          <div class="card-actions">
            ${trailerHTML}
            <a class="btn-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/search?q=assistir+anime+${encodeURIComponent(title)}+legendado+ptbr">📺 Onde assistir?</a>
          </div>
        </div>
      </article>
    `;

    showSpinner(false);
    animeButton.disabled = false;
  }

  if(animeButton) animeButton.addEventListener('click', showRandomAnime);

  // ====== Dados sazonais (top e upcoming) ======
  function renderSeasonalCards(animeList, containerId){
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    animeList.forEach(anime => {
      const title = anime.title_english || anime.title || '—';
      const score = anime.score || '—';
      const image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
      const episodes = anime.episodes || '—';
      const date = anime.aired?.string || '';

      const infoBadge = containerId.includes('upcoming') ? `<span class="seasonal-release-badge">${date.split(' to ')[0] || date}</span>` : `<span class="seasonal-score-badge">⭐ ${score}</span>`;

      const card = document.createElement('div');
      card.className = 'seasonal-card';
      card.innerHTML = `
        <img src="${image}" alt="${title}" class="seasonal-img" />
        <div class="seasonal-content">
          <div class="seasonal-info-top">
            <h4 class="seasonal-title">${title}</h4>
          </div>
          <div class="seasonal-info-bottom">
            <p class="seasonal-episodes">Eps: ${episodes}</p>
            ${infoBadge}
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  async function fetchSeasonalData(endpoint, containerId){
    const container = document.getElementById(containerId);
    if(!container) return;
    try {
      const url = `https://api.jikan.moe/v4/seasons/${endpoint}?filter=tv&limit=10`;
      const res = await fetch(url);
      if(!res.ok) throw new Error('Erro Jikan API');
      const data = await res.json();
      renderSeasonalCards(data.data || [], containerId);
    } catch (err){
      console.error('Erro sazonal', err);
      container.innerHTML = `<p style="color:#ff6a4d;text-align:center">Não foi possível carregar a lista da temporada.</p>`;
    }
  }

  function loadSeasonalData(){
    fetchSeasonalData('now', 'current-season-container');
    fetchSeasonalData('upcoming', 'upcoming-season-container');
  }

  loadSeasonalData();
});
