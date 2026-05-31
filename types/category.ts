export type WCProductCategoryRow = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  menu_order?: number;
};

export type ProductCategoryNavItem = {
  id: number;
  name: string;
  slug: string;
  count: number;
};
