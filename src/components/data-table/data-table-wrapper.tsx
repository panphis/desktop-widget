'use client';

import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import type { ZodRawShape } from 'zod';
import { z } from 'zod';

import { PageNationResponse } from '@/types';

import { Pagination } from '../pagination';
import { DataTableCell } from './data-table-cell';
import { TableDataType } from './enums';
import { FilterForm, FilterFormProps, FormProps } from './filter-form';
import { DataTable } from './table';

export { TableDataType };

export interface BaseColumnConfig {
	accessorKey: string;
}

export type DataTableColumn<T> = ColumnDef<T> & {
	accessorKey?: string;
	header: string;
	filter?: boolean;
	type?: TableDataType;
	formItemProps?: FormProps['formItemProps'];
};

type DataTableWrapperProps<T> = {
	dataTableColumns: DataTableColumn<T>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	useQueryHooks: (params: any) => ReturnType<typeof useQuery<PageNationResponse<T>>>;
};

export const DataTableWrapper = <T,>({ dataTableColumns, useQueryHooks }: DataTableWrapperProps<T>) => {
	const [page, setPage] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(10);

	const [formParams, setFormParams] = useState<undefined | Record<string, unknown>>(undefined);
	const params = useMemo(() => {
		const p = {
			...formParams,
			page: page,
			pageSize: pageSize,
		};
		return p;
	}, [formParams, page, pageSize]);

	const { data, isLoading, isError, error } = useQueryHooks(params);
	const totalRecords = useMemo(() => {
		return data?.total || 0;
	}, [data?.total]);
	const totalPages = useMemo(() => {
		return data?.total_pages || 0;
	}, [data?.total_pages]);

	const onPageSizeChange = (size: number) => {
		setPageSize(size);
		setPage(1); // 重置到第一页
	};

	const handleSubmit = (values: undefined | Record<string, unknown>) => {
		setFormParams(values);
	};

	const tableConfig = useMemo(() => {
		const config = {
			form: [],
			columns: [],
			searchSchema: z.object({}),
		} as {
			columns: ColumnDef<T>[];
			form: FormProps[];
			searchSchema: FilterFormProps['formSchema'];
		};
		const schemaObj: ZodRawShape = {};

		dataTableColumns.forEach((column) => {
			const {
				type = TableDataType.STRING,
				cell,
				accessorKey = '',
				header,
				filter = false,
				formItemProps,
				...others
			} = column as DataTableColumn<T>;
			const item = { header, accessorKey, ...others } as ColumnDef<T>;
			if (cell) {
				item.cell = cell;
			} else if (type) {
				item.cell = ({ row }) => {
					return (
						<DataTableCell type={type} value={row.getValue(accessorKey as string)} options={formItemProps?.options} />
					);
				};
			}

			if (filter) {
				config.form.push({ accessorKey, header, type, formItemProps });

				switch (type) {
					case TableDataType.STRING:
						schemaObj[accessorKey] = z.string().optional();
						break;
					case TableDataType.DATE:
						schemaObj[accessorKey] = z.date().optional();
						break;
					case TableDataType.ENUM:
						schemaObj[accessorKey] = z.string().optional();
						break;
					case TableDataType.BOOLEAN:
						schemaObj[accessorKey] = z.boolean().optional();
						break;
					case TableDataType.DATA_RANGE:
						schemaObj[accessorKey] = z.array(z.string().or(z.undefined())).optional();
						break;
					default:
						break;
				}
			}

			config.columns.push(item);
		});

		config.searchSchema = z.object(schemaObj as ZodRawShape);
		return config;
	}, [dataTableColumns]);

	return (
		<div className="space-y-4">
			<FilterForm config={tableConfig.form} onSubmit={handleSubmit} formSchema={tableConfig.searchSchema} />
			<DataTable<T>
				data={data?.list || []}
				columns={tableConfig.columns}
				isLoading={isLoading}
				isError={isError}
				error={error as Error}
			/>

			<Pagination
				totalPages={totalPages}
				totalRecords={totalRecords}
				page={page}
				pageSize={pageSize}
				onPageSizeChange={onPageSizeChange}
				onPageChange={setPage}
			/>
		</div>
	);
};
