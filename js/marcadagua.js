const { PDFDocument, StandardFonts, degrees } = PDFLib;

const fileInput = document.getElementById('file-input');
const fileInputButton = document.getElementById('file-input-button');
const fileListContainer = document.getElementById('file-list-container');
const fileDropZone = document.getElementById('file-drop-zone');
const generateBtn = document.getElementById('generate-btn');
const forceGenerateBtn = document.getElementById('force-generate-btn');
const statusMessage = document.getElementById('status-message');
const heroCta = document.getElementById('hero-cta');

const textInput = document.getElementById('watermark-text');
const fontSizeInput = document.getElementById('font-size');
const fontColorInput = document.getElementById('font-color');
const opacityInput = document.getElementById('opacity');
const zipNameInput = document.getElementById('zip-name');

if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

let selectedFiles = [];

fileInputButton.addEventListener('click', () => fileInput.click());
if(heroCta) heroCta.addEventListener('click', () => { document.getElementById('ferramenta').scrollIntoView({ behavior: 'smooth' }); });

fileInput.addEventListener('change', handleFileSelect);
generateBtn.addEventListener('click', () => processWatermark(false));
forceGenerateBtn.addEventListener('click', () => processWatermark(true));

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
    selectedFiles = Array.from(event.target.files);
    selectedFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
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
    }
}

async function processWatermark(forceRasterize) {
    if (selectedFiles.length === 0) {
        alert('Selecione arquivos PDF primeiro.');
        return;
    }

    const zipName = zipNameInput.value.trim() || 'documentos_marcados';
    generateBtn.disabled = true;
    forceGenerateBtn.disabled = true;
    statusMessage.textContent = forceRasterize ? 'Processando (Rasterização)...' : 'Processando...';

    const zip = new JSZip();
    let lastPdfBytes;

    const watermarkText = textInput.value || 'CONFIDENCIAL';
    const fontSize = parseInt(fontSizeInput.value, 10) || 60;
    const opacityValue = (parseInt(opacityInput.value, 10) || 30) / 100;
    const colorRGB = typeof hexToRgb !== 'undefined' ? hexToRgb(fontColorInput.value) : { r:0, g:0, b:0 }; // fallback if utils missing

    try {
        for (const file of selectedFiles) {
            statusMessage.textContent = `Marcando ${file.name}...`;
            const fileBytes = await file.arrayBuffer();
            let pdfDoc;

            if (forceRasterize) {
                const pdfData = new Uint8Array(fileBytes);
                const loadingTask = pdfjsLib.getDocument({data: pdfData});
                const pdfDocjs = await loadingTask.promise;
                pdfDoc = await PDFDocument.create();
                
                for (let i = 1; i <= pdfDocjs.numPages; i++) {
                    const pageJs = await pdfDocjs.getPage(i);
                    const viewport = pageJs.getViewport({scale: 2.0});
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await pageJs.render({ canvasContext: ctx, viewport: viewport }).promise;
                    
                    const imgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
                    const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());
                    const image = await pdfDoc.embedJpg(imgBytes);
                    
                    const originalViewport = pageJs.getViewport({scale: 1.0});
                    const newPage = pdfDoc.addPage([originalViewport.width, originalViewport.height]);
                    newPage.drawImage(image, { x: 0, y: 0, width: originalViewport.width, height: originalViewport.height });
                }
            } else {
                let sourcePdf;
                try {
                    sourcePdf = await PDFDocument.load(fileBytes);
                } catch (err) {
                    try {
                        sourcePdf = await PDFDocument.load(fileBytes, { password: '' });
                    } catch (err2) {
                        throw new Error('Arquivo protegido. Use o botão Forçar Numeração.');
                    }
                }
                pdfDoc = await PDFDocument.create();
                const copiedPages = await pdfDoc.copyPages(sourcePdf, sourcePdf.getPageIndices());
                copiedPages.forEach(p => pdfDoc.addPage(p));
            }

            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const pages = pdfDoc.getPages();
            
            for (const page of pages) {
                const { width, height } = page.getSize();
                const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
                const textHeight = font.heightAtSize(fontSize);

                page.drawText(watermarkText, {
                    x: width / 2 - textWidth / 2,
                    y: height / 2 - textHeight / 2,
                    font: font,
                    size: fontSize,
                    color: PDFLib.rgb(colorRGB.r, colorRGB.g, colorRGB.b),
                    opacity: opacityValue,
                    rotate: degrees(45),
                    x: (width / 2) - ((textWidth * Math.cos(Math.PI/4)) / 2) + ((textHeight * Math.sin(Math.PI/4)) / 2),
                    y: (height / 2) - ((textWidth * Math.sin(Math.PI/4)) / 2) - ((textHeight * Math.cos(Math.PI/4)) / 2)
                });
            }

            lastPdfBytes = await pdfDoc.save();
            zip.file(file.name, lastPdfBytes);
        }

        if (selectedFiles.length > 1) {
            statusMessage.textContent = 'Gerando ZIP...';
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${zipName}.zip`);
        } else {
            const fileName = selectedFiles[0].name.replace(/\.pdf$/i, '_marcado.pdf');
            saveAs(new Blob([lastPdfBytes], { type: 'application/pdf' }), fileName);
        }
        statusMessage.textContent = 'Concluído!';
        statusMessage.style.color = 'inherit';

    } catch (error) {
        console.error(error);
        statusMessage.textContent = 'Erro: ' + error.message;
        statusMessage.style.color = '#e74c3c';
    } finally {
        generateBtn.disabled = false;
        forceGenerateBtn.disabled = false;
    }
}
