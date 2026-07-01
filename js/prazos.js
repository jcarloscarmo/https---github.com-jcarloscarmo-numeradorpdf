document.addEventListener('DOMContentLoaded', () => {
    const inputData = document.getElementById('data-publicacao');
    const inputPrazo = document.getElementById('prazo-dias');
    const inputSuspensos = document.getElementById('dias-suspensos');
    const btnCalcular = document.getElementById('btn-calcular');
    const resBox = document.getElementById('resultado-box');
    const outDataFinal = document.getElementById('data-final');
    const outDiaSemana = document.getElementById('dia-semana');

    // Seta data de hoje como padrão corrigida para fuso horário local
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    if (inputData) {
        inputData.value = `${ano}-${mes}-${dia}`;
    }

    const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    if(btnCalcular) {
        btnCalcular.addEventListener('click', () => {
            if (!inputData.value) {
                alert('Por favor, informe a Data da Publicação/Intimação.');
                return;
            }

            const parts = inputData.value.split('-');
            let currentDate = new Date(parts[0], parts[1] - 1, parts[2]);

            let daysToAdd = parseInt(inputPrazo.value, 10) + parseInt(inputSuspensos.value, 10);
            
            while(daysToAdd > 0) {
                currentDate.setDate(currentDate.getDate() + 1);
                const dayOfWeek = currentDate.getDay();
                if(dayOfWeek !== 0 && dayOfWeek !== 6) {
                    daysToAdd--;
                }
            }

            const finalDia = String(currentDate.getDate()).padStart(2, '0');
            const finalMes = String(currentDate.getMonth() + 1).padStart(2, '0');
            const finalAno = currentDate.getFullYear();
            const nomeDia = diasDaSemana[currentDate.getDay()];

            outDataFinal.textContent = `${finalDia}/${finalMes}/${finalAno}`;
            outDiaSemana.textContent = nomeDia;
            
            resBox.style.display = 'block';
        });
    }
});
