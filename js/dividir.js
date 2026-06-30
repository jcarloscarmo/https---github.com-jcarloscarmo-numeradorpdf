const { PDFDocument } = PDFLib;

const fileInput = document.getElementById('file-input');
const fileInputButton = document.getElementById('file-input-button');
const fileListContainer = document.getElementById('file-list-container');
const fileDropZone = document.getElementById('file-drop-zone');
const generateBtn = document.getElementById('generate-btn');
const statusMessage = document.getElementById('status-message');
const pageRangesInput = document.getElementById('page-ranges');
const outputNameInput = document.getElementById('output-name');
const heroCta = document.getElementById('hero-cta');

let selectedFile = null;

fileInputButton.addEventListener('click', () => fileInput.click());
if(heroCta) heroCta.addEventListener('click', () => { document.getElementById('ferramenta').scrollIntoView({ behavior: 'smooth' }); });
fileInput.addEventListener('change', handleFileSelect);
generateBtn.addEventListener('click', performSplit);

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
    if (event.target.files.length > 0) {
        selectedFile = event.target.files[0];
        fileListContainer.innerHTML = `<p style="font-weight: 500; color: var(--primary-color);">Arquivo selecionado: <br>${selectedFile.name}</p>`;
    }
}

function parsePageRanges(rangesStr, maxPages) {
    if (!rangesStr.trim()) {
        const all = [];
        for(let i=0; i<maxPages; i++) all.push(i);
        return all;
    }

    const pagesToExtract = new Set();
    const parts = rangesStr.split(',');
    
    for (const part of parts) {
        const p = part.trim();
        if (p.includes('-')) {
            const [start, end] = p.split('-').map(n => parseInt(n.trim(), 10));
            if (!isNaN(start) && !isNaN(end) && start <= end) {
                for (let i = start; i <= end; i++) {
                    if (i >= 1 && i <= maxPages) pagesToExtract.add(i - 1);
                }
            }
        } else {
            const num = parseInt(p, 10);
            if (!isNaN(num) && num >= 1 && num <= maxPages) {
                pagesToExtract.add(num - 1);
            }
        }
    }
    
    return Array.from(pagesToExtract).sort((a, b) => a - b);
}

async function performSplit() {
    if (!selectedFile) {
        alert('Selecione um arquivo PDF primeiro.');
        return;
    }

    generateBtn.disabled = true;
    statusMessage.textContent = 'Processando...';

    try {
        const fileBytes = await selectedFile.arrayBuffer();
        let sourcePdf;
        
        try {
            sourcePdf = await PDFDocument.load(fileBytes);
        } catch (err) {
            try {
                sourcePdf = await PDFDocument.load(fileBytes, { password: '' });
            } catch (err2) {
                alert(`O arquivo está protegido por senha ou assinatura digital forte. Extração falhou.`);
                throw new Error('Arquivo protegido');
            }
        }

        const maxPages = sourcePdf.getPageCount();
        const pagesToExtract = parsePageRanges(pageRangesInput.value, maxPages);

        if (pagesToExtract.length === 0) {
            alert('Intervalo inválido ou fora dos limites do documento.');
            generateBtn.disabled = false;
            statusMessage.textContent = '';
            return;
        }

        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(sourcePdf, pagesToExtract);
        copiedPages.forEach(p => newPdf.addPage(p));

        const finalBytes = await newPdf.save();
        const outName = outputNameInput.value.trim() || 'arquivo_extraido';
        
        saveAs(new Blob([finalBytes], { type: 'application/pdf' }), `${outName}.pdf`);
        
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
