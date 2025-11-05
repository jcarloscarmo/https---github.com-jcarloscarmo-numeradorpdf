singleFileInput.addEventListener('change', handleFileSelect);
multipleFilesInput.addEventListener('change', handleFileSelect);
folderInput.addEventListener('change', handleFileSelect);

[prefixInput, startNumberInput, digitsInput, fontSizeInput, fontWeightSelect, fontColorInput, bgColorInput].forEach(el => {
    el.addEventListener('input', updateStampPreview);
});
positionRadios.forEach(radio => radio.addEventListener('change', updateStampPreview));

generateBtn.addEventListener('click', generateAndDownloadFiles);
