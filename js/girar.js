const { PDFDocument, degrees } = PDFLib;

const fileInput = document.getElementById('file-input');
const fileInputButton = document.getElementById('file-input-button');
const fileListContainer = document.getElementById('file-list-container');
const fileDropZone = document.getElementById('file-drop-zone');
const generateBtn = document.getElementById('generate-btn');
const statusMessage = document.getElementById('status-message');
const zipNameInput = document.getElementById('zip-name');
const heroCta = document.getElementById('hero-cta');

let selectedFiles = [];

fileInputButton.addEventListener('click', () => fileInput.click());
if(heroCta) heroCta.addEventListener('click', () => { document.getElementById('ferramenta').scrollIntoView({ behavior: 'smooth' }); });

fileInput.addEventListener('change', handleFileSelect);
generateBtn.addEventListener('click', performRotate);

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

async function performRotate() {
    if (selectedFiles.length === 0) {
        alert('Selecione arquivos PDF primeiro.');
        return;
    }

    const zipName = zipNameInput.value.trim() || 'documentos_girados';
    const rotationValue = parseInt(document.querySelector('input[name="rotation"]:checked').value, 10);
    
    generateBtn.disabled = true;
    statusMessage.textContent = 'Processando...';

    const zip = new JSZip();
    let lastPdfBytes;

    try {
        for (const file of selectedFiles) {
            statusMessage.textContent = `Girando ${file.name}...`;
            const fileBytes = await file.arrayBuffer();
            let pdfDoc;

            try {
                pdfDoc = await PDFDocument.load(fileBytes);
            } catch (err) {
                try {
                    pdfDoc = await PDFDocument.load(fileBytes, { password: '' });
                } catch (err2) {
                    throw new Error(`Arquivo protegido: ${file.name}`);
                }
            }

            const pages = pdfDoc.getPages();
            
            for (const page of pages) {
                const currentRotation = page.getRotation().angle;
                page.setRotation(degrees(currentRotation + rotationValue));
            }

            lastPdfBytes = await pdfDoc.save();
            zip.file(file.name, lastPdfBytes);
        }

        if (selectedFiles.length > 1) {
            statusMessage.textContent = 'Gerando ZIP...';
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${zipName}.zip`);
        } else {
            const fileName = selectedFiles[0].name.replace(/\.pdf$/i, '_girado.pdf');
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
    }
}
