import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import { cloneElement, forwardRef, isValidElement, type ReactElement } from 'react';

import { Button, type ButtonProps } from '@/components/ui/button';

interface LoadingButtonProps extends ButtonProps {
	loading?: boolean;
	loadingText?: string;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
	({ children, loading = false, loadingText, disabled, asChild = false, ...props }, ref) => {
		// 如果不是 asChild 模式，使用原来的逻辑
		if (!asChild) {
			return (
				<Button ref={ref} disabled={disabled || loading} {...props}>
					{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{loading ? loadingText || children : children}
				</Button>
			);
		}

		// asChild 模式下的处理
		if (isValidElement(children)) {
			// 类型安全的处理方式
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const child = children as ReactElement<any>;
			const originalChildren = child.props.children;

			const childProps = {
				...child.props,
				disabled: disabled || loading,
				children: (
					<>
						{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{loading ? loadingText || originalChildren : originalChildren}
					</>
				),
			};

			return (
				<Slot ref={ref} {...props}>
					{cloneElement(child, childProps)}
				</Slot>
			);
		}

		// 如果 children 不是有效的 React 元素，回退到普通模式
		return (
			<Button ref={ref} disabled={disabled || loading} {...props}>
				{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				{loading ? loadingText || children : children}
			</Button>
		);
	}
);

LoadingButton.displayName = 'LoadingButton';

export { LoadingButton };
export type { LoadingButtonProps };
