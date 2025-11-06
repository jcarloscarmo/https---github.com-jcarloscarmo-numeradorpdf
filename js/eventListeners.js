singleFileInput.addEventListener('change', handleFileSelect);
multipleFilesInput.addEventListener('change', handleFileSelect);
folderInput.addEventListener('change', handleFileSelect);

[prefixInput, startNumberInput, digitsInput, fontSizeInput, fontWeightSelect, fontColorInput, bgColorInput].forEach(el => {
    el.addEventListener('input', updateStampPreview);
});
positionRadios.forEach(radio => radio.addEventListener('change', updateStampPreview));

generateBtn.addEventListener('click', generateAndDownloadFiles);

document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(event) {
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            event.preventDefault();
            window.location.href = href;
        }
    });
});
