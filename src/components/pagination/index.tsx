import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { FC, Fragment, useMemo } from 'react';

import {
	Pagination as UPagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
} from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PaginationProps = {
	onPageChange?: (page: number) => void;
	onPageSizeChange: (size: number) => void;
	page: number;
	pageSize: number;
	totalRecords: number;
	totalPages: number;
};

export const Pagination: FC<PaginationProps> = ({
	onPageSizeChange,
	page,
	pageSize,
	totalPages,
	totalRecords,
	onPageChange,
}) => {
	const pageList = useMemo(() => {
		const list = [page - 2, page - 1, page, page + 1, page + 2].filter((p) => p > 0 && p <= totalPages);
		return list;
	}, [page, totalPages]);

	return (
		<Fragment>
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center space-x-2">
					<p className="text-sm text-muted-foreground">每页显示</p>
					<Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
						<SelectTrigger className="h-8 w-[70px]" aria-label={`page size - ${pageSize}`}>
							<SelectValue placeholder={pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[1, 10, 20, 50, 100].map((size) => (
								<SelectItem key={size} value={size.toString()}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-sm text-muted-foreground">条记录</p>
				</div>

				<div className="flex shrink-0 grow items-center gap-4 justify-end">
					<div className="flex items-center space-x-2">
						<p className="text-sm font-medium">
							第 {page} 页，共 {totalPages} 页 , {totalRecords} 条记录
						</p>
					</div>
					<UPagination className="w-max m-0">
						<PaginationContent>
							<PaginationItem onClick={() => onPageChange && onPageChange(page - 1 >= 1 ? page - 1 : 1)}>
								<ChevronLeftIcon />
							</PaginationItem>
							{pageList.length > 0 && pageList[0] > 1 && (
								<PaginationItem>
									<PaginationLink onClick={() => onPageChange && onPageChange(1)}>1</PaginationLink>
								</PaginationItem>
							)}
							{pageList.length > 0 && pageList[0] > 2 && (
								<PaginationItem>
									<PaginationEllipsis />
								</PaginationItem>
							)}
							{pageList.map((p) => (
								<PaginationItem key={p}>
									<PaginationLink isActive={p === page} onClick={() => onPageChange && onPageChange(p)}>
										{p}
									</PaginationLink>
								</PaginationItem>
							))}
							{pageList.length > 0 && pageList[pageList.length - 1] < totalPages - 1 && (
								<PaginationItem>
									<PaginationEllipsis />
								</PaginationItem>
							)}
							{pageList.length > 0 && pageList[pageList.length - 1] < totalPages && (
								<PaginationItem>
									<PaginationLink onClick={() => onPageChange && onPageChange(totalPages)}>{totalPages}</PaginationLink>
								</PaginationItem>
							)}
							<PaginationItem
								onClick={() => onPageChange && onPageChange(page + 1 > totalPages ? totalPages : page + 1)}
							>
								<ChevronRightIcon />
							</PaginationItem>
						</PaginationContent>
					</UPagination>
				</div>
			</div>
		</Fragment>
	);
};
export default UPagination;
