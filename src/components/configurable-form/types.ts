import type { FieldErrors } from 'react-hook-form';
import type { z } from 'zod';

// 字段类型定义
export type FieldType =
	| 'text'
	| 'email'
	| 'password'
	| 'number'
	| 'textarea'
	| 'select'
	| 'checkbox'
	| 'radio'
	| 'date'
	| 'date-range'
	| 'rich-text';

// 选项类型（用于select和radio）
export interface Option {
	label: string;
	value: string;
}

// 根据字段类型推断值类型
export type FieldValue<T extends FieldType> = T extends 'number'
	? number
	: T extends 'checkbox'
	? boolean
	: T extends 'text' | 'email' | 'password' | 'textarea' | 'select' | 'radio'
	? string
	: never;

// 字段配置接口 - 使用泛型确保类型安全
export interface FieldConfig<T extends FieldType = FieldType> {
	name: string;
	label: string;
	type: T;
	placeholder?: string;
	required?: boolean;
	validation?: z.ZodTypeAny;
	options?: T extends 'select' | 'radio' ? Option[] : never;
	description?: string;
	defaultValue?: FieldValue<T>;
}

// 从字段配置数组推断表单数据类型
export type FormData<T extends readonly FieldConfig[]> = {
	[K in T[number] as K['name']]: K['required'] extends true ? FieldValue<K['type']> : FieldValue<K['type']> | undefined;
};

export type InferFormData<T extends readonly FieldConfig[]> = {
	[K in T[number] as K['name']]: K['required'] extends true ? FieldValue<K['type']> : FieldValue<K['type']> | undefined;
};

// 表单配置接口 - 使用泛型
export interface FormConfig<T extends readonly FieldConfig[]> {
	title?: string;
	description?: string;
	className?: string;
	labelClassName?: string;
	fields: T;
	submitText?: string;
	cancelText?: string;
	defaultValues?: Partial<FormData<T>>;
	onSubmit: (data: FormData<T>) => Promise<void>;
	onCancel?: () => void;
}

// 使用 React Hook Form 的 FieldErrors 类型
export type FormErrors = FieldErrors<Record<string, ValueType>>;

// 控制器渲染参数类型
export interface ControllerRenderProps {
	field: {
		onChange: (value: ValueType) => void;
		onBlur: () => void;
		value: ValueType;
		name: string;
	};
}

export type DateValue = Date | undefined;

export type DateRangeValue = [DateValue, DateValue] | undefined;

export type ValueType = string | number | boolean | DateValue | DateRangeValue | undefined;
