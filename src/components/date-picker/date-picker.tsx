'use client';

import { CalendarIcon, ChevronLeft, ChevronRight, XIcon } from 'lucide-react';
import { ChangeEvent, useImperativeHandle, useMemo, useState } from 'react';
import { forwardRef } from 'react';
import { DayPicker } from 'react-day-picker';

import { formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';

import {
	Button,
	Calendar,
	Input,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui';

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

type DateValueType = undefined | Date;

type DateRangePickerProps = {
	value: DateValueType;
	onChange: (value: DateValueType) => void;
	id?: string;
	disable?: boolean;
	placeholder?: string;
} & React.ComponentProps<typeof DayPicker>;

type DatePickerRefType = {
	value: DateValueType;
	setValue: (value: Date) => void;
	focus: () => void;
	select: () => void;
	setCustomValidity: (message: string) => void;
	reportValidity: () => void;
};

const DatePicker = forwardRef<DatePickerRefType, DateRangePickerProps>(
	({ value, onChange, id, disable, placeholder = '请选择日期', ...othersProps }, ref) => {
		useImperativeHandle(
			ref,
			() => {
				return {
					value,
					setValue: (newValue: Date) => {
						if (newValue instanceof Date || newValue === undefined) {
							onChange(newValue);
						} else {
							console.warn('Invalid date value provided to DatePicker');
						}
					},
					focus: () => { },
					select: () => { },
					setCustomValidity: console.log,
					reportValidity: () => { },
				};
			},
			[value, onChange]
		);

		const [open, setOpen] = useState(false);

		const time = useMemo(() => {
			const date = value ? new Date(value) : new Date();
			const year = date.getFullYear();
			const month = date.getMonth();
			const hours = value ? date.getHours().toString().padStart(2, '0') : '00';
			const minutes = value ? date.getMinutes().toString().padStart(2, '0') : '00';
			const seconds = value ? date.getSeconds().toString().padStart(2, '0') : '00';
			return {
				year,
				month,
				hours,
				minutes,
				seconds,
			};
		}, [value]);

		const handleDateSelect = (date: DateValueType) => {
			if (date) {
				const newDate = new Date(date);
				newDate.setHours(Number.parseInt(time.hours));
				newDate.setMinutes(Number.parseInt(time.minutes));
				newDate.setSeconds(Number.parseInt(time.seconds));
				updateValue(newDate);
			}
		};

		const updateValue = (date: DateValueType) => {
			onChange(date);
		};

		const handleTimeChange = (field: 'hours' | 'minutes' | 'seconds', inputValue: string) => {
			const numValue = Number.parseInt(inputValue) || 0;
			let clampedValue = numValue;
			if (field === 'hours') {
				clampedValue = Math.max(0, Math.min(23, numValue));
			} else {
				clampedValue = Math.max(0, Math.min(59, numValue));
			}

			const newTime = {
				hours: time.hours,
				minutes: time.minutes,
				seconds: time.seconds,
				[field]: clampedValue.toString().padStart(2, '0'),
			};

			const newDate = new Date(value ? value : new Date());
			newDate.setHours(Number.parseInt(newTime.hours));
			newDate.setMinutes(Number.parseInt(newTime.minutes));
			newDate.setSeconds(Number.parseInt(newTime.seconds));
			updateValue(newDate);
		};

		const handleMonthChange = (date: Date) => {
			const newDate = new Date(value ? value : new Date());
			newDate.setMonth(date.getMonth());
			newDate.setFullYear(date.getFullYear());
			updateValue(newDate);
		};

		const handleMonthSelect = (monthValue: string) => {
			const newDate = new Date(value ? value : new Date());
			newDate.setMonth(Number.parseInt(monthValue));
			updateValue(newDate);
		};

		const handleYearChange = (direction: 'prev' | 'next') => {
			const currentYear = direction === 'prev' ? time.year - 1 : time.year + 1;
			const newDate = new Date(value ? value : new Date());
			newDate.setFullYear(currentYear);
			updateValue(newDate);
		};

		const handleYearSelect = (e: ChangeEvent<HTMLInputElement>): void => {
			const currentYear = parseInt(e.target.value, 10);
			const newDate = new Date(value ? value : new Date());
			newDate.setFullYear(currentYear);
			updateValue(newDate);
		};

		const handleClear = (e: React.MouseEvent<HTMLButtonElement>): void => {
			console.log('handleClear');
			e.stopPropagation();
			e.preventDefault();
			updateValue(undefined);
		};

		return (
			<div className="w-full max-w-md space-y-4">
				<div className="space-y-2">
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button
								disabled={disable}
								variant={'outline'}
								id={id}
								type='button'
								className={cn('w-full justify-start text-left font-normal')}
								onClick={() => setOpen(true)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{value ? formatTime(value, 'YYYY年MM月DD日 HH:mm:ss') : placeholder}
							</Button>

						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<div className="p-4 space-y-4">
								{/* 年份和月份选择器 */}
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<Button variant="outline" size="icon" onClick={() => handleYearChange('prev')} className="h-8 w-8">
											<ChevronLeft className="h-4 w-4" />
										</Button>

										{/* <span className="font-medium text-lg min-w-[4rem] text-center">{year}</span> */}
										<Input className="w-20" value={time.year} onChange={handleYearSelect} />

										<Button variant="outline" size="icon" onClick={() => handleYearChange('next')} className="h-8 w-8">
											<ChevronRight className="h-4 w-4" />
										</Button>
									</div>

									<Select value={time.month.toString()} onValueChange={handleMonthSelect}>
										<SelectTrigger className="w-20">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{months.map((month, index) => (
												<SelectItem key={month} value={index.toString()}>
													{month}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* 日历 */}
								<Calendar
									{...othersProps}
									mode="single"
									selected={value}
									onSelect={handleDateSelect}
									month={value}
									onMonthChange={(date) => {
										handleMonthChange(date);
									}}
									className="rounded-md border-0 w-full"
								/>

								{/* 时间选择器 */}
								<div className="space-y-3 border-t pt-4">
									<div className="flex items-center space-x-2">
										<Input
											type="number"
											min="0"
											max="23"
											value={time.hours}
											onChange={(e) => handleTimeChange('hours', e.target.value)}
											className="text-center"
										/>
										<span className="text-lg font-bold text-gray-400">:</span>
										<Input
											type="number"
											min="0"
											max="59"
											value={time.minutes}
											onChange={(e) => handleTimeChange('minutes', e.target.value)}
											className="text-center"
										/>
										<span className="text-lg font-bold text-gray-400">:</span>
										<Input
											id="seconds"
											type="number"
											min="0"
											max="59"
											value={time.seconds}
											onChange={(e) => handleTimeChange('seconds', e.target.value)}
											className="text-center"
										/>
									</div>
								</div>

								<div className='flex justify-end'>

									{value && (
										<Button onClick={handleClear} asChild variant="ghost" size="icon" className="m-0 p-0 w-max">
											清除<XIcon className="h-4 w-4" />
										</Button>
									)}
									<Button className="w-full" onClick={() => setOpen(false)}>
										确认选择
									</Button>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</div>
		);
	}
);

DatePicker.displayName = 'DatePicker';
export { DatePicker };
export default DatePicker;
