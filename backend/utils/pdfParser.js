import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
 *Extract text from PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<{text: string; numages: number}>} - Promise that resolves to the extracted text
 */

export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    // pdf-parse accepts a Buffer directly
    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    return { text: data.text, numPages: data.numpages, info: data.info };
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(`Error extracting text from PDF: ${error.message}`);
  }
};
