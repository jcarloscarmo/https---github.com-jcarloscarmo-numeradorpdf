document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('text-input');
    const outputArea = document.getElementById('text-output');
    const statusMsg = document.getElementById('status-message');

    // Buttons
    const btnLimparTudo = document.getElementById('btn-limpar-tudo');
    const btnQuebras = document.getElementById('btn-quebras');
    const btnEspacos = document.getElementById('btn-espacos');
    const btnMaiusculas = document.getElementById('btn-maiusculas');
    const btnMinusculas = document.getElementById('btn-minusculas');
    const btnPrimeira = document.getElementById('btn-primeira');
    const btnCopiar = document.getElementById('btn-copiar');

    function updateOutput(text) {
        outputArea.value = text;
        showStatus('Texto processado com sucesso!', '#2ecc71');
    }

    function showStatus(msg, color) {
        statusMsg.textContent = msg;
        statusMsg.style.color = color;
        setTimeout(() => { statusMsg.textContent = ''; }, 3000);
    }

    function getText() {
        return inputArea.value;
    }

    // Ações
    btnLimparTudo.addEventListener('click', () => {
        let text = getText();
        if(!text) return;
        // Remove hifens seguidos de quebra de linha (palavras cortadas no PDF)
        text = text.replace(/-\s*(\r\n|\n|\r)/gm, "");
        // Substitui quebras de linha normais por espaço
        text = text.replace(/(\r\n|\n|\r)/gm, " ");
        // Remove espaços duplos
        text = text.replace(/\s+/g, " ");
        updateOutput(text.trim());
    });

    btnQuebras.addEventListener('click', () => {
        let text = getText();
        if(!text) return;
        text = text.replace(/-\s*(\r\n|\n|\r)/gm, "");
        text = text.replace(/(\r\n|\n|\r)/gm, " ");
        updateOutput(text);
    });

    btnEspacos.addEventListener('click', () => {
        let text = getText();
        if(!text) return;
        text = text.replace(/\s+/g, " ");
        updateOutput(text);
    });

    btnMaiusculas.addEventListener('click', () => {
        let text = getText();
        if(!text) return;
        updateOutput(text.toUpperCase());
    });

    btnMinusculas.addEventListener('click', () => {
        let text = getText();
        if(!text) return;
        updateOutput(text.toLowerCase());
    });

    btnPrimeira.addEventListener('click', () => {
        let text = getText();
        if(!text) return;
        text = text.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
        updateOutput(text);
    });

    btnCopiar.addEventListener('click', () => {
        if (!outputArea.value) {
            showStatus('Nada para copiar.', '#e74c3c');
            return;
        }
        navigator.clipboard.writeText(outputArea.value).then(() => {
            showStatus('Texto copiado para a área de transferência!', '#2ecc71');
        }).catch(err => {
            showStatus('Erro ao copiar texto.', '#e74c3c');
        });
    });
});
