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

export function removeMultipleSpaces(str: string): string {
	return str.replace(/\s+/g, " ");
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

export function invoiceToTable(str: string): any[] {
	const STR_START = "EXCEPTION";
	let rows = str.split("\n");
	const idx = rows.findIndex((s) => s === STR_START);
	if (!idx) return [];

	// Delete header
	rows = rows.splice(idx + 2, rows.length);

	const table: any[] = [];
	let entry: string[] = Array(6).fill("");
	for (let i = 0; i < rows.length; ++i) {
		const row = rows[i];
		const tokens = removeMultipleSpaces(row).split(" ");
		if (i % 3 === 0) {
			entry = Array(5).fill("");
			entry[0] = tokens[0];
			entry[5] = tokens[tokens.length - 3];
			entry[4] = tokens[tokens.length - 4];

			// Check for HS code
			const maybeHS = tokens[tokens.length - 5];
			if (maybeHS.length === 10 && !isNaN(parseFloat(maybeHS))) {
				entry[3] = maybeHS;
			}
			const description = tokens.splice(2, tokens.length - 6);
			if (description !== undefined) {
				entry[1] = description.join(" ");
			}
		} else if (i % 3 === 1) {
			entry[2] = row;
			table.push(entry);
		}
	}
	return table;
}
