'use client';

import { Fragment, useImperativeHandle } from 'react';
import { forwardRef } from 'react';

import { DatePicker } from './date-picker';

type DateValueType = undefined | Date;

type DateRangePickerProps = {
	value?: [DateValueType, DateValueType];
	onChange: (value?: [DateValueType, DateValueType]) => void;
	id?: string;
	disable?: boolean;
};

type DateRangePickerRefType = {
	value: [DateValueType, DateValueType];
	setValue: (value: [DateValueType, DateValueType]) => void;
	focus: () => void;
	select: () => void;
	setCustomValidity: (message: string) => void;
	reportValidity: () => void;
};
const DateRangePicker = forwardRef<DateRangePickerRefType, DateRangePickerProps>(
	({ value, onChange, id, disable }, ref) => {
		useImperativeHandle(
			ref,
			() => {
				return {
					value: value ?? [undefined, undefined],
					setValue: (newValue: [DateValueType, DateValueType]) => {
						onChange?.(newValue);
					},
					focus: () => {},
					select: () => {},
					setCustomValidity: console.log,
					reportValidity: () => {},
				};
			},
			[value, onChange]
		);
		const [startTime, endTime] = value ?? [];

		const handleEmit = (value: [DateValueType, DateValueType]) => {
			if (value[0] || value[1]) {
				onChange?.(value);
			} else {
				onChange?.(undefined);
			}
		};

		const handleStartChange = (date: DateValueType) => {
			if (date && endTime && date > endTime) {
				console.warn('开始日期不能大于结束日期');
				return;
			}
			const newValue = [date, endTime] as [DateValueType, DateValueType];
			handleEmit(newValue);
		};

		const handleEndChange = (date: DateValueType) => {
			if (date && startTime && date < startTime) {
				console.warn('结束日期不能小于开始日期');
				return;
			}
			const newValue = [startTime, date] as [DateValueType, DateValueType];
			handleEmit(newValue);
		};

		return (
			<Fragment>
				<div className="flex gap-2 items-center">
					<DatePicker
						placeholder="请选择开始日期"
						value={startTime}
						id={id}
						disable={disable}
						onChange={handleStartChange}
					/>
					-
					<DatePicker placeholder="请选择结束日期" value={endTime} disable={disable} onChange={handleEndChange} />
				</div>
			</Fragment>
		);
	}
);

DateRangePicker.displayName = 'DateRangePicker';
export { DateRangePicker };
export default DateRangePicker;
