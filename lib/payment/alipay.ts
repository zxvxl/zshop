import type { PaymentProvider, PaymentResult, NotifyResult } from "./types";

/**
 * Alipay Provider
 * Supports two modes:
 * - "face" (当面付): generates a QR code URL for user to scan
 * - "web" (电脑网站支付): generates a redirect URL to Alipay cashier
 *
 * Config shape:
 * {
 *   appId: string,
 *   privateKey: string,
 *   alipayPublicKey: string,
 *   notifyUrl: string,
 *   mode: "face" | "web"
 * }
 */
export class AlipayProvider implements PaymentProvider {
  async createPayment(order: any, config: any): Promise<PaymentResult> {
    // Dynamic import to avoid bundling issues if alipay-sdk not installed
    const AlipaySdk = (await import("alipay-sdk")).default;

    const sdk = new AlipaySdk({
      appId: config.appId,
      privateKey: config.privateKey,
      alipayPublicKey: config.alipayPublicKey,
    });

    const mode = config.mode || "face";
    const subject = `Order ${order.orderNo}`;
    const totalAmount = order.amount;

    if (mode === "face") {
      // 当面付 - 生成二维码
      const result = await sdk.exec("alipay.trade.precreate", {
        bizContent: {
          out_trade_no: order.orderNo,
          total_amount: totalAmount,
          subject,
        },
        notify_url: config.notifyUrl,
      });

      return {
        mode: "qrcode",
        qrCode: result.qrCode || result.qr_code,
        amount: totalAmount,
      };
    } else {
      // 电脑网站支付 - 生成跳转 URL
      const result = await sdk.pageExec("alipay.trade.page.pay", {
        method: "GET",
        bizContent: {
          out_trade_no: order.orderNo,
          total_amount: totalAmount,
          subject,
          product_code: "FAST_INSTANT_TRADE_PAY",
        },
        notify_url: config.notifyUrl,
        return_url: config.returnUrl || "",
      });

      return {
        mode: "url",
        payUrl: result,
        amount: totalAmount,
      };
    }
  }

  async checkPayment(order: any, config: any): Promise<boolean> {
    // Alipay uses notify callback, not polling
    // But we can also query the trade status
    try {
      const AlipaySdk = (await import("alipay-sdk")).default;
      const sdk = new AlipaySdk({
        appId: config.appId,
        privateKey: config.privateKey,
        alipayPublicKey: config.alipayPublicKey,
      });

      const result = await sdk.exec("alipay.trade.query", {
        bizContent: { out_trade_no: order.orderNo },
      });

      return result.tradeStatus === "TRADE_SUCCESS" || result.tradeStatus === "TRADE_FINISHED";
    } catch {
      return false;
    }
  }

  async handleNotify(body: any, config: any): Promise<NotifyResult> {
    try {
      const AlipaySdk = (await import("alipay-sdk")).default;
      const sdk = new AlipaySdk({
        appId: config.appId,
        privateKey: config.privateKey,
        alipayPublicKey: config.alipayPublicKey,
      });

      // Verify signature
      const verified = sdk.checkNotifySign(body);
      if (!verified) return { success: false };

      if (body.trade_status === "TRADE_SUCCESS" || body.trade_status === "TRADE_FINISHED") {
        return {
          success: true,
          orderNo: body.out_trade_no,
          amount: body.total_amount,
        };
      }

      return { success: false };
    } catch {
      return { success: false };
    }
  }
}
