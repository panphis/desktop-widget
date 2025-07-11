import type { FC, ReactNode } from 'react';

import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

type TagProps = {
	color?: keyof typeof colors;
	className?: string;
	children: ReactNode;
};

export type ListType = {
	value: number | string;
	label: string;
	status?: string | number;
	className?: string;
	icon?: string;
	color?: keyof typeof colors;
};


export const colorSet = {
	success: '#52c41a',
	error: '#ff4d4f',
	warn: '#fff566',
	green: '#52c41a',
	red: '#f5222d',
	yellow: '#d48806',
	blue: '#1890ff',
	purple: '#9254de',
	orange: '#fa8c16',
};
// const res = {};
// for (const name in colorSet) {
// 	if (Object.prototype.hasOwnProperty.call(colorSet, name)) {
// 		const color = colorSet[name];
// 		res[name] = `bg-[${color}]`;
// 	}
// }
// console.log(JSON.stringify(res))

export const dotColor: Record<keyof typeof colorSet, string> = {
	success: 'bg-[#52c41a]',
	error: 'bg-[#ff4d4f]',
	warn: 'bg-[#fff566]',
	green: 'bg-[#52c41a]',
	red: 'bg-[#f5222d]',
	yellow: 'bg-[#d48806]',
	blue: 'bg-[#1890ff]',
	purple: 'bg-[#9254de]',
	orange: 'bg-[#fa8c16]',
};
export const colors: Record<keyof typeof colorSet, string> = {
	success: 'text-[#52c41a] bg-[#52c41a]/10 border-[#52c41a]/20 hover:bg-[#52c41a]/10',
	error: 'text-[#ff4d4f] bg-[#ff4d4f]/10 border-[#ff4d4f]/20 hover:bg-[#ff4d4f]/10',
	warn: 'text-[#fff566] bg-[#fff566]/10 border-[#fff566]/20 hover:bg-[#fff566]/10',
	green: 'text-[#52c41a] bg-[#52c41a]/10 border-[#52c41a]/20 hover:bg-[#52c41a]/10',
	red: 'text-[#f5222d] bg-[#f5222d]/10 border-[#f5222d]/20 hover:bg-[#f5222d]/10',
	yellow: 'text-[#d48806] bg-[#d48806]/10 border-[#d48806]/20 hover:bg-[#d48806]/10',
	blue: 'text-[#1890ff] bg-[#1890ff]/10 border-[#1890ff]/20 hover:bg-[#1890ff]/10',
	purple: 'text-[#9254de] bg-[#9254de]/10 border-[#9254de]/20 hover:bg-[#9254de]/10',
	orange: 'text-[#fa8c16] bg-[#fa8c16]/10 border-[#fa8c16]/20 hover:bg-[#fa8c16]/10',
};

export const Tag: FC<TagProps> = ({ children, className, color }) => {
	const inCls = color ? colors[color as keyof typeof colors] : '';
	return <Badge className={cn(className, inCls)}>{children}</Badge>;
};
export default Tag;
