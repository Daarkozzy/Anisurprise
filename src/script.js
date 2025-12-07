document.addEventListener('DOMContentLoaded', () => {
    
    /* =================================================================
       1. VARIÁVEIS E SELEÇÃO DE GÊNERO
    ================================================================= */
    let currentGenre = ""; 
    const genreButtons = document.querySelectorAll('.genre-btn');
    
    genreButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            genreButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentGenre = btn.getAttribute('data-value');
        });
    });

    /* =================================================================
       2. FUNÇÃO DE TRADUÇÃO (Sinopse)
    ================================================================= */
    async function traduzirTexto(textoIngles) {
        if (!textoIngles) return "Sinopse indisponível.";

        try {
            const textoParaTraduzir = textoIngles.substring(0, 500);
            
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textoParaTraduzir)}&langpair=en|pt`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            let textoTraduzido = data.responseData.translatedText;
            if (textoIngles.length > 500) {
                textoTraduzido += "... (leia mais no site oficial)";
            }
            return textoTraduzido;

        } catch (error) {
            console.error("Erro ao traduzir:", error);
            
            return textoIngles;
        }
    }

    /* =================================================================
       3. LÓGICA DE DADOS (Função de busca aleatória)
    ================================================================= */
    
    async function fetchRandomAnimeWithFilter(genre) {
        try {
            let anime;
            let attempts = 0;
            const maxAttempts = 15;
            do {
                attempts++;
                const response = await fetch('https://api.jikan.moe/v4/random/anime');
                if (!response.ok) throw new Error('Erro API');
                const data = await response.json();
                anime = data.data;

                if (genre && anime.genres) {
                    const hasGenre = anime.genres.some(g => g.name.toLowerCase() === genre.toLowerCase());
                    if (!hasGenre) anime = null;
                }
               
                if (attempts >= maxAttempts) return null;
            } while (!anime || anime.type !== 'TV');
            return anime;
        } catch (error) { 
            console.error('Erro ao buscar anime:', error);
            return null; 
        }
    }

    /* =================================================================
       4. EXIBIÇÃO DO ANIME ALEATÓRIO (CARD PROFISSIONAL)
    ================================================================= */
    const animeButton = document.getElementById('anime-button');
    const animeContainer = document.getElementById('anime-container');
    const loadingSpinner = document.getElementById('loadingSpinner');

    async function showRandomAnime() {
        if(!animeButton) return;
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        
        
        if (animeContainer) animeContainer.innerHTML = ''; 
        animeButton.style.display = 'none';

        const anime = await fetchRandomAnimeWithFilter(currentGenre);
        
        if (anime && animeContainer) {
            const title = anime.title_english || anime.title;
            const rawSynopsis = anime.synopsis ? anime.synopsis : "Sinopse indisponível.";
            
            
            const translatedSynopsis = await traduzirTexto(rawSynopsis);
            
            const year = anime.year || '?';
            const genres = anime.genres ? anime.genres.map(g => g.name).join(', ') : 'N/A';
            const score = anime.score || 'N/A';
            const episodes = anime.episodes || '?';
            const status = anime.status || 'N/A';
            
           
            let trailerHTML = '';
            if (anime.trailer && anime.trailer.url) {
                trailerHTML = `
                    <a href="${anime.trailer.url}" target="_blank" class="trailer-link" style="margin-right: 15px;">
                        ▶️ Ver Trailer
                    </a>
                `;
            }

            animeContainer.innerHTML = `
                <div class="anime-card professional-card">
                    <div class="card-image-wrapper">
                        <img src="${anime.images.jpg.large_image_url}" alt="${title}" class="card-image">
                    </div>

                    <div class="card-content-wrapper">
                        <div class="card-header">
                            <h2>${title}</h2>
                            
                        </div>
                        
                        <div class="meta">
                            <span>⭐ ${score}</span> |
                            <span>${year}</span> |
                            <span>${episodes} Ep.</span> |
                            <span>${status}</span>
                        </div>

                        <div class="genres">
                            <p><strong>Gêneros:</strong> ${genres}</p>
                        </div>

                        <div class="synopsis-box">
                            <h3 style="margin-top: 15px;">Sinopse Traduzida</h3>
                            <p class="synopsis-text">${translatedSynopsis}</p>
                        </div>

                        <div class="card-actions">
                            ${trailerHTML}
                            <a href="https://www.google.com/search?q=assistir+anime+${encodeURIComponent(title)}+legendado+ptbr" target="_blank" class="btn-link" style="width: 100%;">
                                📺 Onde assistir?
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
        } else if (animeContainer) {
            const genreName = currentGenre ? `de ${currentGenre}` : "";
            animeContainer.innerHTML = `<p>Puxa, não encontrei um anime ${genreName} legal agora. Tente clicar novamente!</p>`;
        }
        
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        animeButton.style.display = 'block';
    }

    if (animeButton) {
        animeButton.addEventListener('click', showRandomAnime);
    }

    /* =================================================================
       5. LÓGICA SAZONAL E TOP 10 (RENDERING PROFISSIONAL)
    ================================================================= */
    function renderSeasonalCards(animeList, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = ''; 

        animeList.forEach(anime => {
            const title = anime.title_english || anime.title;
            const score = anime.score || 'N/A';
            // Usando LARGE_IMAGE_URL para melhor qualidade no card
            const image = anime.images.jpg.large_image_url; 
            const episodes = anime.episodes || '?';
            
            const infoBadge = containerId.includes('upcoming') 
                ? `<span class="seasonal-release-badge">📅 ${anime.aired.string.split(' to ')[0].trim()}</span>` 
                : `<span class="seasonal-score-badge">⭐ ${score}</span>`;

            container.innerHTML += `
                <div class="seasonal-card professional-seasonal-card">
                    <img src="${image}" alt="${title}" class="seasonal-img">
                    <div class="seasonal-content">
                        <div class="seasonal-info-top">
                            <h4 class="seasonal-title">${title}</h4>
                        </div>
                        <div class="seasonal-info-bottom">
                            <p class="seasonal-episodes">Episódios: ${episodes}</p>
                            ${infoBadge}
                            <a href="https://myanimelist.net/anime/${anime.mal_id}" target="_blank" class="seasonal-link">Ver Detalhes</a>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    
    async function fetchSeasonalData(endpoint, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
       
        const url = `https://api.jikan.moe/v4/seasons/${endpoint}?filter=tv&limit=10`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erro na API Jikan (Sazonal)');
            
            const data = await response.json();
            renderSeasonalCards(data.data, containerId);

        } catch (error) {
            console.error("Erro ao carregar dados sazonais:", error);
            container.innerHTML = `<p style="color: #f44336; text-align:center;">Não foi possível carregar os dados da temporada agora.</p>`;
        }
    }

    
    function loadSeasonalData() {
        
        fetchSeasonalData('now', 'current-season-container');
        
        fetchSeasonalData('upcoming', 'upcoming-season-container');
    }

    /* =================================================================
       6. LÓGICA DO MENU HAMBÚRGUER (MOBILE)
    ================================================================= */
    const navbarMenu = document.getElementById("menu");
    const burgerMenu = document.getElementById("burger");

    if (burgerMenu && navbarMenu) {
        burgerMenu.addEventListener("click", () => {
            burgerMenu.classList.toggle("is-active");
            navbarMenu.classList.toggle("is-active");
        });
    }
    document.querySelectorAll(".menu-link").forEach((link) => {
        link.addEventListener("click", () => {
            if(burgerMenu) burgerMenu.classList.remove("is-active");
            if(navbarMenu) navbarMenu.classList.remove("is-active");
        });
    });

    /* =================================================================
       7. LÓGICA DO TEMA (DARK MODE)
    ================================================================= */
    const toggleBtn = document.getElementById("theme-toggle");
    const html = document.documentElement;
    
    
    const sunIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>`;
    
    const moonIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>`;

    function updateIcon(theme) {
        if (!toggleBtn) return;
        toggleBtn.innerHTML = theme === "dark" ? sunIcon : moonIcon;
    }

    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme) {
        html.setAttribute("data-theme", savedTheme);
        updateIcon(savedTheme);
    } else {
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (systemDark) {
            html.setAttribute("data-theme", "dark");
            updateIcon("dark");
        } else {
            updateIcon("light");
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const currentTheme = html.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            
            html.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            updateIcon(newTheme);
        });
    }

    
    loadSeasonalData();
});
