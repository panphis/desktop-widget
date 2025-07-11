'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { FC, ReactNode } from 'react';
import { type Control, useForm } from 'react-hook-form';
import { z } from 'zod';

import { DatePicker, DateRangePicker, RichTextEditor } from '@/components';
import { LoadingButton } from '@/components';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import type {
	ControllerRenderProps,
	DateRangeValue,
	DateValue,
	FieldConfig,
	FormConfig,
	FormData,
	FormErrors,
	ValueType,
} from './types';

// 动态创建zod schema
function createSchema(fields: readonly FieldConfig[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
	const schemaObject: Record<string, z.ZodTypeAny> = {};

	fields.forEach((field) => {
		if (field.validation) {
			schemaObject[field.name] = field.validation;
		} else {
			// 默认验证规则
			switch (field.type) {
				case 'email':
					schemaObject[field.name] = field.required
						? z.string().email('请输入有效的邮箱地址')
						: z.string().email('请输入有效的邮箱地址').optional();
					break;
				case 'number':
					schemaObject[field.name] = field.required
						? z.number({ required_error: `${field.label}是必填项` })
						: z.number().optional();
					break;
				case 'checkbox':
					schemaObject[field.name] = field.required
						? z.boolean().refine((val) => val === true, { message: `请勾选${field.label}` })
						: z.boolean().optional();
					break;
				case 'date':
					schemaObject[field.name] = field.required
						? z.date({ message: `请选择${field.label}日期` })
						: z.date().optional();
					break;
				case 'date-range':
					schemaObject[field.name] = field.required
						? z.array(z.string().or(z.undefined().or(z.date())), { message: '请选择时间范围' })
						: z.array(z.string().or(z.undefined().or(z.date()))).optional();
					break;
				default:
					schemaObject[field.name] = field.required
						? z.string().min(1, `${field.label}是必填项`)
						: z.string().optional();
			}
		}
	});

	return z.object(schemaObject);
}

type RenderFieldProps = {
	field: FieldConfig;
	control: Control<Record<string, ValueType>>;
	errors: FormErrors;
	formDefaultValues?: Record<string, ValueType>;
	labelClassName: string;
};

const RenderField: FC<RenderFieldProps> = ({ field, control, errors, formDefaultValues, labelClassName }) => {
	const error = errors[field.name];
	const getDefaultValue = (): ValueType => {
		// 优先使用表单级别的默认值
		if (formDefaultValues && formDefaultValues[field.name] !== undefined) {
			return formDefaultValues[field.name];
		}

		// 其次使用字段级别的默认值
		if (field.defaultValue !== undefined) {
			return field.defaultValue;
		}

		// 最后使用类型默认值
		switch (field.type) {
			case 'number':
				return undefined;
			case 'checkbox':
				return false;
			case 'date':
				return undefined;
			case 'date-range':
				return [undefined, undefined];
			default:
				return '';
		}
	};

	const fieldContent = (): ReactNode => {
		switch (field.type) {
			case 'textarea':
				return (
					<FormField
						name={field.name}
						control={control}
						defaultValue={getDefaultValue() as string}
						render={({ field: formField }: { field: ControllerRenderProps['field'] }) => (
							<FormItem className="flex flex-row gap-2 items-start">
								<FormLabel className={cn(labelClassName, 'shrink-0 h-9')} required={field.required}>
									{field.label}
								</FormLabel>
								<div className="flex flex-col gap-2 min-h-9 grow-1">
									<FormControl>
										<Textarea
											{...formField}
											value={formField.value as string}
											onChange={(e) => formField.onChange(e.target.value)}
											placeholder={field.placeholder}
											className={error ? 'border-red-500' : ''}
										/>
									</FormControl>
									<FormDescription>{field.description}</FormDescription>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
				);

			case 'select':
				return (
					<FormField
						name={field.name}
						control={control}
						defaultValue={getDefaultValue() as string}
						render={({ field: formField }: { field: ControllerRenderProps['field'] }) => (
							<FormItem className="flex flex-row gap-2 items-start">
								<FormLabel className={cn(labelClassName, 'shrink-0 h-9')} required={field.required}>
									{field.label}
								</FormLabel>
								<div className="flex flex-col gap-2 min-h-9 grow-1">
									<Select
										onValueChange={(value: string) => formField.onChange(value)}
										value={formField.value as string}
									>
										<FormControl>
											<SelectTrigger className={error ? 'border-red-500' : ''}>
												<SelectValue placeholder={field.placeholder || `请选择${field.label}`} />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{field.options?.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>{field.description}</FormDescription>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
				);

			case 'checkbox':
				return (
					<FormField
						name={field.name}
						control={control}
						defaultValue={getDefaultValue() as boolean}
						render={({ field: formField }: { field: ControllerRenderProps['field'] }) => (
							<FormItem className="flex flex-row gap-2 items-start">
								<FormLabel className={cn(labelClassName, 'shrink-0 h-9')} required={field.required}>
									{field.label}
								</FormLabel>
								<div className="flex flex-col gap-2 min-h-9 grow-1 mt-2.5">
									<FormControl>
										<Checkbox
											id={field.name}
											checked={formField.value as boolean}
											onCheckedChange={(checked: boolean) => formField.onChange(checked)}
										/>
									</FormControl>

									<FormDescription>{field.description}</FormDescription>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
				);

			case 'radio':
				return (
					<FormField
						name={field.name}
						control={control}
						defaultValue={getDefaultValue() as string}
						render={({ field: formField }: { field: ControllerRenderProps['field'] }) => (
							<FormItem className="flex flex-row gap-2 items-start">
								<FormLabel className={cn(labelClassName, 'shrink-0 h-9')} required={field.required}>
									{field.label}
								</FormLabel>
								<div className="flex flex-col gap-2 min-h-9 grow-1">
									<RadioGroup
										onValueChange={(value: string) => formField.onChange(value)}
										value={formField.value as string}
										className="flex flex-col space-y-2 mt-2.5"
									>
										{field.options?.map((option) => (
											<div key={option.value} className="flex items-center space-x-2">
												<FormItem className="flex items-center gap-3">
													<FormControl>
														<RadioGroupItem value={option.value} />
													</FormControl>
													<FormLabel className="font-normal">{option.label}</FormLabel>
												</FormItem>
											</div>
										))}
									</RadioGroup>

									<FormDescription>{field.description}</FormDescription>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
				);

			case 'number':
				return (
					<FormField
						name={field.name}
						control={control}
						defaultValue={getDefaultValue() as number}
						render={({ field: formField }: { field: ControllerRenderProps['field'] }) => (
							<FormItem className="flex flex-row gap-2 items-start">
								<FormLabel className={cn(labelClassName, 'shrink-0 h-9')} required={field.required}>
									{field.label}
								</FormLabel>
								<div className="flex flex-col gap-2 min-h-9 grow-1">
									<FormControl>
										<Input
											{...formField}
											type="number"
											value={formField.value as number}
											onChange={(e) => formField.onChange(Number(e.target.value))}
											placeholder={field.placeholder}
											className={error ? 'border-red-500' : ''}
										/>
									</FormControl>
									<FormDescription>{field.description}</FormDescription>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
				);
			case 'date':
				return (
					<FormField
						name={field.name}
						control={control}
						defaultValue={getDefaultValue() as DateValue}
						render={({ field: formField }: { field: ControllerRenderProps['field'] }) => (
							<FormItem className="flex flex-row gap-2 items-start">
								<FormLabel className={cn(labelClassName, 'shrink-0 h-9')} required={field.required}>
									{field.label}
								</FormLabel>
								<div className="flex flex-col gap-2 min-h-9 grow-1">
									<FormControl>
										<DatePicker
											{...formField}
											value={formField.value as DateValue}
											placeholder={field.placeholder}
											className={error ? 'border-red-500' : ''}
										/>
									</FormControl>
									<FormDescription>{field.description}</FormDescription>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
				);
			case 'date-range':
				return (
					<FormField
						name={field.name}
						control={control}
						defaultValue={getDefaultValue() as DateRangeValue}
						render={({ field: formField }: { field: ControllerRenderProps['field'] }) => (
							<FormItem className="flex flex-row gap-2 items-start">
								<FormLabel className={cn(labelClassName, 'shrink-0 h-9')} required={field.required}>
									{field.label}
								</FormLabel>
								<div className="flex flex-col gap-2 min-h-9 grow-1">
									<FormControl>
										<DateRangePicker {...formField} value={formField.value as DateRangeValue} />
									</FormControl>
									<FormDescription>{field.description}</FormDescription>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
				);
			case 'rich-text':
				return (
					<FormField
						name={field.name}
						control={control}
						defaultValue={getDefaultValue() as string}
						render={({ field: formField }: { field: ControllerRenderProps['field'] }) => (
							<FormItem className="flex flex-row gap-2 items-start">
								<FormLabel className={cn(labelClassName, 'shrink-0 h-9')} required={field.required}>
									{field.label}
								</FormLabel>
								<div className="flex flex-col gap-2 min-h-9 grow-1">
									<FormControl>
										<RichTextEditor {...formField} value={formField.value as string} />
									</FormControl>
									<FormDescription>{field.description}</FormDescription>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
				);

			default:
				return (
					<FormField
						name={field.name}
						control={control}
						defaultValue={getDefaultValue() as string}
						render={({ field: formField }) => {
							return (
								<FormItem className="flex flex-row gap-2 items-start">
									<FormLabel className={cn(labelClassName, 'shrink-0 h-9')} required={field.required}>
										{field.label}
									</FormLabel>
									<div className="flex flex-col gap-2 min-h-9 grow-1">
										<FormControl>
											<Input
												{...formField}
												onChange={(e) => formField.onChange(e.target.value)}
												type={field.type}
												value={formField.value as string}
												placeholder={field.placeholder}
												className={error ? 'border-red-500' : ''}
											/>
										</FormControl>
										<FormDescription>{field.description}</FormDescription>
										<FormMessage />
									</div>
								</FormItem>
							);
						}}
					/>
				);
		}
	};

	return (
		<div key={field.name} className="space-y-2">
			{fieldContent()}
		</div>
	);
};

// 主表单组件
export function ConfigurableForm<T extends readonly FieldConfig[]>({
	title,
	className = 'space-y-8 max-w-2xl mx-auto',
	description,
	fields,
	submitText = '提交',
	cancelText = '取消',
	defaultValues, // 新增参数
	onSubmit,
	labelClassName = 'w-24',
	onCancel,
}: FormConfig<T>) {
	const schema = createSchema(fields);

	// 处理默认值，确保类型安全
	const processedDefaultValues = React.useMemo(() => {
		const result: Record<string, ValueType> = {};

		fields.forEach((field) => {
			const formDefault = defaultValues?.[field.name as keyof typeof defaultValues];
			const fieldDefault = field.defaultValue;

			if (formDefault !== undefined) {
				result[field.name] = formDefault as ValueType;
			} else if (fieldDefault !== undefined) {
				result[field.name] = fieldDefault;
			} else {
				// 设置类型默认值
				switch (field.type) {
					case 'number':
						result[field.name] = 0;
						break;
					case 'checkbox':
						result[field.name] = undefined;
						break;
					default:
						result[field.name] = '';
				}
			}
		});

		return result;
	}, [fields, defaultValues]);

	const form = useForm<Record<string, ValueType>>({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues: processedDefaultValues, // 使用处理后的默认值
	});

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = form;

	const onFormSubmit = async (data: Record<string, ValueType>) => {
		try {
			await onSubmit(data as FormData<T>);
		} catch (error) {
			console.error('表单提交失败:', error);
		}
	};

	// 重置到默认值
	const resetToDefaults = () => {
		reset(processedDefaultValues);
		onCancel?.();
	};

	return (
		<div className={className}>
			{(title || description) && (
				<>
					{title && <h1 className="text-2xl font-bold">{title}</h1>}
					{description && <p className="text-muted-foreground text-sm text-balance">{description}</p>}
				</>
			)}
			<Form {...form}>
				<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
					{fields.map((field) => (
						<RenderField {...{ field, control, errors, processedDefaultValues, labelClassName }} key={field.name} />
					))}

					<div className="flex gap-4 pt-4">
						<LoadingButton type="submit" disabled={isSubmitting} className="flex-1">
							{isSubmitting ? '提交中...' : submitText}
						</LoadingButton>
						<LoadingButton
							type="button"
							disabled={isSubmitting}
							className="flex-1"
							variant="outline"
							onClick={resetToDefaults}
						>
							{cancelText}
						</LoadingButton>
					</div>
				</form>
			</Form>
		</div>
	);
}
