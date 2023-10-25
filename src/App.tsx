import React from "react";
import logo from "./logo.svg";
import "./App.css";
import ImageUpload from "./components/ImageUpload/ImageUpload";

function App() {
	const file: File = new File([], "/Users/eli.leblanc/Documents/UPS/sample4.png");
	return (
		<div className="App">
			<ImageUpload></ImageUpload>
		</div>
	);
}

export default App;
