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
