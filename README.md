# 📄 PDF Mestre

**Sua suíte completa e gratuita para documentos jurídicos: Numeração Bates e Fusão de PDFs.**

O **PDF Mestre** é uma ferramenta web desenvolvida para advogados, escritórios e profissionais que lidam com grandes volumes de documentos. Diferente de outros sites, **todo o processamento é feito no seu navegador (Client-Side)**. Isso significa que seus arquivos confidenciais **nunca** são enviados para um servidor externo.

![status](https://img.shields.io/badge/status-active-brightgreen)
![privacy](https://img.shields.io/badge/privacy-100%25%20client--side-blueviolet)
![license](https://img.shields.io/badge/license-MIT-blue)
![made-with](https://img.shields.io/badge/made%20with-HTML%2FCSS%2FJS-orange)

---

## ✨ Funcionalidades Principais

### 1. 🔢 Numeração Bates (Bates Stamping)
Ideal para Discovery e produção de provas.
- **Sequencial:** Configurável (`000001`, `000002`...)
- **Personalizável:** Prefixo/Sufixo (ex: `PROCESSO-01-00001`)
- **Posição:** Escolha entre os 6 cantos da página.
- **Estilo:** Ajuste cor, tamanho da fonte e cor de fundo.
- **Suporte a Lotes:** Numere dezenas de arquivos de uma vez.

### 2. 📎 Juntar PDFs (Merge)
Organize seus anexos antes de protocolar.
- **Drag & Drop:** Arraste seus arquivos para a lista.
- **Ordenação Visual:** Botões para subir/descer a ordem dos arquivos.
- **Fusão Rápida:** Gera um único arquivo PDF final mantendo a qualidade.

### 3. 🛡️ Segurança e Privacidade
- **Zero Upload:** O código roda localmente. Seus arquivos não saem da sua máquina.
- **Suporte a Gov.br:** Instruções integradas para lidar com arquivos protegidos por assinatura digital (workaround via "Imprimir como PDF").

---

## 📘 O que é a Numeração Bates?

A **Numeração Bates** é um método de indexação usado mundialmente para **identificar e rastrear páginas de documentos legais** de forma organizada.  
Normalmente colocada no cabeçalho ou rodapé, garante que cada página de um processo volumoso tenha um ID único (ex: `CASO-X-00150`), facilitando a citação em petições e audiências.

---

## 🚀 Como usar

A ferramenta é uma aplicação web estática. Você pode usá-la acessando o link oficial (se hospedado) ou rodando localmente.

### Passo a Passo:
1. **Escolha a Ferramenta:** No menu superior, alterne entre "Numerar PDF" e "Juntar PDF".
2. **Selecione os Arquivos:** Arraste seus documentos para a área pontilhada.
3. **Configure:**
   - *No Bates:* Defina prefixo, dígitos e posição.
   - *No Merge:* Organize a ordem dos arquivos na lista.
4. **Execute:** Clique em "Gerar" para baixar o resultado instantaneamente.

> 🌟 **Dica:** Ao final, se a ferramenta te ajudou, considere usar o QR Code de apoio no modal de agradecimento!

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído com foco em performance e simplicidade, sem dependências de backend complexas.

- **HTML5 / CSS3** (Design Responsivo e Moderno)
- **JavaScript (Vanilla)**
- **[pdf-lib](https://pdf-lib.js.org/)**: Para manipulação de PDFs no navegador.
- **[JSZip](https://stuk.github.io/jszip/)**: Para compactar múltiplos arquivos numerados.
- **[FileSaver.js](https://github.com/eligrey/FileSaver.js/)**: Para gerenciar os downloads.

---

## 🧩 Executar Localmente

Como é uma aplicação estática, você pode rodar em qualquer servidor simples.

```bash
# 1) Clone o repositório
git clone [https://github.com/SEU_USUARIO/pdf-mestre.git](https://github.com/SEU_USUARIO/pdf-mestre.git)
cd pdf-mestre

# 2) Sirva os arquivos (exemplo com Python, já nativo na maioria dos sistemas)
python -m http.server 5173

# Ou com Node.js/Serve
npx serve .

# 3) Acesse no navegador
# http://localhost:5173

---



👨‍💻 Sobre o Desenvolvedor
Desenvolvido por José Carlos (Jolt Sistemas). Focado em criar soluções tecnológicas acessíveis e eficientes para o dia a dia profissional.