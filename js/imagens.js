const { PDFDocument } = PDFLib;

const fileInput = document.getElementById('file-input');
const fileInputButton = document.getElementById('file-input-button');
const fileListContainer = document.getElementById('file-list-container');
const fileDropZone = document.getElementById('file-drop-zone');
const generateBtn = document.getElementById('generate-btn');
const statusMessage = document.getElementById('status-message');
const outputNameInput = document.getElementById('output-name');
const heroCta = document.getElementById('hero-cta');

let selectedFiles = [];

fileInputButton.addEventListener('click', () => fileInput.click());
if(heroCta) heroCta.addEventListener('click', () => { document.getElementById('ferramenta').scrollIntoView({ behavior: 'smooth' }); });

fileInput.addEventListener('change', handleFileSelect);
generateBtn.addEventListener('click', performConvert);

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileDropZone.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
});
fileDropZone.addEventListener('dragover', () => fileDropZone.classList.add('dragover'));
fileDropZone.addEventListener('dragleave', () => fileDropZone.classList.remove('dragover'));
fileDropZone.addEventListener('drop', (e) => {
    fileDropZone.classList.remove('dragover');
    handleFileSelect({ target: { files: e.dataTransfer.files } });
});

function handleFileSelect(event) {
    const newFiles = Array.from(event.target.files).filter(file => file.type === 'image/jpeg' || file.type === 'image/png');
    selectedFiles = [...selectedFiles, ...newFiles];
    displayFiles();
    event.target.value = ''; 
}

function displayFiles() {
    fileListContainer.innerHTML = '';
    
    if (selectedFiles.length > 0) {
        const p = document.createElement('p');
        p.textContent = `${selectedFiles.length} imagens prontas para conversão:`;
        p.style.marginBottom = '12px';
        p.style.fontWeight = '500';
        p.style.color = '#666';
        fileListContainer.appendChild(p);

        selectedFiles.forEach((file, index) => {
            const card = document.createElement('div');
            card.className = 'file-card';
            const fileSize = typeof formatBytes === 'function' ? formatBytes(file.size) : Math.round(file.size/1024) + ' KB';

            card.innerHTML = `
                <div class="file-card-info">
                    <div class="file-icon-wrapper" style="background-color: #e3f2fd; color: #1976d2;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                    <div class="file-details">
                        <span class="file-name" title="${file.name}">${index + 1}. ${file.name}</span>
                        <span class="file-meta">${fileSize}</span>
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
        fileListContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #999; border: 2px dashed #eee; border-radius: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#eee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <p style="margin-top: 10px;">Nenhuma imagem adicionada.</p>
            </div>
        `;
    }
}

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

async function performConvert() {
    if (selectedFiles.length === 0) {
        alert('Selecione pelo menos uma imagem.');
        return;
    }

    const outputName = outputNameInput.value.trim() || 'fotos_convertidas';
    generateBtn.disabled = true;
    statusMessage.textContent = 'Processando imagens...';

    try {
        const mergedPdf = await PDFDocument.create();

        for (const file of selectedFiles) {
            statusMessage.textContent = `Embutindo ${file.name}...`;
            const fileBytes = await file.arrayBuffer();
            
            let pdfImage;
            if (file.type === 'image/jpeg') {
                pdfImage = await mergedPdf.embedJpg(fileBytes);
            } else if (file.type === 'image/png') {
                pdfImage = await mergedPdf.embedPng(fileBytes);
            } else {
                continue;
            }

            const { width, height } = pdfImage.scale(1);
            const page = mergedPdf.addPage([width, height]);
            
            page.drawImage(pdfImage, {
                x: 0,
                y: 0,
                width: width,
                height: height
            });
        }

        statusMessage.textContent = 'Gerando PDF Final...';
        const mergedPdfBytes = await mergedPdf.save();

        saveAs(new Blob([mergedPdfBytes], { type: 'application/pdf' }), `${outputName}.pdf`);
        
        statusMessage.textContent = 'Sucesso! Download iniciado.';
        statusMessage.style.color = 'inherit';

    } catch (error) {
        console.error(error);
        statusMessage.textContent = 'Erro ao processar: ' + error.message;
        statusMessage.style.color = '#e74c3c';
    } finally {
        generateBtn.disabled = false;
    }
}
