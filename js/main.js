const { PDFDocument, rgb, StandardFonts } = PDFLib;

let selectedFiles = [];

// --- INJEÇÃO DE ESTILOS DO MODAL DE AJUDA ---
// Adiciona o CSS necessário para o modal de ajuda dinamicamente
(function addHelpModalStyles() {
    const styleId = 'help-modal-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .help-modal-backdrop {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.6); z-index: 10000;
                display: flex; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.3s ease; pointer-events: none;
            }
            .help-modal-backdrop.active { opacity: 1; pointer-events: all; }
            .help-modal {
                background: var(--bg-card, #fff); color: var(--text-primary, #333);
                padding: 2rem; border-radius: 12px; max-width: 500px; width: 90%;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2); transform: translateY(20px);
                transition: transform 0.3s ease; text-align: left;
            }
            .help-modal-backdrop.active .help-modal { transform: translateY(0); }
            .help-modal h3 { margin-top: 0; color: #e74c3c; display: flex; align-items: center; gap: 10px; }
            .help-modal p { line-height: 1.6; margin-bottom: 1rem; }
            .help-modal ol { padding-left: 20px; margin-bottom: 1.5rem; }
            .help-modal li { margin-bottom: 8px; }
            .help-modal .step-highlight { font-weight: bold; color: var(--primary-color, #007bff); }
            .help-modal-btn {
                background: var(--primary-color, #007bff); color: white; border: none;
                padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 1rem;
                float: right;
            }
            .help-modal-btn:hover { opacity: 0.9; }
            .help-file-name { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #333; }
        `;
        document.head.appendChild(style);
    }
})();

function showEncryptionHelpModal(fileName) {
    // Remove modal anterior se existir
    const existing = document.querySelector('.help-modal-backdrop');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.className = 'help-modal-backdrop';
    
    backdrop.innerHTML = `
        <div class="help-modal">
            <h3>🔒 Arquivo Protegido</h3>
            <p>O arquivo <span class="help-file-name">${fileName}</span> possui uma assinatura digital governamental ou senha que o navegador não consegue editar diretamente.</p>
            <p><strong>Como resolver (Solução Rápida):</strong></p>
            <ol>
                <li>Abra este arquivo PDF no Google Chrome ou Edge.</li>
                <li>Clique em <strong>Imprimir</strong> (ou pressione <span class="step-highlight">Ctrl + P</span>).</li>
                <li>No destino da impressora, escolha <strong>"Salvar como PDF"</strong> ou "Microsoft Print to PDF".</li>
                <li>Salve com um novo nome.</li>
                <li>Use esse <strong>novo arquivo</strong> aqui no sistema.</li>
            </ol>
            <p style="font-size: 0.9em; color: #666;">Isso cria uma cópia limpa e visualmente idêntica, mas desbloqueada para edição. O Processo
             atual foi interrompido, deverá ser feito novamente tudo bem?</p>
            <button class="help-modal-btn">Entendi, vou fazer isso</button>
        </div>
    `;

    document.body.appendChild(backdrop);
    
    // Animação de entrada
    requestAnimationFrame(() => backdrop.classList.add('active'));

    // Fechar modal
    const closeBtn = backdrop.querySelector('.help-modal-btn');
    const close = () => {
        backdrop.classList.remove('active');
        setTimeout(() => backdrop.remove(), 300);
    };
    
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
        if(e.target === backdrop) close();
    });
}

function handleFileSelect(event) {
    selectedFiles = Array.from(event.target.files);
    displayFiles(selectedFiles);
    statusMessage.textContent = '';
}

function displayFiles(files) {
    fileListContainer.innerHTML = '';
    if (files.length > 0) {
        const p = document.createElement('p');
        p.textContent = `${files.length} arquivo(s) selecionado(s):`;
        fileListContainer.appendChild(p);

        const ul = document.createElement('ul');
        for (const file of files) {
            const li = document.createElement('li');
            li.textContent = file.name;
            ul.appendChild(li);
        }
        fileListContainer.appendChild(ul);
    } else {
        const p = document.createElement('p');
        p.textContent = 'Nenhum arquivo selecionado.';
        fileListContainer.appendChild(p);
    }
}

async function performFileGeneration() {
    if (selectedFiles.length === 0) {
        alert('Por favor, selecione um ou mais arquivos PDF primeiro.');
        return;
    }
    const zipName = zipNameInput.value.trim() || 'arquivos_numerados';

    generateBtn.disabled = true;
    statusMessage.textContent = 'Iniciando processo...';

    const zip = new JSZip();
    let batesCounter = parseInt(startNumberInput.value, 10);
    const initialBatesCounter = batesCounter;
    const incrementStep = parseInt(incrementStepInput.value, 10) || 1;
    let lastPdfBytes;
    let totalPageCount = 0;

    try {
        for (const file of selectedFiles) {
            statusMessage.textContent = `Processando ${file.name}...`;
            
            const originalPdfBytes = await file.arrayBuffer();
            let sourcePdfDoc;

            // Tenta carregar o PDF
            try {
                sourcePdfDoc = await PDFDocument.load(originalPdfBytes);
            } catch (err) {
                // Se falhar (ex: pede senha), tenta com senha vazia
                try {
                    sourcePdfDoc = await PDFDocument.load(originalPdfBytes, { password: '' });
                } catch (err2) {
                    // SE FALHAR AQUI: É o caso da criptografia forte (Gov.br / CTPS)
                    console.error("Erro de criptografia:", err2);
                    
                    // Mostra o Modal de Ajuda
                    showEncryptionHelpModal(file.name);
                    
                    // Atualiza status e para a execução para o usuário corrigir
                    statusMessage.textContent = `Erro: O arquivo "${file.name}" está protegido. Siga as instruções na tela.`;
                    statusMessage.style.color = '#e74c3c';
                    generateBtn.disabled = false;
                    return; // Interrompe o loop
                }
            }
            
            // 1. Cria um NOVO documento PDF limpo
            const pdfDoc = await PDFDocument.create();

            // 2. Copia as páginas do original
            const copiedPages = await pdfDoc.copyPages(sourcePdfDoc, sourcePdfDoc.getPageIndices());
            copiedPages.forEach((page) => pdfDoc.addPage(page));

            totalPageCount += pdfDoc.getPageCount();

            // 3. Define a fonte
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

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
                    color: hexToRgb(bgColorInput.value),
                });

                page.drawText(batesNumber, {
                    x: x,
                    y: y,
                    font: font,
                    size: parseInt(fontSizeInput.value, 10),
                    color: hexToRgb(fontColorInput.value),
                });

                batesCounter += incrementStep;
            }

            lastPdfBytes = await pdfDoc.save();
            zip.file(file.name, lastPdfBytes);
        }

        const expectedBatesCounter = initialBatesCounter + (totalPageCount * incrementStep);
        if (batesCounter !== expectedBatesCounter) {
            console.error(`Erro de numeração: O contador Bates final (${batesCounter}) não corresponde ao esperado (${expectedBatesCounter}).`);
            statusMessage.textContent = 'Ocorreu um erro na numeração. Verifique o console.';
            generateBtn.disabled = false;
            return;
        }
        
        if (selectedFiles.length > 1) {
            statusMessage.textContent = `Gerando arquivo ${zipName}.zip...`;
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${zipName}.zip`);
        } else {
            statusMessage.textContent = `Gerando arquivo...`;
            const fileName = selectedFiles[0].name.replace(/\.pdf$/i, '_numerado.pdf');
            saveAs(new Blob([lastPdfBytes], { type: 'application/pdf' }), fileName);
        }

        statusMessage.textContent = 'Processo concluído com sucesso!';
        statusMessage.style.color = 'inherit'; // Reseta cor do status

    } catch (error) {
        console.error(error);
        statusMessage.textContent = 'Ocorreu um erro inesperado: ' + error.message;
        statusMessage.style.color = '#e74c3c';
    } finally {
        generateBtn.disabled = false;
    }
}

async function generateAndDownloadFiles() {
    openThankYouSupportModal({
        qrImageUrl: 'assets/qrcode.jpg',
        paymentKey: '690be209-2356-4000-9c14-6a060b4803b4',
        onHelped: () => {
            performFileGeneration();
        }
    });
}