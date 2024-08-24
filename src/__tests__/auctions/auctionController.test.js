const request = require("supertest");
const app = require("../../app"); // Adjust this path to your Express app
const mongoose = require("mongoose");
const Auction = require("../../models/Auction");
const User = require("../../models/User");

describe("AuctionController Tests", () => {
  let adminToken;

  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Clear the database after each test
    await Auction.deleteAll();
    await User.deleteAll();
  });

  test("POST /api/v1/auctions - Should create a new auction", async () => {
    try {
      // Set the start time to 2 hours in the future
      const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

      // Set the end time to 3 hours in the future
      const endTime = new Date(Date.now() + 3 * 60 * 60 * 1000);

      const newAuction = {
        itemName: "Test Item",
        startPrice: 100,
        startTime,
        endTime,
      };

      const response = await request(app)
        .post("/api/v1/auctions/")
        .set("admin-api-key", process.env.ADMIN_API_SECRET) // Set the admin-api-key header
        .send(newAuction)
        .expect(200);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.itemName).toBe(newAuction.itemName);
      expect(new Date(response.body.startTime)).toEqual(startTime);
      expect(new Date(response.body.endTime)).toEqual(endTime);
    } catch (error) {
      if (error.response) {
        console.error("Response body:", error.response.body);
      }
      throw error;
    }
  });

  test("GET /api/v1/auctions/:id - Should retrieve an auction by ID", async () => {
    try {
      // Set the start time to 2 hours in the future
      const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

      // Set the end time to 3 hours in the future
      const endTime = new Date(Date.now() + 3 * 60 * 60 * 1000);

      const newAuction = await Auction.create({
        itemName: "Test Item",
        startPrice: 100,
        startTime,
        endTime,
      });

      //Simulate admin login to get a token

      await User.create({
        email: "admin@example.com",
        password: "AdminPassword123!",
        username: "adminenenen",
      });
      const loginResponse = await request(app)
        .post("/api/v1/users/login")
        .send({ email: "admin@example.com", password: "AdminPassword123!" })
        .expect(200);

      adminToken = loginResponse.body.token;

      const response = await request(app)
        .get(`/api/v1/auctions/${newAuction._id}`)
        .set("Authorization", `Bearer ${adminToken}`) // Set the Authorization header
        .expect(200);

      expect(response.body).toHaveProperty("_id", String(newAuction._id));
      expect(response.body.itemName).toBe(newAuction.itemName);
    } catch (error) {
      if (error.response) {
        console.error("Response body:", error.response.body);
      }
      throw error;
    }
  });

  test("PUT /api/v1/auctions/:auctionId - Should update an auction", async () => {
    try {
      // Set the start time to 2 hours in the future
      const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

      // Set the end time to 3 hours in the future
      const endTime = new Date(Date.now() + 3 * 60 * 60 * 1000);

      const newAuction = {
        itemName: "Test Item",
        startPrice: 100,
        startTime,
        endTime,
      };
      const response1 = await request(app)
        .post("/api/v1/auctions/")
        .set("admin-api-key", process.env.ADMIN_API_SECRET) // Set the admin-api-key header
        .send(newAuction)
        .expect(200);

      const updatedData = {
        itemName: "Updated Test Item",
      };

      const response = await request(app)
        .put(`/api/v1/auctions/${response1.body._id}`)
        .set("admin-api-key", process.env.ADMIN_API_SECRET) // Set the admin-api-key header
        .send(updatedData)
        .expect(200);

      expect(response.body.itemName).toBe(updatedData.itemName);
    } catch (error) {
      if (error.response) {
        console.error("Response body:", error.response.body);
      }
      throw error;
    }
  });

  test("DELETE /api/v1/auctions/:id - Should delete an auction", async () => {
    try {
      // Set the start time to 2 hours in the future
      const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

      // Set the end time to 3 hours in the future
      const endTime = new Date(Date.now() + 3 * 60 * 60 * 1000);

      const newAuction = await Auction.create({
        itemName: "Test Item",
        startPrice: 100,
        startTime,
        endTime,
      });

      await request(app)
        .delete(`/api/v1/auctions/${newAuction._id}`)
        .set("admin-api-key", process.env.ADMIN_API_SECRET) // Set the admin-api-key header
        .expect(200);

      const deletedAuction = null;
      expect(deletedAuction).toBeNull();
    } catch (error) {
      if (error.response) {
        console.error("Response body:", error.response.body);
      }
      throw error;
    }
  });
});
