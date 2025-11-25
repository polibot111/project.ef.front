// ** LAYOUTS **

// ** PAGE ROUTES **
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/auth/login.vue";

// ** Fabric Management **
import FabricManagementView from "../views/fabric-management/index.vue";
import FabricTypeView from "../views/fabric-management/type.vue";
import FabricModelView from "../views/fabric-management/model.vue";
import FabricColorView from "../views/fabric-management/color.vue";
import FabricOrderView from "../views/fabric-management/order.vue";

// ** Capitone Management **
import CapitoneManagementView from "../views/capitone-management/index.vue";
import CapitoneCreateView from "../views/capitone-management/create.vue";
import CapitoneListView from "../views/capitone-management/list.vue";

// ** Stock Management **
import StockManagementView from "../views/stock-management/index.vue";
import StockChangesView from "../views/stock-management/changes.vue";
import StockStatusView from "../views/stock-management/status.vue";

// ** Staff Management **
import StaffManagementListView from "../views/staff-management/list.vue";
import StaffManagementDepartmentView from "../views/staff-management/department.vue";

// ** Customer Management **
import CustomerManagementView from "../views/customer-management/index.vue";

// ** Manufacturer Management **
import ManufacturerManagementView from "../views/manufacturer-management/index.vue";

// ** Workshop Management **
import WorkshopManagementView from "../views/workshop-management/workshopList.vue";
import ToWorkshopOrderList from "../views/workshop-management/ToWorkshopOrderList.vue";

// ** Set Management **
import SetManagementView from "../views/set-management/index.vue";

// ** Set Measurement **
import MeasurementView from "../views/measurement-management/index.vue";

// ** Order Preview Management **
import OrderPreviewManagementView from "../views/order-preview-management/index.vue";
import OrderPreviewView from "../views/order-preview-management/preview.vue";

// ** Payment Management **
import PaymentManagementView from "../views/payment-management/index.vue";

// ** Storage Management **
import StorageManagementView from "../views/storage-management/index.vue";
import StorageSendView from "../views/storage-management/send.vue";

