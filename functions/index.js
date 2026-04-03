const functions = require("firebase-functions");
const twilio = require("twilio");

const client = twilio(
  "ACb7ef8824983b05b0e20e9822a814df1b",
  "6390bb0c99c1a0ee90bf02b113325128",
);

exports.sendWhatsApp = functions.https.onRequest(async (req, res) => {
  const { phone, complaintId } = req.body;

  try {
    const message = await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:+91${phone}`,
      body: `🚗 Engineer is on the way!

Track live:
https://water-cms.vercel.app/track/${complaintId}`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending message");
  }
});
