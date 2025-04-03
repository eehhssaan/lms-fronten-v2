const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // Allow frontend origins
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Important for cookies/auth
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(morgan("dev"));

// ... rest of your code ...
