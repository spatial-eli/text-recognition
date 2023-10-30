import { Button, Col, Input, message, Row, Table, Tooltip } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import React, { FC } from "react";
import { idxToCol, invoiceToTable, validateField } from "../../utils/ocrUtil";
import styles from "./ResultTable.module.css";

interface ResultTableProps {
	text: string;
}
const COLUMN_TITLES = ["Qty", "Description", "Parts", "HSC", "CO", "Value", "Total"];
const EditableCell: React.FC<any> = ({ editing, dataIndex, title, record, index, children, onSave, ...restProps }) => {
	restProps.style = {
		whiteSpace: "normal",
		background:
			dataIndex === "key" ? "rgb(240,240,240,0.5)" : validateField(dataIndex, record) ? "transparent" : "yellow",
	};
	return (
		<td {...restProps}>
			{editing ? (
				<div>
					<Input value={record[dataIndex]} onChange={(e) => onSave(record.key, dataIndex, e.target.value)} />
				</div>
			) : (
				children
			)}
		</td>
	);
};

const ResultTable: FC<ResultTableProps> = (props) => {
	const [dataSource, setDataSource] = React.useState<any[]>([]);
	const [columns, setColumns] = React.useState<any>();
	const [dataTable, setDataTable] = React.useState<any[]>([]);
	const [editable, setEditable] = React.useState<boolean>(false);

	function clear() {
		setDataSource([]);
		setColumns(undefined);
	}

	function onCopyTable() {
		const toCopy: string = dataTable.map((row) => row.splice(0, row.length - 1).join("\t")).join("\n");
		navigator.clipboard.writeText(toCopy).then(() => {
			message.success("Table copied to clipboard");
		});
	}
	const save = (key: React.Key, dataIndex: string, value: string) => {
		setDataSource((prevData) => {
			const newData = prevData.map((item) => {
				if (item.key === key) {
					return { ...item, [dataIndex]: value };
				}
				return item;
			});
			return newData;
		});
		setDataTable((data) => {
			data[Number(key) - 1][Number(dataIndex) - 1] = value;
			return data;
		});
	};

	function initColumns() {
		// Generate columns
		const cols: ColumnsType<any> = Array.from({ length: 7 }, (_, index) => ({
			title: COLUMN_TITLES[index],
			dataIndex: index + 1,
			key: index + 1,
		}));
		cols.unshift({
			title: "",
			dataIndex: `key`,
			rowScope: "row",
			key: "row",
		});
		cols[1].width = "75px";
		cols[2].width = "200px";
		cols[3].width = "200px";
		cols[5].width = "75px";
		cols[6].width = "100px";
		const columns = cols.map((col: any) => ({
			...col,
			onCell: (record: any) => ({
				record,
				dataIndex: col.dataIndex,
				editing: col.dataIndex > 0 && editable === true,
				onSave: (key: React.Key, dataIndex: string, value: string) => save(key, dataIndex, value),
			}),
		}));
		setColumns(columns);
	}

	function initTable() {
		const data = invoiceToTable(props.text);
		setDataTable(data);

		initColumns();

		// Generate a unique key for each row
		const newDataSource = data.map((row, rowIndex) =>
			row.reduce(
				(acc: any, cell: any, columnIndex: any) => ({
					...acc,
					[columnIndex + 1]: cell,
				}),
				{ key: rowIndex + 1 }
			)
		);
		setDataSource(newDataSource);
	}

	React.useEffect(() => {
		clear();
		initTable();
		setEditable(false);
	}, [props.text]);
	React.useEffect(() => {
		initColumns();
	}, [editable]);
	return (
		<div
			style={{ border: "solid black 1px", height: "50vh" }}
			className={styles.ResultTable}
			data-testid="ResultTable"
		>
			{dataSource.length > 0 && (
				<div>
					<div style={{ height: "calc(50vh - 32px - 25px)", overflow: "scroll" }}>
						<Table
							size="small"
							components={{
								body: {
									cell: EditableCell,
								},
							}}
							bordered={true}
							dataSource={dataSource}
							columns={columns}
							pagination={false}
							rowClassName="editable-row"
						/>
					</div>
					<Row justify="end" gutter={25} style={{ marginTop: "15px", marginRight: "15px" }}>
						<Col>
							<Button type="default" onClick={onCopyTable}>
								Copy Table
							</Button>
						</Col>
						<Tooltip title="search">
							<Button
								type={editable ? "primary" : "default"}
								shape="circle"
								icon={<EditOutlined />}
								onClick={() => {
									setEditable(!editable);
								}}
							/>
						</Tooltip>
					</Row>
				</div>
			)}
		</div>
	);
};

export default ResultTable;
