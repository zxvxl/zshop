import type { PaymentProvider } from "./types";
import { UsdtBscProvider } from "./usdt-bsc";
import { AlipayProvider } from "./alipay";

export type { PaymentProvider, PaymentResult, NotifyResult } from "./types";

const providers: Record<string, () => PaymentProvider> = {
  usdt_bsc: () => new UsdtBscProvider(),
  alipay_face: () => new AlipayProvider(),
  alipay_web: () => new AlipayProvider(),
};

export function getProvider(providerName: string): PaymentProvider | null {
  const factory = providers[providerName];
  return factory ? factory() : null;
}

export function getSupportedProviders(): string[] {
  return Object.keys(providers);
}
