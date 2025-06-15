export default async function handler(req, res) {
  const binId = process.env.JSONBIN_BIN_ID;
  const secretKey = process.env.JSONBIN_SECRET;

  const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers: {
      'X-Master-Key': secretKey
    }
  });

  const data = await response.json();
  res.status(200).json({ total: data.record.total });
}
