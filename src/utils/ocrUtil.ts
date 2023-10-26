// Example for ocrService.ts
import Tesseract from "tesseract.js";

interface OCRResult {
	text: string;
	// Add more properties as needed
}

export async function doOCR(image: File): Promise<OCRResult> {
	const result = await Tesseract.recognize(image, "eng", {});

	return {
		text: result.data.text,
		// Map more properties from Tesseract result
	};
}
export function spaceToTabs(str: string): string {
	return str.replace(/ +(?=\S)/g, "\t");
}

export function idxToCol(idx: number) {
	const asciiA = 65;
	const nSymbols = 26;
	const nIter = Math.floor(idx / nSymbols);
	let str = "";
	for (let i = 0; i < nIter; ++i) {
		str += String.fromCharCode(i + asciiA);
	}
	str += String.fromCharCode((idx % nSymbols) + asciiA);
	return str;
}
