// Example for ocrService.ts
import Tesseract from "tesseract.js";

export async function doOCR(image: File): Promise<string> {
	const worker = Tesseract.createWorker("eng", Tesseract.OEM.LSTM_ONLY);
	const result = (await worker).recognize(image);
	return (await result).data.text;
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
