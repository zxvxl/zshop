import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSupportedProviders } from "@/lib/payment";

export const dynamic = "force-dynamic";

async function createChannel(formData: FormData) {
  "use server";
  const config: Record<string, any> = {};
  const provider = formData.get("provider") as string;

  // Build config based on provider type
  if (provider === "usdt_bsc") {
    config.wallet = formData.get("config_wallet") as string;
    config.token = formData.get("config_token") as string;
    config.bscscanKey = formData.get("config_bscscanKey") as string;
    config.testnet = formData.get("config_testnet") === "on";
  } else if (provider.startsWith("alipay")) {
    config.appId = formData.get("config_appId") as string;
    config.privateKey = formData.get("config_privateKey") as string;
    config.alipayPublicKey = formData.get("config_alipayPublicKey") as string;
    config.notifyUrl = formData.get("config_notifyUrl") as string;
    config.mode = provider === "alipay_face" ? "face" : "web";
  }

  await prisma.paymentChannel.create({
    data: {
      name: formData.get("name") as string,
      nameEn: (formData.get("nameEn") as string) || "",
      provider,
      config: JSON.stringify(config),
      feeRate: parseFloat((formData.get("feeRate") as string) || "0"),
      sort: parseInt((formData.get("sort") as string) || "0"),
    },
  });
  revalidatePath("/admin/payment");
}

async function toggleChannel(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string);
  const current = formData.get("enabled") === "true";
  await prisma.paymentChannel.update({ where: { id }, data: { enabled: !current } });
  revalidatePath("/admin/payment");
}

async function deleteChannel(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string);
  await prisma.paymentChannel.delete({ where: { id } });
  revalidatePath("/admin/payment");
}

export default async function AdminPayment() {
  const channels = await prisma.paymentChannel.findMany({ orderBy: { sort: "asc" } });
  const providers = getSupportedProviders();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Channels</h1>

      {/* Channel List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500">Name</th>
              <th className="text-left px-4 py-3 text-gray-500">Provider</th>
              <th className="text-left px-4 py-3 text-gray-500">Fee %</th>
              <th className="text-left px-4 py-3 text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((ch) => (
              <tr key={ch.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{ch.name}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{ch.provider}</td>
                <td className="px-4 py-3">{ch.feeRate}%</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${ch.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {ch.enabled ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <form action={toggleChannel} className="inline">
                    <input type="hidden" name="id" value={ch.id} />
                    <input type="hidden" name="enabled" value={String(ch.enabled)} />
                    <button type="submit" className="text-xs text-orange-500 hover:text-orange-700 font-medium">
                      {ch.enabled ? "Disable" : "Enable"}
                    </button>
                  </form>
                  <form action={deleteChannel} className="inline">
                    <input type="hidden" name="id" value={ch.id} />
                    <button type="submit" className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {channels.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No payment channels configured</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add Channel</h2>
        <form action={createChannel} className="space-y-4 max-w-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input name="name" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="BSC USDT" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name (EN)</label>
              <input name="nameEn" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="BSC USDT" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Provider</label>
              <select name="provider" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {providers.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fee Rate (%)</label>
              <input name="feeRate" type="number" step="0.01" defaultValue="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-3 font-bold">USDT BSC Config:</p>
            <div className="space-y-2">
              <input name="config_wallet" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="BSC Wallet Address (0x...)" />
              <input name="config_token" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="USDT Token Contract (0x55d3...)" />
              <input name="config_bscscanKey" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="BscScan API Key" />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-3 font-bold">Alipay Config:</p>
            <div className="space-y-2">
              <input name="config_appId" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="App ID" />
              <textarea name="config_privateKey" rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" placeholder="Private Key" />
              <textarea name="config_alipayPublicKey" rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" placeholder="Alipay Public Key" />
              <input name="config_notifyUrl" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Notify URL (https://your-domain/api/payment/notify/alipay)" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Sort Order</label>
            <input name="sort" type="number" defaultValue={0} className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>

          <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600">
            Create Channel
          </button>
        </form>
      </div>
    </div>
  );
}
