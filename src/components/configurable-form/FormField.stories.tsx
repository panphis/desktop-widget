import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { z } from 'zod';

import { ConfigurableForm } from '.';

const meta: Meta<typeof ConfigurableForm> = {
	title: 'Components/ConfigurableForm/Field Types',
	component: ConfigurableForm,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: '展示不同字段类型的详细用法和配置选项',
			},
		},
	},
	args: {
		onSubmit: fn(),
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// 文本输入字段
export const TextFields: Story = {
	args: {
		title: '文本输入字段',
		fields: [
			{
				name: 'basic_text',
				label: '基础文本',
				type: 'text',
				placeholder: '请输入文本',
			},
			{
				name: 'required_text',
				label: '必填文本',
				type: 'text',
				placeholder: '这是必填字段',
				required: true,
			},
			{
				name: 'validated_text',
				label: '带验证的文本',
				type: 'text',
				placeholder: '至少3个字符',
				required: true,
				validation: z.string().min(3, '至少输入3个字符'),
				description: '这个字段有最小长度验证',
			},
			{
				name: 'email',
				label: '邮箱地址',
				type: 'email',
				placeholder: 'user@example.com',
				required: true,
			},
			{
				name: 'password',
				label: '密码',
				type: 'password',
				placeholder: '请输入密码',
				required: true,
				validation: z.string().min(6, '密码至少6个字符'),
			},
		] as const,
	},
};

// 数字字段
export const NumberFields: Story = {
	args: {
		title: '数字字段',
		fields: [
			{
				name: 'basic_number',
				label: '基础数字',
				type: 'number',
				placeholder: '请输入数字',
			},
			{
				name: 'age',
				label: '年龄',
				type: 'number',
				placeholder: '请输入年龄',
				required: true,
				validation: z.number().min(0, '年龄不能为负数').max(150, '年龄不能超过150'),
				description: '年龄范围：0-150',
			},
			{
				name: 'price',
				label: '价格',
				type: 'number',
				placeholder: '请输入价格',
				validation: z.number().min(0.01, '价格必须大于0').optional(),
				description: '价格必须大于0',
			},
		] as const,
		defaultValues: {
			basic_number: 42,
			age: 25,
		},
	},
};

// 选择字段
export const SelectFields: Story = {
	args: {
		title: '选择字段',
		fields: [
			{
				name: 'country',
				label: '国家',
				type: 'select',
				required: true,
				options: [
					{ label: '中国', value: 'china' },
					{ label: '美国', value: 'usa' },
					{ label: '日本', value: 'japan' },
					{ label: '英国', value: 'uk' },
					{ label: '德国', value: 'germany' },
				],
			},
			{
				name: 'city',
				label: '城市',
				type: 'select',
				placeholder: '请选择城市',
				options: [
					{ label: '北京', value: 'beijing' },
					{ label: '上海', value: 'shanghai' },
					{ label: '广州', value: 'guangzhou' },
					{ label: '深圳', value: 'shenzhen' },
				],
				description: '选择您所在的城市',
			},
			{
				name: 'priority',
				label: '优先级',
				type: 'radio',
				required: true,
				options: [
					{ label: '低', value: 'low' },
					{ label: '中', value: 'medium' },
					{ label: '高', value: 'high' },
					{ label: '紧急', value: 'urgent' },
				],
			},
			{
				name: 'skills',
				label: '技能领域',
				type: 'radio',
				options: [
					{ label: '前端开发', value: 'frontend' },
					{ label: '后端开发', value: 'backend' },
					{ label: '全栈开发', value: 'fullstack' },
					{ label: 'UI/UX设计', value: 'design' },
					{ label: '数据分析', value: 'data' },
				],
				description: '选择您的主要技能领域',
			},
		] as const,
		defaultValues: {
			country: 'china',
			priority: 'medium',
		},
	},
};

// 文本域和复选框
export const TextareaAndCheckbox: Story = {
	args: {
		title: '文本域和复选框',
		fields: [
			{
				name: 'description',
				label: '项目描述',
				type: 'textarea',
				placeholder: '请详细描述您的项目...',
				required: true,
				validation: z.string().min(20, '描述至少20个字符').max(500, '描述最多500个字符'),
				description: '20-500个字符',
			},
			{
				name: 'feedback',
				label: '反馈意见',
				type: 'textarea',
				placeholder: '请提供您的反馈...',
				validation: z.string().max(1000, '反馈最多1000个字符').optional(),
			},
			{
				name: 'agree_terms',
				label: '我同意服务条款',
				type: 'checkbox',
				required: true,
			},
			{
				name: 'subscribe_newsletter',
				label: '订阅新闻通讯',
				type: 'checkbox',
				description: '接收最新产品更新和优惠信息',
			},
			{
				name: 'enable_notifications',
				label: '启用通知',
				type: 'checkbox',
				description: '允许发送推送通知',
			},
		] as const,
		defaultValues: {
			description: '这是一个创新的Web应用项目，旨在提供优秀的用户体验。',
			subscribe_newsletter: true,
			enable_notifications: false,
		},
	},
};

const preDate = new Date();
preDate.setDate(preDate.getDate() - 10);
const currentTime = new Date();
// 日期
export const DateAndDateRange: Story = {
	args: {
		title: '日期',
		fields: [
			{
				name: 'date',
				label: '日期',
				type: 'date',
				required: true,
				description: '请选择日期',
			},
			{
				name: 'date_range',
				label: '日期范围',
				type: 'date-range',
				required: true,
				description: '请选择日期范围',
			},
		] as const,
		defaultValues: {
			date: new Date(),
			date_range: [new Date(preDate), new Date(currentTime)],
		},
	},
};

// 富文本
export const AllDemo: Story = {
	args: {
		title: '文本',
		fields: [
			{
				name: 'text',
				label: 'Text',
				type: 'text',
				required: false,
				description: '请输入text',
			},
			{
				name: 'email',
				label: 'Email',
				type: 'email',
				required: true,
				description: '请输入email',
			},
			{
				name: 'password',
				label: 'Password',
				type: 'password',
				required: true,
				description: '请输入password',
			},
			{
				name: 'number',
				label: 'number',
				type: 'number',
				required: true,
				description: '请输入number',
			},
			{
				name: 'textarea',
				label: 'textarea',
				type: 'textarea',
				required: true,
				description: '请输入textarea',
			},
			{
				name: 'select',
				label: 'select',
				type: 'select',
				required: true,
				description: '请选择select',
				options: [
					{
						label: '1',
						value: '1',
					},
					{
						label: '2',
						value: '3',
					},
				],
			},
			{
				name: 'radio',
				label: 'radio',
				type: 'radio',
				required: true,
				description: '请选择radio',
				options: [
					{
						label: '1',
						value: '1',
					},
					{
						label: '2',
						value: '3',
					},
				],
			},
			{
				name: 'checkbox',
				label: 'checkbox',
				type: 'checkbox',
				required: true,
				description: '请选择checkbox',
			},
			{
				name: 'date',
				label: '日期',
				type: 'date',
				required: true,
				description: '请选择日期',
			},
			{
				name: 'date_range',
				label: '日期范围',
				type: 'date-range',
				required: true,
				description: '请选择日期范围',
			},
		] as const,
	},
};
