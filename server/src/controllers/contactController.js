export const submitContact = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Please provide name, email, and message" });
  }

  // Here you would typically save to a database or send an email
  // For now, we just return a success response
  console.log(`Contact message received from ${name} (${email}): ${subject} - ${message}`);

  res.status(200).json({ success: true, message: "Message received successfully. We'll get back to you soon!" });
};
