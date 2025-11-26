document.addEventListener('DOMContentLoaded', () => {
    
    /* =================================================================
       1. LÓGICA DO ANIME (API)
    ================================================================= */
    const animeButton = document.getElementById('anime-button');
    const animeContainer = document.getElementById('anime-container');
    const genreSelect = document.getElementById('genre-select');
    const loadingSpinner = document.getElementById('loadingSpinner');

    async function fetchRandomAnimeWithFilter(genre) {
        try {
            let anime;
            let attempts = 0;
            const maxAttempts = 10; // Segurança para não travar o navegador

            do {
                attempts++;
                const response = await fetch('https://api.jikan.moe/v4/random/anime');
                
                if (!response.ok) throw new Error('Erro na API');
                
                const data = await response.json();
                anime = data.data;

                // Verifica se tem gênero e se bate com o filtro
                if (genre && anime.genres) {
                    const hasGenre = anime.genres.some(g => g.name.toLowerCase() === genre.toLowerCase());
                    if (!hasGenre) anime = null;
                }
                
                // Se tentou 10 vezes e não achou, para para não travar
                if (attempts >= maxAttempts) {
                    console.log("Muitas tentativas, parando busca.");
                    return null;
                }

            } while (!anime || anime.type !== 'TV'); 

            return anime;
        } catch (error) {
            console.error('Erro ao buscar anime:', error);
            return null;
        }
    }

    async function showRandomAnime() {
        if(!animeButton) return; // Segurança

        loadingSpinner.style.display = 'block';
        animeContainer.innerHTML = ''; 

        const selectedGenre = genreSelect ? genreSelect.value : null;
        const anime = await fetchRandomAnimeWithFilter(selectedGenre);
        
        if (anime) {
            animeContainer.innerHTML = `
                <h2>${anime.title}</h2>
                <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" style="max-width: 100%; height: 300px; margin-top: 15px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <p style="margin-top: 10px; font-size: 0.9rem;">Nota: ${anime.score || 'N/A'}</p>
            `;
        } else {
            animeContainer.innerHTML = `<p>Não encontrei um anime desse gênero agora. Tente de novo!</p>`;
        }
        
        loadingSpinner.style.display = 'none';
    }

    if (animeButton) {
        animeButton.addEventListener('click', showRandomAnime);
    }


    /* =================================================================
       2. LÓGICA DO MENU (BURGER)
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
       3. LÓGICA DO TEMA (DARK MODE)
    ================================================================= */
    const toggleBtn = document.getElementById("theme-toggle");
    const html = document.documentElement;
    
    // Ícones SVG
    const sunIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>`;
    
    const moonIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>`;

    // Função interna para atualizar ícone
    function updateIcon(theme) {
        if (!toggleBtn) return;
        if (theme === "dark") {
            toggleBtn.innerHTML = sunIcon;
        } else {
            toggleBtn.innerHTML = moonIcon;
        }
    }

    // Inicialização do Tema
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

    // Evento de Clique do Tema
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

    }

    async function showRandomAnime() {
        
        loadingSpinner.style.display = 'block';
        animeContainer.innerHTML = ''; 

        const selectedGenre = genreSelect.value;
        const anime = await fetchRandomAnimeWithFilter(selectedGenre);
        
        if (anime) {
            animeContainer.innerHTML = `
                <h2>${anime.title}</h2>
                <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" style="max-width: 100%; height: 300px;">
            `;
        }
        
        
        loadingSpinner.style.display = 'none';
    }

    animeButton.addEventListener('click', showRandomAnime);
});


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
        burgerMenu.classList.remove("is-active");
        navbarMenu.classList.remove("is-active");
    });
});
