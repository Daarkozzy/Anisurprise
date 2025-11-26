document.addEventListener('DOMContentLoaded', () => {
    
    /* =================================================================
       1. LÓGICA DE SELEÇÃO DE GÊNERO (NOVOS BOTÕES/CHIPS)
    ================================================================= */
    let currentGenre = ""; // Variável que guarda o gênero escolhido
    const genreButtons = document.querySelectorAll('.genre-btn');
    
    // Adiciona o evento de clique em cada botão de gênero
    genreButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove a classe 'active' de todos os botões (apaga o laranja)
            genreButtons.forEach(b => b.classList.remove('active'));
            
            // Adiciona 'active' apenas no botão clicado (acende o laranja)
            btn.classList.add('active');
            
            // Atualiza a variável com o valor do gênero (ex: "horror", "action")
            currentGenre = btn.getAttribute('data-value');
        });
    });

    /* =================================================================
       2. LÓGICA DO ANIME (API JIKAN)
    ================================================================= */
    const animeButton = document.getElementById('anime-button');
    const animeContainer = document.getElementById('anime-container');
    const loadingSpinner = document.getElementById('loadingSpinner');

    async function fetchRandomAnimeWithFilter(genre) {
        try {
            let anime;
            let attempts = 0;
            const maxAttempts = 15; // Tenta 15 vezes achar o gênero antes de desistir

            do {
                attempts++;
                // Busca um anime aleatório na API
                const response = await fetch('https://api.jikan.moe/v4/random/anime');
                
                if (!response.ok) throw new Error('Erro na API');
                
                const data = await response.json();
                anime = data.data;

                // FILTRAGEM: Verifica se o anime tem o gênero escolhido
                if (genre && anime.genres) {
                    const hasGenre = anime.genres.some(g => g.name.toLowerCase() === genre.toLowerCase());
                    // Se não tiver o gênero, descarta e tenta de novo
                    if (!hasGenre) anime = null;
                }
                
                // Se atingir o limite de tentativas, para para não travar o site
                if (attempts >= maxAttempts) return null;

            } while (!anime || anime.type !== 'TV'); // Garante que seja uma série de TV (não filme/OVA)

            return anime;
        } catch (error) {
            console.error('Erro ao buscar anime:', error);
            return null;
        }
    }

    async function showRandomAnime() {
        if(!animeButton) return;

        // Mostra o spinner e limpa o container anterior
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (animeContainer) animeContainer.innerHTML = ''; 

        // Chama a função de busca passando o gênero selecionado nos botões
        const anime = await fetchRandomAnimeWithFilter(currentGenre);
        
        // Exibe o resultado na tela
        if (anime && animeContainer) {
            animeContainer.innerHTML = `
                <h2>${anime.title}</h2>
                <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" style="max-width: 100%; height: 300px; margin-top: 15px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <div style="margin-top: 15px;">
                    <p style="font-size: 1rem;">Nota: <strong>${anime.score || 'N/A'}</strong> ⭐</p>
                    <p style="font-size: 0.9rem; opacity: 0.8;">Episódios: ${anime.episodes || '?'}</p>
                    <p style="font-size: 0.8rem; margin-top: 5px; color: var(--header-bg);">${anime.year || ''}</p>
                </div>
            `;
        } else if (animeContainer) {
            // Mensagem caso não encontre nada após 15 tentativas
            const genreName = currentGenre ? `de ${currentGenre}` : "";
            animeContainer.innerHTML = `<p>Puxa, não encontrei um anime ${genreName} legal agora. Tente clicar novamente!</p>`;
        }
        
        // Esconde o spinner
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }

    if (animeButton) {
        animeButton.addEventListener('click', showRandomAnime);
    }

    /* =================================================================
       3. LÓGICA DO MENU HAMBÚRGUER (MOBILE)
    ================================================================= */
    const navbarMenu = document.getElementById("menu");
    const burgerMenu = document.getElementById("burger");

    if (burgerMenu && navbarMenu) {
        burgerMenu.addEventListener("click", () => {
            burgerMenu.classList.toggle("is-active");
            navbarMenu.classList.toggle("is-active");
        });
    }

    // Fecha o menu ao clicar em um link
    document.querySelectorAll(".menu-link").forEach((link) => {
        link.addEventListener("click", () => {
            if(burgerMenu) burgerMenu.classList.remove("is-active");
            if(navbarMenu) navbarMenu.classList.remove("is-active");
        });
    });

    /* =================================================================
       4. LÓGICA DO TEMA (DARK MODE)
    ================================================================= */
    const toggleBtn = document.getElementById("theme-toggle");
    const html = document.documentElement;
    
    // Ícones SVG (Sol e Lua)
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
        // Se for dark, mostra o Sol. Se for light, mostra a Lua.
        toggleBtn.innerHTML = theme === "dark" ? sunIcon : moonIcon;
    }

    // Verifica preferência salva ou do sistema
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

    // Evento de clique no botão de tema
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const currentTheme = html.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            
            html.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            updateIcon(newTheme);
        });
    }
});
