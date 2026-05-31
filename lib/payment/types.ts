export interface PaymentResult {
  mode: "address" | "qrcode" | "url";
  address?: string;
  amount?: string;
  network?: string;
  qrCode?: string;
  payUrl?: string;
  expiresAt?: string;
}

export interface NotifyResult {
  success: boolean;
  orderNo?: string;
  amount?: string;
}

export interface PaymentProvider {
  createPayment(order: any, config: any): Promise<PaymentResult>;
  checkPayment(order: any, config: any): Promise<boolean>;
  handleNotify?(body: any, config: any): Promise<NotifyResult>;
}
