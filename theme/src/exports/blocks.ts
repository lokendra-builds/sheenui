// SheenUI public API part: Chat, blocks and dashboards. Re-exported by ../index.ts (side-effect free: exports only).

// Chat
export type { TypingDotsProps } from "../components/chat/chat-parts";
export {
  ChatAvatar,
  PresenceDot,
  DeliveryStatus,
  UnreadBadge,
  TypingDots,
  type ChatAvatarProps,
  type ChatAvatarSize,
  type PresenceDotProps,
  type DeliveryStatusProps,
  type UnreadBadgeProps,
} from "../components/chat/chat-parts";
export { ChatThread, type ChatThreadProps } from "../components/chat/chat-thread";
export { ChatWidget, type ChatWidgetProps, type ChatWidgetLink } from "../components/chat/chat-widget";
export {
  ChatComposer,
  type ChatComposerProps,
  type ChatComposerHandle,
  type ChatComposerEditing,
} from "../components/chat/composer";
export {
  ConversationList,
  type ConversationListProps,
  type ConversationListHandle,
} from "../components/chat/conversation-list";
export {
  defaultEmojiCategories,
  defaultQuickReactions,
  emojiName,
  isJumboEmoji,
  type ChatEmoji,
  type ChatEmojiCategory,
  type ChatEmojiCategoryId,
} from "../components/chat/emoji";
export { EmojiPicker, type EmojiPickerProps } from "../components/chat/emoji-picker";
export { defaultChatLabels, resolveChatLabels, type ChatLabels } from "../components/chat/labels";
export { ImageLightbox, type ImageLightboxProps } from "../components/chat/message-parts";
export type {
  ChatAttachment,
  ChatConversation,
  ChatConversationAction,
  ChatDateInput,
  ChatDraft,
  ChatDraftAttachment,
  ChatLinkPreview,
  ChatListFilter,
  ChatMessage,
  ChatMessageStatus,
  ChatParticipant,
  ChatPresence,
  ChatReaction,
  ChatReplyRef,
} from "../components/chat/types";

