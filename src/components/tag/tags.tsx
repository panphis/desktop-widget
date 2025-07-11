import type { FC } from 'react';

import { ListType, Tag } from '.';

type TagsProps = {
	options: ListType[];
	value: ListType['value'];
};

export const Tags: FC<TagsProps> = ({ options, value }) => {
	const activeItem = options?.find((item) => item.value === value);
	if (!activeItem) {
		return <>--</>;
	}
	const { className, color, label } = activeItem!;
	return (
		<Tag className={className} color={color}>
			{label}
		</Tag>
	);
};
export default Tags;
