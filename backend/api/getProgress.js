export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://rmbabyregistry.me");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const binId = process.env.JSONBIN_BIN_ID;
    const secretKey = process.env.JSONBIN_SECRET;

    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { 'X-Master-Key': secretKey }
    });

    if (!response.ok) throw new Error(`JSONBin responded with ${response.status}`);

    const data = await response.json();
    res.status(200).json({ total: data.record.total });
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ error: "Failed to fetch progress." });
  }
}