export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // For now: just log the message (can later email, send to a DB, etc.)
  console.log('New Contact Form Submission:', {
    name,
    email,
    phone,
    message,
    timestamp: new Date().toISOString(),
  });

  return res.status(200).json({ message: 'Message received' });
}
