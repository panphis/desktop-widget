import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { DateRangePicker } from './date-range-picker';

const meta = {
	title: 'Example/DateRangePicker',
	component: DateRangePicker,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		value: {
			control: 'object',
		},
	},
	args: {
		onChange: fn(),
	},
} satisfies Meta<typeof DateRangePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

const preDate = new Date();
preDate.setDate(preDate.getDate() - 10);
const currentTime = new Date();

export const Default: Story = {
	args: {
		value: [new Date(preDate), new Date(currentTime)],
		disable: false,
		onChange: fn(),
	},
};
