import { Button, Col, message, Row, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import React, { FC } from "react";
import { idxToCol, invoiceToTable } from "../../utils/ocrUtil";
import styles from "./ResultTable.module.css";

interface ResultTableProps {
	text: string;
}

const ResultTable: FC<ResultTableProps> = (props) => {
	const [dataSource, setDataSource] = React.useState<string[][]>([]);
	const [columns, setColumns] = React.useState<any>();
	const [dataTable, setDataTable] = React.useState<any[]>([]);

	function clear() {
		setDataSource([]);
		setColumns(undefined);
	}

	function onCopyTable() {
		const toCopy: string = dataTable.map((row) => row.join("\t")).join("\n");
		navigator.clipboard.writeText(toCopy).then(() => {
			message.success("Table copied to clipboard");
		});
	}

	function initTable() {
		const data = invoiceToTable(props.text);
		setDataTable(data);

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
	}

	React.useEffect(() => {
		clear();
		initTable();
	}, [props.text]);
	return (
		<div
			style={{ border: "solid black 1px", height: "50vh" }}
			className={styles.ResultTable}
			data-testid="ResultTable"
		>
			{dataSource.length > 0 && (
				<div style={{ height: "calc(50vh - 32px - 25px)", overflow: "scroll" }}>
					<Table size="small" bordered={true} dataSource={dataSource} columns={columns} pagination={false} />
				</div>
			)}
			<Row justify="center" gutter={25} style={{ marginTop: "15px" }}>
				<Col>
					<Button type="primary" onClick={onCopyTable}>
						Copy Table
					</Button>
				</Col>
			</Row>
		</div>
	);
};

export default ResultTable;
