export type ShowCompletedToWorkshopOrderType = {
	name: string;
	value: number;
};

export const showCompletedToWorkshopOrder: Record<number, ShowCompletedToWorkshopOrderType> = {
	0: {
		name: "Tamamlananlar",
		value: 0,
	},
	1: {
		name: "Tamamlanmayanlar",
		value: 1,
	},
	2: {
		name: "Hepsi",
		value: 2,
	},
};
