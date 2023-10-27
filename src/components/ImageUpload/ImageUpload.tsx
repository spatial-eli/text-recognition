import React from "react";
import { message, Row, Col, Modal, Spin, Button, Switch } from "antd";
import { doOCR } from "../../utils/ocrUtil";
import { InboxOutlined } from "@ant-design/icons";
import { UploadProps } from "antd/es/upload/Upload";
import Dragger from "antd/es/upload/Dragger";
import ResultTable from "../ResultTable/ResultTable";

interface ImageUploadProps {}

const supported = ["tif", "tiff", "jpg", "jpeg", "bmp", "png"];

const ImageUpload: React.FC<ImageUploadProps> = (props) => {
	const [text, setText] = React.useState<string>("");
	const [selected, setSelected] = React.useState<string>("");
	const [uploadingMsg, setUploadingMsg] = React.useState<string | undefined>(undefined);
	const [image, setImage] = React.useState<string | null>(null);
	const [filename, setFilename] = React.useState<string>("No file loaded");
	const [view, setView] = React.useState<"table" | "text">("table");

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

	function onCopyAsTable() {
		if (selected === "") {
			message.info("Empty selection");
			return;
		}
		const toCopy = selected.replace(/ +(?=\S)/g, "\t");
		navigator.clipboard.writeText(toCopy).then(() => {
			message.success("Table copied to clipboard");
			setSelected("");
		});
	}

	function clear() {
		setText("");
		setSelected("");
		setImage(null);
	}

	const dragProps: UploadProps = {
		name: "file",
		beforeUpload(file) {
			const fileparts = file.name.split(".");
			const ext = fileparts.pop()?.toLowerCase();
			if (!ext || !supported.includes(ext)) {
				message.error("The supported formats are " + supported.join(", "));
				setUploadingMsg(undefined);
				return false;
			}
			setUploadingMsg("Uploading...");
		},
		onChange(info) {
			clear();

			const { status } = info.file;
			setFilename(info.file.name);
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
						.then((text: string) => {
							setText(text);
						})
						.catch((error) => message.error("Unable to process your file: " + error))
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
			<Row gutter={25} style={{ width: "100%", marginTop: "25px", marginRight: "0", marginLeft: "0" }}>
				<Col span={12}>
					<div style={{ border: "solid black 1px", height: "50vh" }}>
						{image && (
							<img
								src={image}
								alt="Uploaded"
								style={{ maxWidth: "100%", height: "auto", maxHeight: "100%" }}
							/>
						)}
					</div>
				</Col>
				<Col span={12}>
					{view === "text" ? (
						<div style={{ height: "50vh", width: "100%", border: "solid black 1px" }}>
							<textarea
								style={{
									height: "calc(50vh - 32px - 32px)",
									width: "95%",
									border: "none",
								}}
								ref={textareaRef}
								value={text}
								onChange={(e) => {
									setText(e.target.value);
								}}
								onSelect={onSelect}
							></textarea>
							<Row justify="center" gutter={25} style={{ marginTop: "15px" }}>
								<Col>
									<Button type="primary" onClick={onCopyAsTable}>
										Copy Selection as Table
									</Button>
								</Col>
							</Row>
						</div>
					) : (
						<ResultTable text={text}></ResultTable>
					)}
				</Col>
			</Row>
			<Row align="middle" justify="end" style={{ padding: "25px" }}>
				<label>View as Text</label>
				<Switch
					style={{ marginLeft: "10px" }}
					checked={view === "text"}
					onChange={(checked) => {
						setView(checked ? "text" : "table");
					}}
				></Switch>
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
