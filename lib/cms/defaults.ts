import { BANNER_IMAGE_PATHS } from "@/lib/category-banners";
import { HOME_BANNER_PLACEMENTS } from "@/lib/cms/home-banner-layout";
import { SITE_NAME } from "@/lib/constants";

export const DEFAULT_MARQUEE_PHRASES = [
  "شحن مجانى",
  "توصيل سريع",
  "خدمه ما بعد البيع",
  "افضل مستلزمات البيت الحديث",
] as const;

export const DEFAULT_THEME_COLORS = {
  colorBrandNavy: "#14213d",
  colorBrandGold: "#fca311",
  colorBrandGray: "#e5e5e5",
  colorBrandWhite: "#ffffff",
  colorBackground: "#ffffff",
  colorForeground: "#14213d",
} as const;

export const DEFAULT_SITE_SETTINGS: Record<string, string> = {
  siteName: SITE_NAME,
  tagline: "أدوات المنزل العصرية",
  logoUrl: "",
  marqueeEnabled: "true",
  metaDescription: "أدوات المنزل العصري — Tooliano",
  socialShowHeader: "true",
  socialShowFooter: "false",
  socialShowSide: "false",
  socialSidePosition: "start",
  socialClickMode: "chooser",
  mobileNavMode: "burger",
  mobileDrawerSide: "start",
  mobileShowMarquee: "true",
  mobileShowTagline: "false",
  mobileSocialShowFooter: "true",
  mobileSocialShowHeader: "false",
  mobileFooterCompact: "true",
  mobileFooterShowColumns: "true",
  ...DEFAULT_THEME_COLORS,
};

export const DEFAULT_NAV_MENU = [
  { label: "اكتشافات", href: "/products", linkType: "internal" as const },
  { label: "أجهزة منزلية", href: "/products?category=home-appliances", linkType: "category" as const, categorySlug: "home-appliances" },
  { label: "موبايلات", href: "/products?category=mobiles", linkType: "category" as const, categorySlug: "mobiles" },
  { label: "تلفزيونات", href: "/products?category=televisions", linkType: "category" as const, categorySlug: "televisions" },
  { label: "المنزل", href: "/products?category=home", linkType: "category" as const, categorySlug: "home" },
  { label: "المطبخ", href: "/products?category=kitchen", linkType: "category" as const, categorySlug: "kitchen" },
  { label: "السجاد", href: "/products?category=rugs", linkType: "category" as const, categorySlug: "rugs" },
  { label: "المفروشات", href: "/products?category=furniture", linkType: "category" as const, categorySlug: "furniture" },
  { label: "اللابت", href: "/products?category=laptops", linkType: "category" as const, categorySlug: "laptops" },
  { label: "الصحة والجمال", href: "/products?category=health-beauty", linkType: "category" as const, categorySlug: "health-beauty" },
  { label: "منتجات غذائية", href: "/products?category=food", linkType: "category" as const, categorySlug: "food" },
  { label: "الأزياء والموضة", href: "/products?category=fashion", linkType: "category" as const, categorySlug: "fashion" },
  { label: "أطفال وألعاب", href: "/products?category=kids-toys", linkType: "category" as const, categorySlug: "kids-toys" },
];

export const DEFAULT_HOME_SECTIONS = [
  { key: "category_banners", label: "بنرات التصنيفات", sortOrder: 0 },
  { key: "group_buy", label: "فرص الشراء الجماعي", sortOrder: 1 },
  { key: "campaign_cta", label: "رابط الحملة الحالية", sortOrder: 2 },
] as const;

export const DEFAULT_HOME_BANNERS = [
  {
    imageUrl: BANNER_IMAGE_PATHS[0],
    categorySlug: null as string | null,
    title: "شحن مجاني للطلبات فوق 1000 جنيه",
    placement: HOME_BANNER_PLACEMENTS.TOP_STRIP,
    href: "/products",
    altText: "شحن مجاني للطلبات فوق 1000 جنيه",
    sortOrder: 0,
  },
  {
    imageUrl: BANNER_IMAGE_PATHS[3],
    categorySlug: null as string | null,
    title: "كل تجهيزات الجهاز",
    placement: HOME_BANNER_PLACEMENTS.HERO_MAIN,
    href: "/products",
    altText: "كل تجهيزات الجهاز",
    sortOrder: 1,
  },
  {
    imageUrl: BANNER_IMAGE_PATHS[1],
    categorySlug: null as string | null,
    title: "عرض خاص",
    placement: HOME_BANNER_PLACEMENTS.SIDE_PROMO,
    href: "/products",
    altText: "عرض خاص",
    sortOrder: 2,
  },
  {
    imageUrl: BANNER_IMAGE_PATHS[2],
    categorySlug: null as string | null,
    title: "خصم إضافي",
    placement: HOME_BANNER_PLACEMENTS.SIDE_PROMO,
    href: "/products",
    altText: "خصم إضافي",
    sortOrder: 3,
  },
  ...[
    "السجاد",
    "موبايلات",
    "أدوات رياضية",
    "العناية الشخصية",
    "لابتوب",
    "مبردات الهواء",
    "الشنط",
    "جيمينج",
    "ثلاجات",
    "مراوح",
    "تلفزيونات",
    "وصل حديثاً",
    "الأكثر مبيعاً",
  ].map((title, index) => ({
    imageUrl: BANNER_IMAGE_PATHS[index % BANNER_IMAGE_PATHS.length],
    categorySlug: null as string | null,
    title,
    placement: HOME_BANNER_PLACEMENTS.CATEGORY_ICON,
    href: "/products",
    altText: title,
    sortOrder: index + 4,
  })),
] as const;

