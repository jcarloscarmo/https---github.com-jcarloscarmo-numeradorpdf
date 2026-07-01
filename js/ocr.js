document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const fileInputBtn = document.getElementById('file-input-button');
    const dropZone = document.getElementById('file-drop-zone');
    
    const procBox = document.getElementById('processing-box');
    const progBar = document.getElementById('progress-bar');
    const progText = document.getElementById('progress-text');
    
    const resultBox = document.getElementById('result-box');
    const imgPreview = document.getElementById('image-preview');
    const textOutput = document.getElementById('text-output');
    const btnCopiar = document.getElementById('btn-copiar');

    fileInputBtn.addEventListener('click', () => fileInput.click());

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        dropZone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if(e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        if(!file || !file.type.startsWith('image/')) {
            alert('Por favor, selecione um arquivo de imagem (JPG ou PNG).');
            return;
        }

        // Mostrar preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imgPreview.src = e.target.result;
            // Garantir que a box de resultado comece visível para o preview
            resultBox.style.display = 'grid';
            textOutput.value = '';
        }
        reader.readAsDataURL(file);

        // Iniciar OCR
        dropZone.style.display = 'none';
        procBox.style.display = 'block';
        progBar.style.width = '0%';
        progText.textContent = 'Iniciando IA... (Pode demorar na primeira vez para baixar os dicionários)';

        Tesseract.recognize(
            file,
            'por', // Português
            { logger: m => {
                if (m.status === 'recognizing text') {
                    const pct = Math.round(m.progress * 100);
                    progBar.style.width = `${pct}%`;
                    progText.textContent = `Lendo texto... ${pct}%`;
                } else if (m.status === 'loading tesseract core') {
                    progText.textContent = 'Carregando núcleo da Inteligência Artificial...';
                } else if (m.status === 'loading language traineddata') {
                    progText.textContent = 'Carregando dicionário de Português...';
                }
            }}
        ).then(({ data: { text } }) => {
            procBox.style.display = 'none';
            textOutput.value = text;
            dropZone.style.display = 'block'; // permite enviar outra
            
            // Rola até o resultado
            resultBox.scrollIntoView({ behavior: 'smooth' });
        }).catch(err => {
            console.error(err);
            procBox.style.display = 'none';
            dropZone.style.display = 'block';
            alert('Ocorreu um erro ao ler a imagem. Tente outra foto mais nítida.');
        });
    }

    btnCopiar.addEventListener('click', () => {
        if(!textOutput.value) return;
        navigator.clipboard.writeText(textOutput.value).then(() => {
            const originalText = btnCopiar.textContent;
            btnCopiar.textContent = 'Copiado!';
            btnCopiar.style.backgroundColor = '#2ecc71';
            btnCopiar.style.borderColor = '#2ecc71';
            setTimeout(() => {
                btnCopiar.textContent = originalText;
                btnCopiar.style.backgroundColor = '';
                btnCopiar.style.borderColor = '';
            }, 2000);
        });
    });
});
