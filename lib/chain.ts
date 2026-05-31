export async function fetchTransactions() {
  const contractAddress = process.env.BSC_USDT_TOKEN;
  const address = process.env.BSC_WALLET;
  const isTest = process.env.TEST === "true";
  const endpoint = isTest
    ? "https://api-testnet.bscscan.com/api"
    : "https://api.bscscan.com/api";

  const url = `${endpoint}?module=account&action=tokentx&contractaddress=${contractAddress}&address=${address}&page=1&sort=desc&offset=50&apikey=${process.env.BSCSCAN_KEY}`;

  try {
    const res = await fetch(url, { cache: "no-cache" });
    const { result } = await res.json();
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    return [];
  }
}
