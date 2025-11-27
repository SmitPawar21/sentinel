Sentinel: High-Throughput Log Ingestion & Intrusion Detection System

A write-heavy logging architecture capable of handling high-velocity traffic, detecting anomalies in real-time, and visualizing threats via a live dashboard.

📖 Project Overview

Sentinel is not just a logging database; it is an architectural solution to the "Thundering Herd" problem in database management. Standard applications crash when attempting to write thousands of logs per second directly to disk. Sentinel solves this by implementing an Asynchronous Buffering Strategy at the application layer.

It acts as a centralized "Firehose" that ingests raw traffic logs, analyzes them in-memory for security threats (Brute Force, DDoS), and bulk-flushes them to a MongoDB Time-Series collection, reducing database I/O calls by over 90%.

Key System Features

High-Throughput Ingestion: Decouples incoming HTTP requests from database writes using an in-memory buffer.

Real-Time Intrusion Detection: Analyzes log patterns in the buffer (pre-DB) to flag IPs exceeding failure thresholds.

Batch Processing: Uses insertMany to commit logs in bulk based on MAX_BATCH size or FLUSH_INTERVAL time windows.

Live Monitoring: Server-Sent Events (SSE) push alerts to the React dashboard with <50ms latency.

Data Aging: optimized MongoDB schema for time-series querying.

🏗 System Architecture

The system is designed to handle write-heavy loads efficiently.

Ingestion: Clients hit POST /api/logs. The server acknowledges immediately (200 OK) without waiting for the DB write.

Buffering: The log is pushed to a LogBuffer (in-memory array).

Detection: The LogDetector service scans the buffer for patterns (e.g., 10 failed logins from IP X in 5 seconds).

Flushing: Once the buffer hits MAX_BATCH (e.g., 100 logs) or FLUSH_INTERVAL (e.g., 5s), data is bulk-written to MongoDB.

Broadcasting: Critical alerts are pushed to the frontend via the SSEManager.

📂 Folder Structure

The project follows a "Separation of Concerns" architecture, isolating the buffering logic from the HTTP controllers.

src/
│
├── models/
│   └── LogEntry.js           # Mongoose schema (Time-Series optimized)
│
├── controllers/
│   ├── log.controller.js     # Handles HTTP requests, pushes to Buffer
│   └── detection.controller.js # Endpoints to retrieve flagged IPs
│
├── routes/
│   ├── log.routes.js         # API Route definitions
│   └── detection.routes.js   # Routes for ML/Rule-based configs
│
├── services/
│   ├── buffer/               # CORE LOGIC
│   │   ├── LogBuffer.js      # Singleton class managing the in-memory array
│   │   └── BufferFlusher.js  # Worker that commits buffer to DB
│   │
│   ├── detection/
│   │   ├── LogDetector.js    # Rule-engine (Brute Force detection logic)
│   │   └── MLDetector.js     # (Placeholder) Heuristic analysis
│   │
│   ├── analytics/
│   │   └── LogAnalytics.js   # Aggregation pipelines for dashboard stats
│   │
│   └── sse/
│       └── SSEManager.js     # Manages active SSE connections for real-time push
│
├── utils/
│   ├── asyncHandler.js       # Higher-order function for error handling
│   ├── logger.js             # Internal dev logger
│   └── rateLimiter.js        # API Gateway protection
│
├── config/
│   ├── db.js                 # Database connection logic
│   └── env.js                # Environment variable validation
│
├── app.js                    # Express Application setup
└── server.js                 # Server entry point


💾 Data Model

Logs are stored in MongoDB with a schema optimized for time-range queries and filtering by severity.

{
  timestamp: Date,        // Indexed for time-series queries
  serviceName: String,    // e.g., "AuthService", "PaymentGateway"
  level: String,          // "INFO", "ERROR", "CRITICAL"
  message: String,        // Descriptive payload
  action: String,         // "LOGIN_ATTEMPT", "PAYMENT_FAIL"
  meta: {
    ip: String,           // Source IP
    responseTime: Number  // Latency in ms
  },
  isAttack: Boolean       // Computed by LogDetector service
}


Indexing Strategy:

Compound Index: { level: 1, timestamp: -1 } (For fetching recent errors)

Compound Index: { "meta.ip": 1, timestamp: -1 } (For investigating specific users)

🚀 Getting Started

Prerequisites

Node.js (v18+)

MongoDB (Local or Atlas)

React (Frontend)

1. Environment Configuration

Create a .env file in the root directory:

PORT=5000
MONGO_URI=mongodb://localhost:27017/sentinel_logs

# Tuning Parameters (The "Knobs" of the system)
MAX_BATCH=100             # Flush to DB after 100 logs
FLUSH_INTERVAL_MS=5000    # Flush to DB every 5 seconds (safety net)
DETECTION_THRESHOLD=10    # Flag IP after 10 failures in one batch


2. Installation & Run

Backend:

npm install
npm run dev


Frontend (Dashboard):

cd client
npm install
npm start


3. Simulation (Stress Test)

To demonstrate the system's capability, run the included attack simulator script. This mimics a DDoS attack mixed with legitimate traffic.

node scripts/attack_simulator.js


🧠 Interview Talking Points (The "Why")

If asked about this project, focus on these architectural decisions:

Why not write to DB directly?

Answer: "Database connections are expensive. Opening a connection for every single log entry creates a bottleneck. By batching 100 logs into 1 write, I reduce the I/O overhead by 99%, allowing Node.js to handle higher concurrency."

How do you handle data loss if the server crashes?

Answer: "There is a trade-off. We prioritize throughput over 100% durability for logs. However, the FLUSH_INTERVAL_MS ensures that at most, we lose 5 seconds of logs in a catastrophic failure. For critical financial data, I would use a message queue (Kafka/RabbitMQ) instead of in-memory arrays."

Why Server-Sent Events (SSE) over WebSockets?

Answer: "WebSockets are bi-directional and heavier on the handshake. Dashboard updates are uni-directional (Server -> Client). SSE is HTTP-based, firewall-friendly, and lighter on resources for this specific use case."


Author

Smit Pawar