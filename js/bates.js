const { PDFDocument, rgb, StandardFonts } = PDFLib;

// Elementos DOM
const fileInput = document.getElementById('file-input');
const fileInputButton = document.getElementById('file-input-button');
const fileListContainer = document.getElementById('file-list-container');
const fileDropZone = document.getElementById('file-drop-zone');
const generateBtn = document.getElementById('generate-btn');
const statusMessage = document.getElementById('status-message');
const heroCta = document.getElementById('hero-cta');

// Inputs de Opções
const prefixInput = document.getElementById('prefix');
const startNumberInput = document.getElementById('start-number');
const incrementStepInput = document.getElementById('increment-step');
const digitsInput = document.getElementById('digits');
const fontSizeInput = document.getElementById('font-size');
const fontColorInput = document.getElementById('font-color');
const bgColorInput = document.getElementById('bg-color');
const zipNameInput = document.getElementById('zip-name');

let selectedFiles = [];

// --- Event Listeners ---
fileInputButton.addEventListener('click', () => fileInput.click());
if(heroCta) heroCta.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('ferramenta').scrollIntoView({ behavior: 'smooth' });
});

fileInput.addEventListener('change', handleFileSelect);
generateBtn.addEventListener('click', generateAndDownloadFiles);

// Drag and Drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileDropZone.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
});
fileDropZone.addEventListener('dragover', () => fileDropZone.classList.add('dragover'));
fileDropZone.addEventListener('dragleave', () => fileDropZone.classList.remove('dragover'));
fileDropZone.addEventListener('drop', (e) => {
    fileDropZone.classList.remove('dragover');
    const dt = e.dataTransfer;
    handleFileSelect({ target: { files: dt.files } });
});

// --- Funções Lógicas ---

function handleFileSelect(event) {
    selectedFiles = Array.from(event.target.files);
    displayFiles();
}

function displayFiles() {
    fileListContainer.innerHTML = '';
    if (selectedFiles.length > 0) {
        const p = document.createElement('p');
        p.textContent = `${selectedFiles.length} arquivo(s) selecionado(s):`;
        fileListContainer.appendChild(p);
        const ul = document.createElement('ul');
        selectedFiles.forEach(file => {
            const li = document.createElement('li');
            li.textContent = file.name;
            ul.appendChild(li);
        });
        fileListContainer.appendChild(ul);
    } else {
        fileListContainer.innerHTML = '<p>Nenhum arquivo selecionado.</p>';
    }
}

async function performBatesNumbering() {
    if (selectedFiles.length === 0) {
        alert('Selecione arquivos PDF primeiro.');
        return;
    }

    const zipName = zipNameInput.value.trim() || 'arquivos_numerados';
    generateBtn.disabled = true;
    statusMessage.textContent = 'Processando...';

    const zip = new JSZip();
    let batesCounter = parseInt(startNumberInput.value, 10);
    const incrementStep = parseInt(incrementStepInput.value, 10) || 1;
    let lastPdfBytes;

    try {
        for (const file of selectedFiles) {
            statusMessage.textContent = `Numerando ${file.name}...`;
            
            const fileBytes = await file.arrayBuffer();
            let sourcePdf;

            // Tenta abrir (lidando com criptografia simples)
            try {
                sourcePdf = await PDFDocument.load(fileBytes);
            } catch (err) {
                try {
                    sourcePdf = await PDFDocument.load(fileBytes, { password: '' });
                } catch (err2) {
                    if (typeof showEncryptionHelpModal === 'function') {
                        showEncryptionHelpModal(file.name);
                    } else {
                        alert(`Arquivo protegido: ${file.name}`);
                    }
                    throw new Error('Interrompido por proteção de arquivo.');
                }
            }

            // Sanitização (Cria novo doc)
            const pdfDoc = await PDFDocument.create();
            const copiedPages = await pdfDoc.copyPages(sourcePdf, sourcePdf.getPageIndices());
            copiedPages.forEach(p => pdfDoc.addPage(p));

            // Carimbo
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const { width, height } = page.getSize();
                const batesNumber = `${prefixInput.value}${String(batesCounter).padStart(parseInt(digitsInput.value, 10), '0')}`;
                
                const fontSize = parseInt(fontSizeInput.value, 10);
                const textWidth = font.widthOfTextAtSize(batesNumber, fontSize);
                const textHeight = font.heightAtSize(fontSize);
                const padding = 5;

                const position = document.querySelector('input[name="position"]:checked').value;
                let x, y;

                if (position.includes('left')) x = padding;
                if (position.includes('center')) x = width / 2 - textWidth / 2;
                if (position.includes('right')) x = width - textWidth - padding;
                if (position.includes('top')) y = height - textHeight - padding;
                if (position.includes('bottom')) y = padding;

                page.drawRectangle({
                    x: x - padding,
                    y: y - padding / 2,
                    width: textWidth + (padding * 2),
                    height: textHeight + padding,
                    color: hexToRgb(bgColorInput.value), // Requer utils.js
                });

                page.drawText(batesNumber, {
                    x: x, y: y,
                    font: font, size: fontSize,
                    color: hexToRgb(fontColorInput.value),
                });

                batesCounter += incrementStep;
            }

            lastPdfBytes = await pdfDoc.save();
            zip.file(file.name, lastPdfBytes);
        }

        // Finalização
        if (selectedFiles.length > 1) {
            statusMessage.textContent = 'Gerando ZIP...';
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${zipName}.zip`);
        } else {
            const fileName = selectedFiles[0].name.replace(/\.pdf$/i, '_numerado.pdf');
            saveAs(new Blob([lastPdfBytes], { type: 'application/pdf' }), fileName);
        }
        statusMessage.textContent = 'Concluído!';
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

// Handler do Modal
function generateAndDownloadFiles() {
    if (typeof openThankYouSupportModal === 'function') {
        openThankYouSupportModal({
            qrImageUrl: 'assets/qrcode.jpg',
            paymentKey: '690be209-2356-4000-9c14-6a060b4803b4',
            onHelped: () => { performBatesNumbering(); }
        });
    } else {
        performBatesNumbering();
    }
}