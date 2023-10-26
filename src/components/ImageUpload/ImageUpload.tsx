import React from "react";
import { Button, message, Row, Col, Modal, Spin } from "antd";
import { doOCR } from "../../utils/ocrUtil";
import { InboxOutlined } from "@ant-design/icons";
import { UploadProps } from "antd/es/upload/Upload";
import Dragger from "antd/es/upload/Dragger";

interface ImageUploadProps {}

const supported = ["tif", "tiff", "jpg", "jpeg", "bmp", "png"];

const ImageUpload: React.FC<ImageUploadProps> = (props) => {
	const [text, setText] = React.useState<string>("Selection");
	const [selected, setSelected] = React.useState<string>("");
	const [uploadingMsg, setUploadingMsg] = React.useState<string | undefined>(undefined);
	const [image, setImage] = React.useState<string | null>(null);
	const [filename, setFilename] = React.useState<string>("No file loaded");

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
	function clear() {
		setText("");
		setSelected("");
	}
	const dragProps: UploadProps = {
		name: "file",
		onChange(info) {
			setUploadingMsg("Uploading...");
			clear();

			const { status } = info.file;
			setFilename(info.file.name);
			const fileparts = info.file.name.split(".");
			const ext = fileparts.pop()?.toLowerCase();
			if (!ext || !supported.includes(ext)) {
				message.error("The supported formats are " + supported.join(", "));
				setUploadingMsg(undefined);
				return;
			}
			if (status !== "uploading") {
				if (info.file.originFileObj) {
					// Convert File to data URL
					const reader = new FileReader();
					reader.onloadend = () => {
						setImage(reader.result as string);
					};
					reader.readAsDataURL(info.file.originFileObj);
					setUploadingMsg("Extracting text...");
					doOCR(info.file.originFileObj)
						.then((bla: any) => {
							setText(bla.text);
						})
						.catch(() => message.error("Unable to process your file"))
						.finally(() => {
							setUploadingMsg(undefined);
						});
				}
			}
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
			<h3>{filename}</h3>
			<Row gutter={25} style={{ width: "100%", marginTop: "25px" }}>
				<Col span={12}>
					<div style={{ border: "solid black 1px", height: "50vh" }}>
						{image && <img src={image} alt="Uploaded" style={{ width: "100%", height: "auto" }} />}
					</div>
				</Col>
				<Col span={12}>
					<textarea
						style={{ height: "50vh", width: "100%" }}
						ref={textareaRef}
						value={text}
						onChange={(e) => {
							setText(e.target.value);
						}}
						onSelect={onSelect}
					></textarea>
				</Col>
			</Row>
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
			<Modal visible={uploadingMsg !== undefined} title={null} footer={null} closable={false}>
				<Row justify="center">
					<Spin size="large" />
				</Row>
				<Row justify="center">{uploadingMsg}</Row>
			</Modal>
		</div>
	);
};

export default ImageUpload;
