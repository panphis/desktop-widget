'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, Fragment } from 'react';
import { useForm } from 'react-hook-form';
import type { UnknownKeysParam, ZodObject, ZodTypeAny } from 'zod';
import { z } from 'zod';

import { LoadingButton } from '@/components';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';

import { DatePicker, DateRangePicker } from '../date-picker';
import { dotColor } from '../tag';
import { Checkbox, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui';
import { ListType } from './data-table-cell';
import { TableDataType } from './enums';

export interface FormProps {
	formItemProps?: {
		options?: ListType[];
	};
	filter?: boolean;
	type: (typeof TableDataType)[keyof typeof TableDataType];
	accessorKey: string;
	header: string;
}

export type FilterFormProps = {
	config: FormProps[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	formSchema: ZodObject<any, UnknownKeysParam, ZodTypeAny, { [x: string]: any }, { [x: string]: any }>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSubmit: (values?: any) => Promise<void> | void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	defaultValues?: ZodObject<any>;
};
const defaultSchema = z.object({});

export const FilterForm: FC<FilterFormProps> = ({ formSchema, onSubmit, defaultValues = {}, config }) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema || defaultSchema),
		defaultValues,
	});

	function handleSubmit(data: z.infer<typeof formSchema>) {
		onSubmit(data);
	}

	function handleReset() {
		form.reset();
		onSubmit();
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				onReset={handleReset}
				className="flex space-x-4 space-y-2 flex-wrap"
			>
				{config.map(({ accessorKey, header, type, formItemProps }) => {
					switch (type) {
						case TableDataType.STRING:
							return (
								<FormField
									key={accessorKey}
									control={form.control}
									name={accessorKey}
									render={({ field }) => {
										return (
											<FormItem className="flex flex-row gap-2">
												<FormLabel className="shrink-0">{header}</FormLabel>
												<FormControl>
													<Input placeholder={`请输入${header}`} {...field} value={field.value || ''} />
												</FormControl>
												<FormMessage />
											</FormItem>
										);
									}}
								/>
							);

						case TableDataType.ENUM:
						case TableDataType.ARRAY:
							return (
								<FormField
									key={accessorKey}
									control={form.control}
									name={accessorKey}
									render={({ field }) => (
										<FormItem className="flex flex-row gap-2">
											<FormLabel className="shrink-0">{header}</FormLabel>
											<Select onValueChange={field.onChange} value={field.value || ''}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder={`请选择${header}`} />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{formItemProps?.options?.map(({ value, label, color }) => {
														return (
															<SelectItem value={value.toString()} key={value}>
																{!!color && <span className={cn('h-2 w-2 rounded-full', dotColor[color])} />}
																{label}
															</SelectItem>
														);
													})}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							);
						case TableDataType.DATE:
							return (
								<FormField
									key={accessorKey}
									control={form.control}
									name={accessorKey}
									render={({ field }) => {
										return (
											<FormItem className="flex flex-row gap-2 items-center">
												<FormLabel className="shrink-0">{header}</FormLabel>
												<FormControl>
													<DatePicker {...field} />
												</FormControl>
											</FormItem>
										);
									}}
								/>
							);
						case TableDataType.DATA_RANGE:
							return (
								<FormField
									key={accessorKey}
									control={form.control}
									name={accessorKey}
									render={({ field }) => {
										return (
											<FormItem className="flex flex-row gap-2 items-center">
												<FormLabel className="shrink-0">{header}</FormLabel>
												<FormControl>
													<DateRangePicker {...field} />
												</FormControl>
											</FormItem>
										);
									}}
								/>
							);
						case TableDataType.BOOLEAN:
							return (
								<FormField
									key={accessorKey}
									control={form.control}
									name={accessorKey}
									render={({ field }) => {
										return (
											<FormItem className="flex flex-row gap-2 items-center" key={accessorKey}>
												<FormLabel className="shrink-0">{header}</FormLabel>
												<FormControl>
													<Checkbox
														checked={!!field.value}
														onCheckedChange={(checked) => {
															field.onChange(checked);
														}}
													/>
												</FormControl>
											</FormItem>
										);
									}}
								/>
							);
						default:
							const dom = <Fragment key={accessorKey}></Fragment>;
							return dom as never;
					}
				})}
				<LoadingButton type="submit">Submit</LoadingButton>
				<LoadingButton type="reset">Reset</LoadingButton>
			</form>
		</Form>
	);
};
export default FilterForm;
