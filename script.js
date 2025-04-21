const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// In-memory storage for pole data
// let poleData = {
//   id: 1,
//   tilt_angle: 5,
//   status: 'normal'
// };

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Root endpoint for health check
app.get("/", (req, res) => {
  res.status(200).send({ status: "Smart Grid Guard 360 API is running" });
});

// Endpoint to receive tilt data from sensors
app.post("/api/pole_status", (req, res) => {
  const { tilt_angle, status } = req.body;
  console.log(`Received data -> Tilt Angle: ${tilt_angle}°, Status: ${status}`);

  // Update our in-memory storage
  poleData = {
    id: 1,
    tilt_angle: tilt_angle,
    status: status || (tilt_angle > 30 ? 'fallen' : 'normal') // Auto-determine status if not provided
  };

  res.status(200).json({ message: "Data received successfully" });
});

// Endpoint to get pole data for the frontend
app.get("/api/poles/:id", (req, res) => {
  const poleId = parseInt(req.params.id);
  
  // Check if we have data for this pole
  if (poleId === 1) {
    res.status(200).json(poleData);
  } else {
    res.status(404).json({ error: "Pole not found" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});