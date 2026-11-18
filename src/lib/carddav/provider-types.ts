export const PROVIDER_TYPES = ["radicale", "baikal", "nextcloud", "custom"] as const;
export type ProviderType = (typeof PROVIDER_TYPES)[number];
