import React from "react";
import { message, Row, Col, Modal, Spin, Table, Button } from "antd";
import { doOCR, idxToCol, spaceToTabs } from "../../utils/ocrUtil";
import { InboxOutlined } from "@ant-design/icons";
import { UploadProps } from "antd/es/upload/Upload";
import Dragger from "antd/es/upload/Dragger";
import { ColumnsType } from "antd/es/table";

interface ImageUploadProps {}

const supported = ["tif", "tiff", "jpg", "jpeg", "bmp", "png"];

const ImageUpload: React.FC<ImageUploadProps> = (props) => {
	const [text, setText] = React.useState<string>("");
	const [dataSource, setDataSource] = React.useState<any[]>([]);
	const [columns, setColumns] = React.useState<any>();
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
		setImage(null);
		setDataSource([]);
		setColumns(undefined);
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
						.then((res: any) => {
							setText(res.text);
							const str = spaceToTabs(res.text);
							const data: any[] = [];
							const rows = str.split("\n");
							for (let row of rows) {
								const cols = row.split("\t");
								data.push(cols);
							}
							// Find the maximum length of any row
							const maxRowLength = Math.max(...data.map((row) => row.length));

							// Generate columns dynamically based on the maximum row length
							const columns: ColumnsType<any> = Array.from({ length: maxRowLength + 1 }, (_, index) => ({
								title: idxToCol(index),
								dataIndex: `col${index + 1}`,
								key: `col${index + 1}`,
							}));
							columns.unshift({
								title: "",
								dataIndex: `key`,
								rowScope: "row",
							});
							setColumns(columns);

							// Generate a unique key for each row
							const newDataSource = data.map((row, rowIndex) =>
								row.reduce(
									(acc: any, cell: any, columnIndex: any) => ({
										...acc,
										[`col${columnIndex + 1}`]: cell,
									}),
									{ key: rowIndex + 1 }
								)
							);
							setDataSource(newDataSource);
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
					{view === "text" ? (
						<textarea
							style={{ height: "50vh", width: "100%" }}
							ref={textareaRef}
							value={text}
							onChange={(e) => {
								setText(e.target.value);
							}}
							onSelect={onSelect}
						></textarea>
					) : (
						<div style={{ border: "solid black 1px", height: "50vh", overflow: "scroll" }}>
							{dataSource.length > 0 && (
								<Table
									size="small"
									bordered={true}
									dataSource={dataSource}
									columns={columns}
									pagination={false}
								/>
							)}
						</div>
					)}
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
