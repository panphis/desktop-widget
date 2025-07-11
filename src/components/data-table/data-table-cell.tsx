import { CheckIcon, Minus } from 'lucide-react';
import type { FC } from 'react';
import React from 'react';

import { colors, Tags } from '@/components/tag';
import { TextEllipsisTooltip } from '@/components/text-ellipsis-tooltip';
import { formatTime } from '@/lib/format';

import { TableDataType } from './enums';

export type ListType = {
	value: number | string;
	label: string;
	status?: string | number;
	className?: string;
	icon?: string;
	color?: keyof typeof colors;
};

export type DataTableCellProps = {
	type: TableDataType;
	value: string | number | boolean | Date | (string | number)[];
	options?: ListType[];
	ellipsis?: boolean;
};

export const DataTableCell: FC<DataTableCellProps> = ({ value, type, ellipsis, options }) => {
	switch (type) {
		case TableDataType.STRING:
			return <TextEllipsisTooltip ellipsis={ellipsis}>{String(value)}</TextEllipsisTooltip>;
		case TableDataType.NUMBER:
			return (
				<TextEllipsisTooltip ellipsis={ellipsis} className="slashed-zero tabular-nums">
					{String(value)}
				</TextEllipsisTooltip>
			);
		case TableDataType.BOOLEAN:
			return value ? <CheckIcon className="text-primary" /> : <Minus className="text-gray-400" />;
		case TableDataType.DATE:
		case TableDataType.DATA_RANGE:
			return (
				<TextEllipsisTooltip ellipsis={ellipsis} className="slashed-zero tabular-nums">
					{value && (typeof value === 'string' || typeof value === 'number' || value instanceof Date)
						? formatTime(value)
						: '--'}
				</TextEllipsisTooltip>
			);
		case TableDataType.ENUM:
			return <Tags value={value as ListType['value']} options={options ?? []} />;
		case TableDataType.ARRAY:
			return (
				<TextEllipsisTooltip ellipsis={ellipsis} className="slashed-zero tabular-nums">
					{Array.isArray(value) ? value.join(', ') : String(value)}
				</TextEllipsisTooltip>
			);
		default:
			return <TextEllipsisTooltip ellipsis={ellipsis}>{String(value)}</TextEllipsisTooltip>;
	}
};
export default DataTableCell;