export const DEFAULT_FAQ = {
  title: "أسئلة شائعة",
  items: [
    {
      q: "متى أدفع السعر الجماعي؟",
      a: "تدفع مقدماً عند الحجز. إذا اكتملت الحملة بالكمية والوقت المحددين، يُطبَّق السعر الجماعي على طلبك. إن لم تكتمل، تُطبَّق سياسة المحفظة.",
    },
    {
      q: "هل يمكنني إلغاء الحجز؟",
      a: "سياسة الإلغاء ستُعرض بوضوح قبل تأكيد الحجز.",
    },
    {
      q: "ماذا تعني «48 ساعة عمل»؟",
      a: "أيام العمل الرسمية للمنصة (عادةً من الأحد إلى الخميس، باستثناء العطلات). خلالها يمكنك اختيار الاسترداد أو استخدام الرصيد.",
    },
    {
      q: "هل الشحن مشمول؟",
      a: "تفاصيل الشحن تُحدَّد لكل حملة وستظهر عند تفعيل الحجز والدفع.",
    },
    {
      q: "كيف أتابع حالة الحملة؟",
      a: "من هذه الصفحة: شريط التقدم يوضح المحجوز والمتبقي، والعداد يوضح الوقت المتبقي.",
    },
  ],
};

export const DEFAULT_HOW_IT_WORKS = {
  title: "كيف يعمل الشراء الجماعي؟",
  steps: [
    {
      title: "احجز قطعتك",
      text: "ادفع مقدماً واحجز الكمية التي تريدها ضمن الحملة النشطة.",
    },
    {
      title: "انتظر اكتمال الحملة",
      text: "شاهد العدادين: الكمية المتبقية والوقت المتبقي للعرض.",
    },
    {
      title: "نجاح الحملة",
      text: "عند بلوغ الهدف في الوقت المحدد، يُنفَّذ طلبك بالسعر الجماعي.",
    },
    {
      title: "توصيل أو محفظة",
      text: "إن لم تكتمل الحملة، يُضاف المبلغ لمحفظتك بخيارات الاسترداد أو الشراء لاحقاً.",
    },
  ],
};

export const DEFAULT_WALLET_POLICY = {
  title: "ماذا يحدث لأموالك إن لم تكتمل الحملة؟",
  intro:
    "عند الدفع المقدم للحجز وفشل اكتمال الحملة، يُضاف المبلغ إلى محفظتك على الموقع. لديك خلال 48 ساعة عمل أحد الخيارات التالية:",
  options: [
    {
      title: "استرداد نقدي",
      text: "خلال 48 ساعة عمل من إضافة الرصيد للمحفظة، يمكنك طلب استرداد المبلغ.",
    },
    {
      title: "شراء آخر",
      text: "استخدم رصيد المحفظة في أي عملية شراء لاحقة على الموقع.",
    },
    {
      title: "الاحتفاظ بالرصيد",
      text: "اترك المبلغ في محفظتك لاستخدامه وقتما تشاء دون ضغط زمني.",
    },
  ],
};

export const DEFAULT_FOOTER_COLUMNS = [
  {
    title: "المتجر",
    sortOrder: 0,
    links: [
      { label: "المنتجات", href: "/products", sortOrder: 0, external: false },
      { label: "شراء جماعي", href: "/campaign", sortOrder: 1, external: false },
    ],
  },
  {
    title: "الحساب",
    sortOrder: 1,
    links: [
      { label: "تسجيل الدخول", href: "/login", sortOrder: 0, external: false },
      { label: "إنشاء حساب", href: "/register", sortOrder: 1, external: false },
    ],
  },
  {
    title: "تواصل",
    sortOrder: 2,
    links: [
      {
        label: "الموقع الرئيسي",
        href: "https://tooliano.com",
        sortOrder: 0,
        external: true,
      },
    ],
  },
];

export const CONTENT_BLOCK_SLUGS = {
  FAQ: "faq",
  HOW_IT_WORKS: "how_it_works",
  WALLET_POLICY: "wallet_policy",
} as const;
