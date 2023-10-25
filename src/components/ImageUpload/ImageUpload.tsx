// Example for ImageUpload.tsx
import { Button, message, Row, Col } from "antd";
import React, { ChangeEvent } from "react";
import { doOCR } from "../../utils/ocrUtil";
import { InboxOutlined } from "@ant-design/icons";
import { UploadProps } from "antd/es/upload/Upload";
import Dragger from "antd/es/upload/Dragger";

interface ImageUploadProps {}

const ImageUpload: React.FC<ImageUploadProps> = (props) => {
	const [text, setText] = React.useState<string>("Selection");
	const [selected, setSelected] = React.useState<string>("");

	const textareaRef = React.useRef<HTMLTextAreaElement>(null);

	function onSelect() {
		if (textareaRef.current) {
			const selection = textareaRef.current.value.substring(
				textareaRef.current.selectionStart,
				textareaRef.current.selectionEnd
			);
			setSelected(selection);
		}
	}

	function doCopy(toCopy: string) {
		navigator.clipboard.writeText(toCopy).then(() => {
			message.info("Copied to clipboard");
		});
	}

	function onCopyAsTable() {
		const toCopy = selected.replace(/ +(?=\S)/g, "\t");
		doCopy(toCopy);
	}

	function onCopyAsText() {
		doCopy(selected);
	}

	const dragProps: UploadProps = {
		name: "file",
		onChange(info) {
			const { status } = info.file;
			if (status !== "uploading") {
				if (info.file.originFileObj) {
					doOCR(info.file.originFileObj).then((bla: any) => {
						setText(bla.text);
					});
				}
			}
		},
		onDrop(e) {
			console.log("Dropped files", e.dataTransfer.files);
		},
		showUploadList: false,
	};

	return (
		<div style={{ padding: "25px" }}>
			<Dragger {...dragProps}>
				<p className="ant-upload-drag-icon">
					<InboxOutlined />
				</p>
				<p className="ant-upload-text">Click or drag file to this area to upload</p>
			</Dragger>
			<div style={{ width: "100%", marginTop: "25px" }}>
				<textarea
					style={{ width: "100%", height: "50vh" }}
					ref={textareaRef}
					value={text}
					onChange={(e) => {
						setText(e.target.value);
					}}
					onSelect={onSelect}
				></textarea>
			</div>
			<Row justify="center" gutter={25} style={{ marginTop: "25px" }}>
				<Col>
					<Button type="default" onClick={onCopyAsText}>
						Copy as text
					</Button>
				</Col>
				<Col>
					<Button type="primary" onClick={onCopyAsTable}>
						Copy as table
					</Button>
				</Col>
			</Row>
		</div>
	);
};

export default ImageUpload;
