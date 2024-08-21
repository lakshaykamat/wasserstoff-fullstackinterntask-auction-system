const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const ErrorHandler = require("./services/error-handler");
const AppError = require("./services/AppError");
const serverAdapter = require("./services/bullDashboard");
dotenv.config({ path: ".env" });

const app = express();
app.use(express.json());
app.use("/admin/queues", serverAdapter.getRouter());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB connection successful!"));

app.use("/api/v1/auctions", require("./routes/auctionRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(ErrorHandler);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
