import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 设置 dayjs 的默认语言为中文
dayjs.locale('zh-cn');

export const formatTime = (time: number | string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string =>
	dayjs(time).format(format);

// 返回一个千分位格式化的数字字符串
export const formatNumber = (value: number | string): string => {
	return Number(value).toLocaleString('zh-CN', {
		minimumFractionDigits: 0,
	});
};
