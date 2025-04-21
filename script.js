const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const twilio = require("twilio");

// Load environment variables
dotenv.config();

// Safety check for environment variables
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  EMERGENCY_CONTACT_NUMBER,
  PORT = 3000
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER || !EMERGENCY_CONTACT_NUMBER) {
  console.error("❌ Missing required environment variables in .env file.");
  process.exit(1);
}

// Twilio setup
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const app = express();

// In-memory storage for pole data
let poleData = {
  id: 1,
  tilt_angle: 5,
  status: 'normal'
};

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).send({ status: "Smart Grid Guard 360 API is running" });
});

// Endpoint to receive tilt data
app.post("/api/pole_status", async (req, res) => {
  const { tilt_angle, status } = req.body;
  const finalStatus = status || (tilt_angle > 30 ? 'fallen' : 'normal');

  console.log(`📡 Received data -> Tilt Angle: ${tilt_angle}°, Status: ${finalStatus}`);

  // Update memory
  poleData = {
    id: 1,
    tilt_angle,
    status: finalStatus
  };

  // Emergency call if fallen
  if (finalStatus.toLowerCase() === "fallen") {
    try {
      await client.calls.create({
        to: EMERGENCY_CONTACT_NUMBER,
        from: TWILIO_PHONE_NUMBER,
        url: "http://demo.twilio.com/docs/voice.xml"
      });
      console.log("📞 Emergency call placed to responder!");
    } catch (error) {
      console.error("❌ Failed to make emergency call:", error.message);
    }
  }

  res.status(200).json({ message: "Data received successfully" });
});

// Endpoint to fetch pole data
app.get("/api/poles/:id", (req, res) => {
  const poleId = parseInt(req.params.id);
  if (poleId === 1) {
    res.status(200).json(poleData);
  } else {
    res.status(404).json({ error: "Pole not found" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Catch unhandled exceptions to avoid crashes
process.on("uncaughtException", (err) => {
  console.error("🚨 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("🚨 Unhandled Rejection:", reason);
});
