document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.querySelector('.open-sidebar');
    const closeBtn = document.querySelector('.close-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if(openBtn && closeBtn && sidebar) {
        
        // Verifica se é mobile (width <= 992)
        const isMobile = () => window.innerWidth <= 992;

        openBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que o click se propague
            if (isMobile()) {
                sidebar.classList.toggle('visible');
            } else {
                sidebar.classList.toggle('hidden');
            }
        });
        
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isMobile()) {
                sidebar.classList.remove('visible');
            } else {
                sidebar.classList.add('hidden');
            }
        });
        
        // Fechar a sidebar ao clicar fora dela (no mobile) OU ao clicar na área principal (main-content) em qualquer dispositivo
        document.addEventListener('click', (e) => {
            if (mainContent && mainContent.contains(e.target)) {
                if (isMobile() && sidebar.classList.contains('visible')) {
                    sidebar.classList.remove('visible');
                } else if (!isMobile() && !sidebar.classList.contains('hidden')) {
                    sidebar.classList.add('hidden');
                }
            } else if (isMobile() && sidebar.classList.contains('visible')) {
                if (!sidebar.contains(e.target) && !openBtn.contains(e.target)) {
                    sidebar.classList.remove('visible');
                }
            }
        });
        
        // Ajuste no redimensionamento da tela para evitar estados confusos
        window.addEventListener('resize', () => {
            if (!isMobile()) {
                sidebar.classList.remove('visible');
            } else {
                sidebar.classList.remove('hidden');
            }
        });
    }
});
