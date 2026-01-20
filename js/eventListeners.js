// js/eventListeners.js

// Aciona o input de arquivo ao clicar nos botões
fileInputButton.addEventListener('click', () => fileInput.click());

// Lida com o clique no botão da Hero: Rola suavemente até a ferramenta
document.querySelector('.hero .button-primary').addEventListener('click', (e) => {
    e.preventDefault();
    const toolSection = document.getElementById('ferramenta');
    if (toolSection) {
        toolSection.scrollIntoView({ behavior: 'smooth' });
    }
});

// Lida com a seleção de arquivos via diálogo
fileInput.addEventListener('change', handleFileSelect);

// Lida com o clique no botão de gerar
generateBtn.addEventListener('click', generateAndDownloadFiles);

// --- Event Listeners para Drag and Drop ---

// Previne o comportamento padrão do navegador para drag and drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    }, false);
});

// Adiciona um feedback visual quando o arquivo está sobre a área
fileDropZone.addEventListener('dragover', () => fileDropZone.classList.add('dragover'));
fileDropZone.addEventListener('dragenter', () => fileDropZone.classList.add('dragover'));

// Remove o feedback visual quando o arquivo sai da área
fileDropZone.addEventListener('dragleave', () => fileDropZone.classList.remove('dragover'));
fileDropZone.addEventListener('drop', () => fileDropZone.classList.remove('dragover'));

// Lida com os arquivos soltos na área
fileDropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFileSelect({ target: { files } }); // Reutiliza a função existente
});

// Rolagem suave para links de âncora
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetElement = document.querySelector(this.getAttribute('href'));
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});