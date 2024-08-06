// pdfGenerator.js
const puppeteer = require('puppeteer');

const gerarPdf = async (htmlContent, nomeArquivo) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.pdf({ path: nomeArquivo, format: 'A4' });
    await browser.close();
};

module.exports = gerarPdf;