const routes: any = [
	{
		path: "/auth/login",
		name: "login",
		component: LoginView,
		meta: {
			layout: "auth",
			menu: false,
			disabled: false,
		},
	},
	{
		path: "/",
		name: "home",
		component: HomeView,
		meta: {
			order: 0,
			layout: "default",
			level: 0,
			title: "Anasayfa",
			menu: true,
			disabled: false,
			icon: "mdi-home-outline",
		},
	},
	{
		path: "/fabric-management",
		name: "fabric-management",
		meta: {
			order: 1,
			layout: "default",
			level: 0,
			title: "Kumaş Yönetimi",
			menu: true,
			disabled: false,
			icon: "mdi-receipt-outline",
		},
		children: [
			{
				path: "/fabric-management/fabric-order",
				name: "fabric-order",
				component: FabricOrderView,
				meta: {
					order: 2,
					layout: "default",
					level: 1,
					title: "Kumaş Siparişi",
					menu: true,
					disabled: false,
					icon: "mdi-cart-outline",
				},
			},
			{
				path: "/fabric-management/fabric-type",
				name: "fabric-type",
				component: FabricTypeView,
				meta: {
					layout: "default",
					level: 1,
					title: "Kumaş Tipi",
					menu: true,
					disabled: false,
					icon: "mdi-format-list-bulleted-type",
				},
			},
			{
				path: "/fabric-management/fabric-color",
				name: "fabric-color",
				component: FabricColorView,
				meta: {
					layout: "default",
					level: 1,
					title: "Kumaş Renkleri",
					menu: true,
					disabled: false,
					icon: "mdi-palette-outline",
				},
			},
		],
	},
	{
		path: "/product-management",
		name: "product-management",
		meta: {
			order: 1,
			layout: "default",
			level: 0,
			title: "Ürün Yönetimi",
			menu: true,
			disabled: false,
			icon: "mdi-tshirt-crew-outline",
		},
		children: [
			{
				path: "/fabric-management/fabric-model",
				name: "fabric-model",
				component: FabricModelView,
				meta: {
					layout: "default",
					level: 1,
					title: "Kumaş Modelleri",
					menu: true,
					disabled: false,
					icon: "mdi-image-filter-vintage",
				},
			},
			{
				path: "/set-management",
				name: "set-management",
				component: SetManagementView,
				meta: {
					layout: "default",
					level: 1,
					title: "Set Yönetimi",
					menu: true,
					disabled: false,
					icon: "mdi-cube-unfolded",
				},
			},
			{
				path: "/measurement-management",
				name: "measurement-management",
				component: MeasurementView,
				meta: {
					layout: "default",
					level: 1,
					title: "Ölçü Yönetimi",
					menu: true,
					disabled: false,
					icon: "mdi-ruler-square",
				},
			},
		],
	},
	{
		path: "/capitone-management",
		name: "capitone-management",
		meta: {
			order: 2,
			layout: "default",
			level: 0,
			title: "Kapitone Yönetimi",
			menu: true,
			disabled: false,
			icon: "mdi-set-merge",
		},
		children: [
			{
				path: "/capitone-management/create",
				name: "capitone-management-create",
				component: CapitoneCreateView,
				meta: {
					layout: "default",
					level: 1,
					title: "Kapitone Oluştur",
					menu: true,
					disabled: false,
					icon: "mdi-playlist-plus",
				},
			},
			{
				path: "/capitone-management/list",
				name: "capitone-management-list",
				component: CapitoneListView,
				meta: {
					layout: "default",
					level: 1,
					title: "Kapitone Listesi",
					menu: true,
					disabled: false,
					icon: "mdi-format-list-bulleted-type",
				},
			},
		],
	},
	{
		path: "/stock-management",
		name: "stock-management",
		meta: {
			order: 3,
			layout: "default",
			level: 0,
			title: "Stok Yönetimi",
			menu: true,
			disabled: false,
			icon: "mdi-package-variant-closed",
		},
		children: [
			{
				path: "/stock-management/changes",
				name: "stock-management-changes",
				component: StockChangesView,
				meta: {
					layout: "default",
					level: 1,
					title: "Stok Hareketleri",
					menu: true,
					disabled: false,
					icon: "mdi-swap-horizontal",
				},
			},
			{
				path: "/stock-management/status",
				name: "stock-management-status",
				component: StockStatusView,
				meta: {
					layout: "default",
					level: 1,
					title: "Stok Durumu",
					menu: true,
					disabled: false,
					icon: "mdi-package-variant",
				},
			},
		],
	},
	{
		path: "/staff-management-list",
		name: "staff-management-index",
		meta: {
			order: 4,
			layout: "default",
			level: 0,
			title: "Personel Yönetimi",
			menu: true,
			disabled: false,
			icon: "mdi-badge-account-outline",
		},
		children: [
			{
				path: "/staff-management-list",
				name: "staff-management-list",
				component: StaffManagementListView,
				meta: {
					layout: "default",
					level: 1,
					title: "Personel Listesi",
					menu: true,
					disabled: false,
					icon: "mdi-text-account",
				},
			},
			{
				path: "/staff-management-department",
				name: "staff-management-department",
				component: StaffManagementDepartmentView,
				meta: {
					layout: "default",
					level: 1,
					title: "Departmanlar",
					menu: true,
					disabled: false,
					icon: "mdi-shape-outline",
				},
			},
		],
	},
	{
		path: "/customer-management",
		name: "customer-management",
		component: CustomerManagementView,
		meta: {
			order: 5,
			layout: "default",
			level: 0,
			title: "Müşteri Yönetimi",
			menu: true,
			disabled: false,
			icon: "mdi-account-group-outline",
		},
	},
	{
		path: "/manufacturer-management",
		name: "manufacturer-management",
		component: ManufacturerManagementView,
		meta: {
			order: 6,
			layout: "default",
			level: 0,
			title: "Üretici Yönetimi",
			menu: true,
			disabled: false,
			icon: "mdi-city-variant-outline",
		},
	},
	{
		path: "/workshop-management",
		name: "workshop-management",
		meta: {
			order: 6,
			layout: "default",
			level: 0,
			title: "Atölye Yönetimi",
			menu: true,
			disabled: false,
			icon: "mdi-factory",
		},
		children: [
			{
				path: "/workshop-management_list",
				name: "order-preview-management-preview_list",
				component: WorkshopManagementView,
				meta: {
					order: 0,
					layout: "default",
					level: 1,
					title: "Atölye Listesi",
					menu: true,
					disabled: false,
					icon: "mdi-format-list-bulleted",
				},
			},
			{
				path: "/workshop-management_to_workshop_order_list",
				name: "order-preview-management_to_workshop_order_list",
				component: ToWorkshopOrderList,
				meta: {
					order: 0,
					layout: "default",
					level: 1,
					title: "Atölyelerdeki İşler",
					menu: true,
					disabled: false,
					icon: "mdi-sine-wave",
				},
			},
		],
	},

	{
		path: "/order-preview-management",
		name: "order-preview-management",
		meta: {
			order: 8,
			layout: "default",
			level: 0,
			title: "Sipariş Yönetimi",
			menu: true,
			disabled: false,
			icon: "mdi-truck-delivery-outline",
		},
		children: [
			{
				path: "/order-preview-management/preview",
				name: "order-preview-management-preview",
				component: OrderPreviewView,
				meta: {
					order: 0,
					layout: "default",
					level: 1,
					title: "Sipariş Önizleme",
					menu: true,
					disabled: false,
					icon: "mdi-magnify-scan",
				},
			},
		],
	},

	{
		path: "/payment-management",
		name: "payment-management",
		component: PaymentManagementView,
		meta: {
			order: 8,
			layout: "default",
			level: 0,
			title: "Ödemeler",
			menu: true,
			disabled: false,
			icon: "mdi-cash-register",
		},
	},
	{
		path: "/storage-management",
		name: "storage-management",
		meta: {
			order: 9,
			layout: "default",
			level: 0,
			title: "Depo Yönetimi",
			menu: true,
			disabled: false,
			icon: "mdi-warehouse",
		},
		children: [
			{
				path: "/storage-management/list",
				name: "storage-management-list",
				component: StorageManagementView,
				meta: {
					order: 0,
					layout: "default", 
					level: 1,
					title: "Depo Listesi",
					menu: true,
					disabled: false,
					icon: "mdi-warehouse",
				},
			},
			{
				path: "/storage-management/send",
				name: "storage-management-send",
				component: StorageSendView,
				meta: {
					order: 1,
					layout: "default", 
					level: 1,
					title: "Depoya Gönderilen",
					menu: true,
					disabled: false,
					icon: "mdi-truck-delivery",
				},
			},
		],
	},
];

export default routes;
