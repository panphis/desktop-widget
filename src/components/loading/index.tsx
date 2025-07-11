import { Loader2 } from 'lucide-react';
import * as motion from 'motion/react-client';
import type { FC, ReactNode } from 'react';

interface LoadingProps {
	loading: boolean;
	children: ReactNode;
	className?: string;
	loadingText?: string;
}

export const Loading: FC<LoadingProps> = ({ loading, children, className = '', loadingText = '加载中...' }) => {
	return (
		<div className={`relative ${className}`}>
			{children}

			{loading && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.5 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50"
				>
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.8, opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeOut' }}
						className="flex flex-col items-center gap-3 bg-white rounded-lg shadow-lg p-6"
					>
						<Loader2 className="w-8 h-8 animate-spin text-blue-600" />
						<span className="text-sm text-gray-600 font-medium">{loadingText}</span>
					</motion.div>
				</motion.div>
			)}
		</div>
	);
};
export default Loading;
