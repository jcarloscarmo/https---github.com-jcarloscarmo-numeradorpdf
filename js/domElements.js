// Elementos relacionados a arquivos
const fileInput = document.getElementById('file-input');
const fileInputButton = document.getElementById('file-input-button');
const fileListContainer = document.getElementById('file-list-container');
const fileDropZone = document.getElementById('file-drop-zone');

// Botão de ação principal
const generateBtn = document.getElementById('generate-btn');

// Mensagem de status
const statusMessage = document.getElementById('status-message');

// Inputs de personalização
const prefixInput = document.getElementById('prefix');
const startNumberInput = document.getElementById('start-number');
const incrementStepInput = document.getElementById('increment-step');
const digitsInput = document.getElementById('digits');
const fontSizeInput = document.getElementById('font-size');
const fontColorInput = document.getElementById('font-color');
const bgColorInput = document.getElementById('bg-color');
const positionRadios = document.querySelectorAll('input[name="position"]');
const zipNameInput = document.getElementById('zip-name');