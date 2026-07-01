// Função para converter número em reais por extenso
function numeroPorExtenso(numero) {
    if (!numero) return '';
    numero = numero.toString().replace(',', '.');
    let valor = parseFloat(numero);
    if (isNaN(valor)) return '';

    const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const dez_a_dezenove = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    function converteCentena(n) {
        if (n === 100) return "cem";
        let c = Math.floor(n / 100);
        let resto = n % 100;
        let d = Math.floor(resto / 10);
        let u = resto % 10;
        
        let partes = [];
        if (c > 0) partes.push(centenas[c]);
        
        if (d === 1) {
            partes.push(dez_a_dezenove[u]);
        } else {
            if (d > 1) partes.push(dezenas[d]);
            if (u > 0) partes.push(unidades[u]);
        }
        
        return partes.join(" e ");
    }

    let reais = Math.floor(valor);
    let centavos = Math.round((valor - reais) * 100);
    
    let extenso = [];

    if (reais > 0) {
        let milhoes = Math.floor(reais / 1000000);
        let milhares = Math.floor((reais % 1000000) / 1000);
        let cent = reais % 1000;

        if (milhoes > 0) extenso.push(converteCentena(milhoes) + (milhoes === 1 ? " milhão" : " milhões"));
        if (milhares > 0) extenso.push(converteCentena(milhares) + " mil");
        if (cent > 0) extenso.push(converteCentena(cent));
        
        extenso = [extenso.join(" e ") + (reais === 1 ? " real" : " reais")];
    }

    if (centavos > 0) {
        extenso.push(converteCentena(centavos) + (centavos === 1 ? " centavo" : " centavos"));
    }

    if (extenso.length === 0) return "zero reais";
    
    return extenso.join(" e ");
}

document.addEventListener('DOMContentLoaded', () => {
    // Inputs Emissor
    const inputNomeE = document.getElementById('emissor-nome');
    const inputDocE = document.getElementById('emissor-doc');
    const inputEndE = document.getElementById('emissor-end');
    const checkSave = document.getElementById('save-data');
    
    // Logo
    const logoUpload = document.getElementById('logo-upload');
    const logoPreview = document.getElementById('logo-preview');
    let logoBase64 = '';

    // Inputs Pagador e Detalhes
    const inputNomeP = document.getElementById('pagador-nome');
    const inputDocP = document.getElementById('pagador-doc');
    const inputValorN = document.getElementById('valor-num');
    const inputValorE = document.getElementById('valor-extenso');
    const inputRef = document.getElementById('referente');
    const inputCidade = document.getElementById('cidade');
    const inputData = document.getElementById('data-emissao');
    
    const btnImprimir = document.getElementById('btn-imprimir');
    const printArea = document.getElementById('print-area');

    // Auto-preencher valor por extenso
    if(inputValorN && inputValorE) {
        inputValorN.addEventListener('input', () => {
            inputValorE.value = numeroPorExtenso(inputValorN.value);
        });
    }

    // Preenche data de hoje
    if(inputData) {
        const h = new Date();
        inputData.value = `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,'0')}-${String(h.getDate()).padStart(2,'0')}`;
    }

    // Carregar do LocalStorage
    function loadSavedData() {
        const saved = localStorage.getItem('pdfmestre_emissor');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if(data.nome && inputNomeE) inputNomeE.value = data.nome;
                if(data.doc && inputDocE) inputDocE.value = data.doc;
                if(data.end && inputEndE) inputEndE.value = data.end;
                if(data.logo && logoPreview) {
                    logoBase64 = data.logo;
                    logoPreview.innerHTML = `<img src="${logoBase64}" alt="Logo Salva">`;
                }
            } catch(e) { console.error("Erro ao ler dados salvos"); }
        }
    }
    loadSavedData();

    // Upload de Logo
    if (logoUpload) {
        logoUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    logoBase64 = e.target.result;
                    logoPreview.innerHTML = `<img src="${logoBase64}" alt="Sua Logo">`;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Função de Imprimir
    if(btnImprimir) {
        btnImprimir.addEventListener('click', () => {
            if (!inputValorN.value || !inputNomeP.value || !inputNomeE.value) {
                alert("Preencha ao menos o seu nome, o nome do pagador e o valor.");
                return;
            }

            if (checkSave && checkSave.checked) {
                const dataToSave = {
                    nome: inputNomeE.value,
                    doc: inputDocE.value,
                    end: inputEndE.value,
                    logo: logoBase64
                };
                localStorage.setItem('pdfmestre_emissor', JSON.stringify(dataToSave));
            }

            const dateStr = inputData.value ? inputData.value.split('-').reverse().join('/') : '';
            const logoHTML = logoBase64 ? `<img src="${logoBase64}" style="max-height: 80px; max-width: 250px;">` : `<h2>${inputNomeE.value}</h2>`;
            
            const docP = inputDocP.value ? `, inscrito no CPF/CNPJ sob o nº ${inputDocP.value}` : '';
            
            const receiptHTML = `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
                        <div>${logoHTML}</div>
                        <div style="text-align: right;">
                            <h1 style="margin: 0; font-size: 28px; color: #444;">RECIBO</h1>
                            <div style="margin-top: 10px; font-size: 24px; font-weight: bold; background-color: #eee; padding: 5px 15px; border: 1px solid #ccc; display: inline-block;">
                                R$ ${inputValorN.value}
                            </div>
                        </div>
                    </div>

                    <div style="font-size: 18px; line-height: 1.8; text-align: justify; margin-bottom: 50px;">
                        <p>
                            Recebi(emos) de <strong>${inputNomeP.value}</strong>${docP}, 
                            a importância de <strong>${inputValorE.value}</strong>, 
                            referente a <strong>${inputRef.value || 'serviços prestados'}</strong>.
                        </p>
                        <p>Por ser verdade, firmo(amos) o presente recibo para que produza seus efeitos legais.</p>
                    </div>

                    <div style="text-align: center; margin-top: 60px;">
                        <p style="font-size: 16px;">${inputCidade.value || '______________'}, ${dateStr}.</p>
                        <div style="margin-top: 60px;">
                            <div style="border-top: 1px solid #333; width: 60%; margin: 0 auto 10px auto;"></div>
                            <p style="margin: 0; font-weight: bold;">${inputNomeE.value}</p>
                            <p style="margin: 0; font-size: 14px;">${inputDocE.value ? 'CPF/CNPJ: ' + inputDocE.value : ''}</p>
                            <p style="margin: 0; font-size: 14px;">${inputEndE.value}</p>
                        </div>
                    </div>
                </div>
            `;

            printArea.innerHTML = receiptHTML;

            setTimeout(() => {
                window.print();
            }, 300);
        });
    }
});