// Blocks and dashboards
export {
  AiChat,
  defaultAiChatLabels,
  type AiChatProps,
  type AiChatLabels,
  type AiChatMessage,
  type AiChatAttachment,
  type AiChatModel,
  type AiChatRequest,
  type AiChatRespond,
  type AiChatRole,
  type AiChatStatus,
  type AiChatFeedback,
} from "../blocks/ai-chat";
export {
  EcommerceDashboard,
  defaultEcommerceLabels,
  type EcommerceDashboardProps,
  type EcommerceData,
  type EcommerceLabels,
  type EcommerceChannel,
  type EcommerceMetric,
  type EcommerceStage,
} from "../blocks/analytics-ecommerce";
export {
  FinanceDashboard,
  defaultFinanceLabels,
  type FinanceDashboardProps,
  type FinanceData,
  type FinanceLabels,
  type FinanceQuery,
  type FinanceAsset,
  type FinanceTransaction,
  type AssetClass,
} from "../blocks/analytics-finance";
export {
  type AnalyticsGridProps,
  type AnalyticsStateProps,
  type LiveDotProps,
  type PanelSkeletonProps,
  type DashboardBackdropProps,
  type TrendTableProps,
  type CascadeProps,
  AnalyticsShell,
  AnalyticsGrid,
  AnalyticsPanel,
  AnalyticsState,
  KpiStrip,
  RollingNumber,
  DeltaBadge,
  LiveDot,
  PanelSkeleton,
  DashboardBackdrop,
  TrendChart,
  TrendTable,
  StackedTrendChart,
  defaultStackedTrendChartLabels,
  type StackedTrendChartLabels,
  BarTrendChart,
  trendLegend,
  Cascade,
  useAnalyticsDashboard,
  useDashboardData,
  useLiveTicker,
  useCascade,
  useAdaptiveGlass,
  ANALYTICS_RANGES,
  defaultAnalyticsLabels,
  mergeLabels,
  rangePoints,
  rangeLength,
  changeRatio,
  formatChange,
  type AnalyticsRange,
  type AnalyticsQuery,
  type AnalyticsLoader,
  type AnalyticsStatus,
  type AnalyticsLabels,
  type AnalyticsFilter,
  type AnalyticsGlass,
  type AnalyticsShellProps,
  type AnalyticsPanelProps,
  type AnalyticsDashboardStateProps,
  type PanelSpan,
  type PanelLegendItem,
  type KpiItem,
  type KpiStripProps,
  type RollingNumberProps,
  type DeltaBadgeProps,
  type RangePoint,
  type TrendDatum,
  type TrendChartProps,
  type StackedTrendSeries,
  type StackedTrendDatum,
  type StackedTrendChartProps,
  type BarTrendDatum,
  type BarTrendChartProps,
  type DashboardStatus,
} from "../blocks/analytics-kit";
export {
  ProductDashboard,
  defaultProductLabels,
  type ProductDashboardProps,
  type ProductData,
  type ProductLabels,
  type ProductQuery,
  type ProductPlatform,
  type ProductFigure,
} from "../blocks/analytics-product";
export {
  SaasRevenueDashboard,
  defaultSaasRevenueLabels,
  type SaasRevenueDashboardProps,
  type SaasRevenueData,
  type SaasRevenueLabels,
  type SaasCustomer,
  type SaasMetric,
  type SaasPlan,
  type SaasRegion,
} from "../blocks/analytics-saas";
export {
  WebAnalyticsDashboard,
  defaultWebAnalyticsLabels,
  type WebAnalyticsDashboardProps,
  type WebAnalyticsData,
  type WebAnalyticsPoint,
  type WebAnalyticsLabels,
  type WebMetric,
  type WebDevice,
  type WebChannel,
} from "../blocks/analytics-web";
export {
  AuthSplit,
  passwordStrength,
  defaultAuthSplitLabels,
  defaultAuthSplitTestimonials,
  type AuthSplitProps,
  type AuthSplitLabels,
  type AuthSplitValues,
  type AuthSplitTestimonial,
  type AuthSplitStat,
} from "../blocks/auth-split";
export {
  FeatureBento,
  defaultFeatureBentoLabels,
  defaultBentoChartLabels,
  defaultBentoToastLabels,
  defaultBentoOtpLabels,
  defaultBentoSwitchLabels,
  defaultBentoAvatarLabels,
  BentoGrid,
  BentoCell,
  BentoChartDemo,
  BentoToastDemo,
  BentoOtpDemo,
  BentoSwitchDemo,
  BentoAvatarDemo,
  useBentoCellVisible,
  type FeatureBentoProps,
  type FeatureBentoLabels,
  type BentoGridProps,
  type BentoCellProps,
  type BentoChartDemoProps,
  type BentoChartLabels,
  type BentoChartPeriod,
  type BentoToastDemoProps,
  type BentoToastLabels,
  type BentoToast,
  type BentoOtpDemoProps,
  type BentoOtpLabels,
  type BentoSwitchDemoProps,
  type BentoSwitchLabels,
  type BentoAvatarDemoProps,
  type BentoAvatarLabels,
} from "../blocks/bento-grid";
export { ChatApp, type ChatAppProps } from "../blocks/chat-app";
export {
  DashboardStats,
  defaultDashboardStatsLabels,
  type DashboardStatsProps,
  type DashboardStatsLabels,
  type Stat,
} from "../blocks/dashboard-stats";
export {
  GlassLogin,
  defaultGlassLoginLabels,
  type GlassLoginProps,
  type GlassLoginValues,
  type GlassLoginLabels,
} from "../blocks/glass-login";
export {
  NotificationCenter,
  NotificationPanel,
  type NotificationCenterProps,
  type NotificationPanelProps,
  type NotificationItem,
  type NotificationKind,
  type NotificationTab,
  type NotificationCenterLabels,
} from "../blocks/notification-center";
// The old names stay for one release as deprecated aliases.
// eslint-disable-next-line @typescript-eslint/no-deprecated -- deprecated alias, kept for one release
export { defaultNotificationCenterLabels, defaultNotificationLabels } from "../blocks/notification-center";
export { LampLogin, defaultLampLoginLabels, type LampLoginProps, type LampLoginLabels } from "../blocks/lamp-login";
export {
  OtpVerification,
  defaultOtpVerificationLabels,
  type OtpVerificationProps,
  type OtpVerificationLabels,
} from "../blocks/otp-verification";
export {
  PaymentCheckout,
  defaultPaymentCheckoutLabels,
  type PaymentCheckoutProps,
  type PaymentCheckoutLabels,
  type PaymentMethod,
  type PaymentDetails,
  type CheckoutLine,
} from "../blocks/payment-checkout";
export {
  Pricing,
  defaultPricingLabels,
  type PricingProps,
  type PricingTier,
  type PricingFeature,
  type PricingFeatureValue,
  type PricingLabels,
  type PricingBilling,
} from "../blocks/pricing";
export {
  SettingsPage,
  defaultSettingsNotificationOptions,
  type SettingsPageProps,
  type SettingsPageLabels,
  type SettingsValues,
  type SettingsSection,
  type SettingsNotificationOption,
} from "../blocks/settings-page";
// eslint-disable-next-line @typescript-eslint/no-deprecated -- deprecated alias, kept for one release
export { defaultSettingsPageLabels, defaultSettingsLabels } from "../blocks/settings-page";

// Marketing blocks
export {
  HeroSection,
  defaultHeroSectionLabels,
  type HeroSectionProps,
  type HeroSectionLabels,
  type HeroAction,
  type HeroLogo,
} from "../blocks/hero-section";
export {
  FeatureGrid,
  defaultFeatureGridLabels,
  type FeatureGridProps,
  type FeatureGridLabels,
  type FeatureGridItem,
} from "../blocks/feature-grid";
export {
  Testimonials,
  defaultTestimonialsLabels,
  type TestimonialsProps,
  type TestimonialsLabels,
  type Testimonial,
} from "../blocks/testimonials";
export {
  FaqSection,
  faqPageJsonLd,
  defaultFaqSectionLabels,
  type FaqSectionProps,
  type FaqSectionLabels,
  type FaqItem,
  type FaqPageJsonLd,
} from "../blocks/faq-section";
export {
  ContactForm,
  defaultContactFormLabels,
  type ContactFormProps,
  type ContactFormLabels,
  type ContactFormValues,
  type ContactFormStatus,
  type ContactField,
} from "../blocks/contact-form";
export {
  SiteFooter,
  defaultSiteFooterLabels,
  type SiteFooterProps,
  type SiteFooterLabels,
  type FooterColumn,
  type FooterLink,
  type FooterSocial,
} from "../blocks/site-footer";
export {
  NotFound,
  defaultNotFoundLabels,
  type NotFoundProps,
  type NotFoundLabels,
  type NotFoundLink,
  type NotFoundAction,
} from "../blocks/not-found-page";
export {
  AnnouncementBanner,
  defaultAnnouncementBannerLabels,
  type AnnouncementBannerProps,
  type AnnouncementBannerLabels,
  type AnnouncementLink,
  type AnnouncementTone,
} from "../blocks/announcement-banner";
