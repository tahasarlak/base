// schema/index.ts
// نقطه مرکزی تمام schemaهای پروژه - نسخه نهایی و کامل

// ==================== Core Tables ====================
export * from './users';           // شامل users, organizations, organizationMembers, accounts, sessions, verificationTokens
export * from './products';
export * from './blog';
export * from './courses';
export * from './orders';
export * from './audit';

// ==================== Financial ====================
export * from './payments';
export * from './wallets';

// ==================== Media ====================
export * from './file_uploads';

// ==================== Content & Marketing ====================
export * from './settings';
export * from './coupons';
export * from './menus';
export * from './pages';

// ==================== User Engagement ====================
export * from './notifications';
export * from './tickets';
export * from './subscriptions';

// ==================== Analytics ====================
export * from './analytics';

// ==================== Export مستقیم enumها (برای راحتی در سراسر پروژه) ====================
export {
  userRoleEnum,
} from './users';

export {
  productTypeEnum,
  productStatusEnum,
  stockStatusEnum,
  weightUnitEnum,
  dimensionUnitEnum,
} from './products';

export {
  blogPostStatusEnum,
} from './blog';

export {
  courseLevelEnum,
  enrollmentStatusEnum,
  paymentStatusEnum,
  lessonTypeEnum,
  attendanceStatusEnum,
} from './courses';

export {
  orderStatusEnum,
  paymentMethodEnum,
} from './orders';

export {
  paymentGatewayEnum,
} from './payments';

export {
  walletTransactionTypeEnum,
  walletTransactionStatusEnum,
} from './wallets';

export {
  fileTypeEnum,
  fileAccessEnum,
} from './file_uploads';

export {
  couponTypeEnum,
} from './coupons';

export {
  notificationTypeEnum,
  notificationChannelEnum,
} from './notifications';

export {
  ticketStatusEnum,
  ticketPriorityEnum,
} from './tickets';

export {
  subscriptionStatusEnum,
} from './subscriptions';