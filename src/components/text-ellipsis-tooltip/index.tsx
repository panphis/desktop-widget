'use client';

import { ReactNode, useLayoutEffect, useRef, useState } from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TextEllipsisTooltipProps {
	children: ReactNode;
	className?: string;
	maxLines?: number;
	ellipsis?: boolean;
}

export function TextEllipsisTooltip({
	children,
	className = '',
	ellipsis = false,
	maxLines = 1,
}: TextEllipsisTooltipProps) {
	const textRef = useRef<HTMLDivElement>(null);
	const [isOverflowing, setIsOverflowing] = useState(false);

	useLayoutEffect(() => {
		const element = textRef.current;
		if (!element) return;

		// 检查文本是否溢出
		const checkOverflow = () => {
			if (maxLines === 1) {
				// 单行文本检查
				setIsOverflowing(element.scrollWidth > element.clientWidth);
			} else {
				// 多行文本检查
				setIsOverflowing(element.scrollHeight > element.clientHeight);
			}
		};

		checkOverflow();

		// 监听窗口大小变化
		const resizeObserver = new ResizeObserver(checkOverflow);
		resizeObserver.observe(element);

		return () => {
			resizeObserver.disconnect();
		};
	}, [children, maxLines]);

	if (!ellipsis) {
		return children;
	}

	const textElement = (
		<div
			ref={textRef}
			className={`
        w-full
        ${maxLines === 1 ? 'truncate' : `line-clamp-${maxLines}`}
        ${className}
      `}
			style={
				maxLines > 1
					? {
							display: '-webkit-box',
							WebkitLineClamp: maxLines,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
					  }
					: undefined
			}
		>
			{children}
		</div>
	);

	// 如果文本没有溢出，直接返回文本元素
	if (!isOverflowing) {
		return textElement;
	}

	// 如果文本溢出，包装在 Tooltip 中
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>{textElement}</TooltipTrigger>
				<TooltipContent>
					<p className="max-w-xs whitespace-pre-wrap break-words">{children}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
