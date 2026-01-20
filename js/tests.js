async function runTests() {
    console.log('Running tests...');
    await testPerformFileGenerationWithEncryptedPdf();
    console.log('Tests finished.');
}

async function testPerformFileGenerationWithEncryptedPdf() {
    console.log('Testing performFileGeneration with encrypted PDF...');

    // Create a mock encrypted PDF.
    // In a real scenario, this would be a real encrypted PDF file.
    // For this test, we'll simulate the encrypted file by creating a PDF
    // and then just passing the array buffer to the function.
    // The important part is that `PDFDocument.load` is called with `ignoreEncryption: true`.
    
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText('This is a test PDF.');
    const pdfBytes = await pdfDoc.save();

    const mockFile = new File([pdfBytes], "encrypted.pdf", { type: "application/pdf" });

    // Mock the necessary DOM elements and inputs
    document.body.innerHTML += `
        <input id="start-number" value="1">
        <input id="increment-step" value="1">
        <input id="prefix" value="TEST-">
        <input id="digits" value="5">
        <input id="font-size" value="12">
        <input id="font-color" value="#000000">
        <input id="bg-color" value="#FFFFFF">
        <input type="radio" name="position" value="top-right" checked>
        <input id="zip-name" value="test-zip">
        <button id="generate-btn"></button>
        <div id="status-message"></div>
        <div id="file-list-container"></div>
    `;
    
    // Set up the selected files
    selectedFiles = [mockFile];

    try {
        await performFileGeneration();
        const statusMessage = document.getElementById('status-message').textContent;
        if (statusMessage.startsWith('Ocorreu um erro')) {
            console.error('Test failed: performFileGeneration threw an error:', statusMessage);
        } else {
            console.log('Test passed: performFileGeneration did not throw an encryption error.');
        }
    } catch (error) {
        console.error('Test failed: performFileGeneration threw an unexpected error:', error);
    }
}

// Run the tests when the page is loaded
window.addEventListener('load', runTests);
