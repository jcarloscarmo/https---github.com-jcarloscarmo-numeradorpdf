# 🧾 Gerador de Numeração Bates (Bates Stamping)

Uma ferramenta simples e gratuita para aplicar **Numeração Bates** em documentos PDF — ideal para advogados, escritórios e profissionais que lidam com grandes volumes de documentos jurídicos.

<!-- Badges (opcionais — ajuste os links conforme seu projeto) -->
![status](https://img.shields.io/badge/status-active-brightgreen)
![license](https://img.shields.io/badge/license-MIT-blue)
![made-with](https://img.shields.io/badge/made%20with-HTML%2FCSS%2FJS-orange)

---

## ✨ Recursos
- 🔢 Numeração sequencial configurável (`000001`, `000002`, …)
- 🏷️ Prefixo e/ou sufixo (ex.: `CASO123-000001`, `PROVA-CLIENTE-000002`)
- 📍 Posição da marca (cabeçalho/rodapé)
- 🕒 Opção de incluir data/hora
- ⚙️ Interface simples e 100% no navegador (sem instalar nada)
- 💼 Focado em rotinas jurídicas (discovery/produção de provas)

---

## 📘 O que é a Numeração Bates?

A **Numeração Bates** (ou *Bates Stamping*) é um método de indexação usado para **identificar e rastrear páginas de documentos legais** de forma organizada e sequencial.  
Normalmente colocada no cabeçalho ou rodapé, pode incluir:

- Número sequencial (`000001`, `000002`, …)  
- **Prefixo/sufixo** para caso/cliente/lote  
- **Data e hora** da numeração

---

## ⚖️ Por que isso ajuda no dia a dia jurídico?

1. **Organização e consistência** → sequência única e previsível para cada página.  
2. **Recuperação rápida** → referência direta a uma página específica (ex.: *“ver página ABC-001234”*).  
3. **Integridade de documentos** → lacunas indicam páginas faltantes; evita inserções indevidas.  
4. **Discovery/produção de provas** → padrão do mercado para rastrear o que foi solicitado e produzido.  
5. **Colaboração eficiente** → referência universal entre equipes, peritos e tribunais.

---

## 🚀 Como usar

1. **Abra o site** (hospedado na Vercel) ou rode localmente (ver abaixo).  
2. **Envie seus PDFs**.  
3. **Defina as opções**: prefixo/sufixo, formato numérico, posição e (opcional) data/hora.  
4. **Gere e baixe** seus documentos numerados.

> Dica: ao final do download, há um pop-up opcional de agradecimento com QR Code para apoio ao projeto. 🌟

---

## 🧩 Executar localmente

```bash
# 1) Clone o repositório
git clone https://github.com/SEU_USUARIO/SEU_REPO.git
cd SEU_REPO

# 2) Sirva os arquivos estáticos (escolha uma opção)

# Opção A: com Python 3
python -m http.server 5173

# Opção B: com Node (instale o serve globalmente)
npm i -g serve
serve -l 5173 .

# 3) Acesse no navegador
# http://localhost:5173
