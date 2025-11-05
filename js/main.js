const { PDFDocument, rgb, StandardFonts } = PDFLib;

let selectedFiles = [];

function handleFileSelect(event) {
    selectedFiles = Array.from(event.target.files);
    displayFiles(selectedFiles);
    statusMessage.textContent = '';
}

function displayFiles(files) {
    fileList.innerHTML = '';
    if (files.length > 0) {
        const h3 = document.createElement('h3');
        h3.textContent = 'Arquivos Selecionados:';
        fileList.appendChild(h3);
        const ul = document.createElement('ul');
        for (const file of files) {
            const li = document.createElement('li');
            li.textContent = file.name;
            ul.appendChild(li);
        }
        fileList.appendChild(ul);
    }
}

function updateStampPreview() {
    const prefix = prefixInput.value;
    const startNumber = startNumberInput.value;
    const digits = parseInt(digitsInput.value, 10);
    if (isNaN(digits)) return;
    const paddedNumber = startNumber.padStart(digits, '0');
    stampPreview.textContent = prefix + paddedNumber;

    stampPreview.style.fontSize = `${fontSizeInput.value}px`;
    stampPreview.style.fontWeight = fontWeightSelect.value;
    stampPreview.style.color = fontColorInput.value;
    stampPreview.style.backgroundColor = bgColorInput.value;

    const selectedPosition = document.querySelector('input[name="position"]:checked').value;
    stampPreview.className = 'stamp ' + selectedPosition;
}

async function generateAndDownloadFiles() {
    if (selectedFiles.length === 0) {
        alert('Por favor, selecione um ou mais arquivos PDF primeiro.');
        return;
    }

    const zipName = zipNameInput.value.trim();
    if (!zipName) {
        alert('Por favor, insira um nome para o arquivo ZIP.');
        return;
    }

    generateBtn.disabled = true;
    statusMessage.textContent = 'Iniciando processo...';

    const zip = new JSZip();
    let batesCounter = parseInt(startNumberInput.value, 10);

    try {
        for (const file of selectedFiles) {
            statusMessage.textContent = `Processando ${file.name}...`;
            const existingPdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const font = await pdfDoc.embedFont(fontWeightSelect.value === 'bold' ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);

            const pages = pdfDoc.getPages();
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const { width, height } = page.getSize();
                const batesNumber = `${prefixInput.value}${String(batesCounter).padStart(parseInt(digitsInput.value, 10), '0')}`;
                
                const textWidth = font.widthOfTextAtSize(batesNumber, parseInt(fontSizeInput.value, 10));
                const textHeight = font.heightAtSize(parseInt(fontSizeInput.value, 10));
                const padding = 5;

                const position = document.querySelector('input[name="position"]:checked').value;
                let x, y;

                const isLandscape = width > height;

                if (isLandscape) {
                    switch (position) {
                        case 'top-left':
                            x = padding;
                            y = height - textHeight - padding;
                            break;
                        case 'top-center':
                            x = width / 2 - textWidth / 2;
                            y = height - textHeight - padding;
                            break;
                        case 'top-right':
                            x = width - textWidth - padding;
                            y = height - textHeight - padding;
                            break;
                        case 'bottom-left':
                            x = padding;
                            y = padding;
                            break;
                        case 'bottom-center':
                            x = width / 2 - textWidth / 2;
                            y = padding;
                            break;
                        case 'bottom-right':
                            x = width - textWidth - padding;
                            y = padding;
                            break;
                    }
                } else {
                    if (position.includes('left')) x = padding;
                    if (position.includes('center')) x = width / 2 - textWidth / 2;
                    if (position.includes('right')) x = width - textWidth - padding;
                    if (position.includes('top')) y = height - textHeight - padding;
                    if (position.includes('bottom')) y = padding;
                }

                page.drawRectangle({
                    x: x - padding,
                    y: y - padding / 2,
                    width: textWidth + (padding * 2),
                    height: textHeight + padding,
                    color: hexToRgb(bgColorInput.value),
                });

                page.drawText(batesNumber, {
                    x: x,
                    y: y,
                    font: font,
                    size: parseInt(fontSizeInput.value, 10),
                    color: hexToRgb(fontColorInput.value),
                });

                batesCounter++;
            }

            const pdfBytes = await pdfDoc.save();
            zip.file(file.name, pdfBytes);
        }

        statusMessage.textContent = `Gerando arquivo ${zipName}.zip...`;
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${zipName}.zip`);
        statusMessage.textContent = 'Processo concluído com sucesso!';

    } catch (error) {
        console.error(error);
        statusMessage.textContent = 'Ocorreu um erro: ' + error.message;
    } finally {
        generateBtn.disabled = false;
    }
}

updateStampPreview();
