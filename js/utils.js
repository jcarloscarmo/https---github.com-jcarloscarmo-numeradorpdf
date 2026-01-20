// js/utils.js

// --- Função Auxiliar de Cores (Usada no Bates) ---
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return PDFLib.rgb(r, g, b);
}

// --- MODAL DE ERRO (ARQUIVO PROTEGIDO/GOV.BR) ---
// Injeta o CSS do modal automaticamente na página
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

// Função Global para chamar o modal
window.showEncryptionHelpModal = function(fileName) {
    // Remove modal anterior se existir
    const existing = document.querySelector('.help-modal-backdrop');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.className = 'help-modal-backdrop';
    
    backdrop.innerHTML = `
        <div class="help-modal">
            <h3>🔒 Arquivo Protegido</h3>
            <p>O arquivo <span class="help-file-name">${fileName}</span> possui uma assinatura digital (ex: Gov.br) ou senha que impede a edição direta.</p>
            <p><strong>Como resolver (Solução Rápida):</strong></p>
            <ol>
                <li>Abra este PDF no Chrome ou Edge.</li>
                <li>Clique em <strong>Imprimir</strong> (<span class="step-highlight">Ctrl + P</span>).</li>
                <li>No destino, escolha <strong>"Salvar como PDF"</strong>.</li>
                <li>Salve com um novo nome e use esse <strong>novo arquivo</strong> aqui.</li>
            </ol>
            <button class="help-modal-btn">Entendi</button>
        </div>
    `;

    document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add('active'));

    const closeBtn = backdrop.querySelector('.help-modal-btn');
    const close = () => {
        backdrop.classList.remove('active');
        setTimeout(() => backdrop.remove(), 300);
    };
    
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
        if(e.target === backdrop) close();
    });

  

// --- NOVA FUNÇÃO: Formatar Tamanho de Arquivo ---
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
};