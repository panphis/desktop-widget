import dayjs from 'dayjs';

export const formatTime = (time: number | string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string =>
	dayjs(time).format(format);

// 返回一个千分位格式化的数字字符串
export const formatNumber = (value: number | string): string => {
	return Number(value).toLocaleString('en-US', {
		minimumFractionDigits: 0,
	});
};
