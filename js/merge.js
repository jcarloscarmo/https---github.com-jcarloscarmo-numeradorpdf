const { PDFDocument } = PDFLib;

// Elementos DOM
const fileInput = document.getElementById('file-input');
const fileInputButton = document.getElementById('file-input-button');
const fileListContainer = document.getElementById('file-list-container');
const fileDropZone = document.getElementById('file-drop-zone');
const generateBtn = document.getElementById('generate-btn');
const statusMessage = document.getElementById('status-message');
const outputNameInput = document.getElementById('output-name');
const heroCta = document.getElementById('hero-cta');

let selectedFiles = [];

// --- Event Listeners ---
fileInputButton.addEventListener('click', () => fileInput.click());
if(heroCta) heroCta.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', handleFileSelect);

// AQUI: Conectamos o botão ao Modal do Pix
generateBtn.addEventListener('click', generateAndDownloadFiles);

// Drag and Drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileDropZone.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
});
fileDropZone.addEventListener('dragover', () => fileDropZone.classList.add('dragover'));
fileDropZone.addEventListener('dragleave', () => fileDropZone.classList.remove('dragover'));
fileDropZone.addEventListener('drop', (e) => {
    fileDropZone.classList.remove('dragover');
    handleFileSelect({ target: { files: e.dataTransfer.files } });
});

// --- Funções Lógicas ---

function handleFileSelect(event) {
    const newFiles = Array.from(event.target.files);
    selectedFiles = [...selectedFiles, ...newFiles];
    displayFiles();
    event.target.value = ''; 
}

// ... imports e variáveis iniciais ...

function displayFiles() {
    fileListContainer.innerHTML = '';
    
    if (selectedFiles.length > 0) {
        // Cabeçalho opcional ou apenas a lista direta
        const p = document.createElement('p');
        p.textContent = `${selectedFiles.length} arquivos prontos para unir:`;
        p.style.marginBottom = '12px';
        p.style.fontWeight = '500';
        p.style.color = '#666';
        fileListContainer.appendChild(p);

        selectedFiles.forEach((file, index) => {
            const card = document.createElement('div');
            card.className = 'file-card';
            
            // Formatamos o tamanho usando a função nova do utils.js
            const fileSize = typeof formatBytes === 'function' ? formatBytes(file.size) : Math.round(file.size/1024) + ' KB';

            // HTML Rico com ícones SVG (Lucide style)
            card.innerHTML = `
                <div class="file-card-info">
                    <div class="file-icon-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>
                    </div>
                    <div class="file-details">
                        <span class="file-name" title="${file.name}">${index + 1}. ${file.name}</span>
                        <span class="file-meta">
                            <span>${fileSize}</span>
                        </span>
                    </div>
                </div>

                <div class="file-card-actions">
                    <button class="action-btn" onclick="moveFile(${index}, -1)" title="Mover para Cima" ${index === 0 ? 'disabled style="opacity:0.3; cursor:default;"' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
                    </button>
                    
                    <button class="action-btn" onclick="moveFile(${index}, 1)" title="Mover para Baixo" ${index === selectedFiles.length - 1 ? 'disabled style="opacity:0.3; cursor:default;"' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </button>

                    <button class="action-btn delete" onclick="removeFile(${index})" title="Remover Arquivo">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                </div>
            `;
            fileListContainer.appendChild(card);
        });
    } else {
        // Estado vazio mais bonito
        fileListContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #999; border: 2px dashed #eee; border-radius: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#eee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14 2z"/></svg>
                <p style="margin-top: 10px;">A lista está vazia.</p>
            </div>
        `;
    }
}

// ... (resto do código igual) ...


// Funções globais para botões HTML inline
window.moveFile = function(index, direction) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < selectedFiles.length) {
        [selectedFiles[index], selectedFiles[newIndex]] = [selectedFiles[newIndex], selectedFiles[index]];
        displayFiles();
    }
};

window.removeFile = function(index) {
    selectedFiles.splice(index, 1);
    displayFiles();
};

// Função Principal de Juntar
async function performMerge() {
    if (selectedFiles.length < 2) {
        alert('Selecione pelo menos 2 arquivos para juntar.');
        return;
    }

    const outputName = outputNameInput.value.trim() || 'arquivo_unido';
    generateBtn.disabled = true;
    statusMessage.textContent = 'Processando fusão...';

    try {
        const mergedPdf = await PDFDocument.create();

        for (const file of selectedFiles) {
            statusMessage.textContent = `Lendo ${file.name}...`;
            const fileBytes = await file.arrayBuffer();
            let sourcePdf;

            try {
                // Tenta carregar normal
                sourcePdf = await PDFDocument.load(fileBytes);
            } catch (err) {
                try {
                    // Tenta senha vazia
                    sourcePdf = await PDFDocument.load(fileBytes, { password: '' });
                } catch (err2) {
                    // ERRO FATAL: Chama o modal do Utils.js
                    if (window.showEncryptionHelpModal) {
                        window.showEncryptionHelpModal(file.name);
                    } else {
                        alert(`Arquivo protegido: ${file.name}`);
                    }
                    throw new Error('Processo interrompido: arquivo protegido.');
                }
            }

            const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
            copiedPages.forEach(p => mergedPdf.addPage(p));
        }

        statusMessage.textContent = 'Gerando PDF Final...';
        const mergedPdfBytes = await mergedPdf.save();

        saveAs(new Blob([mergedPdfBytes], { type: 'application/pdf' }), `${outputName}.pdf`);
        
        statusMessage.textContent = 'Sucesso! Download iniciado.';
        statusMessage.style.color = 'inherit';

    } catch (error) {
        console.error(error);
        if(!statusMessage.textContent.includes('protegido')) {
            statusMessage.textContent = 'Erro: ' + error.message;
            statusMessage.style.color = '#e74c3c';
        }
    } finally {
        generateBtn.disabled = false;
    }
}

// Disparador do Modal Pix + Ação
function generateAndDownloadFiles() {
    // Verifica se a função do modal existe (carregada do thankyou-modal.js)
    if (typeof openThankYouSupportModal === 'function') {
        openThankYouSupportModal({
            qrImageUrl: 'assets/qrcode.jpg', // Certifique-se que essa imagem existe
            paymentKey: '690be209-2356-4000-9c14-6a060b4803b4',
            onHelped: () => { 
                // Callback: roda quando o usuário fecha o modal ou clica em "Já ajudei"
                performMerge(); 
            }
        });
    } else {
        // Fallback caso o script do modal falhe
        performMerge();
    }
}