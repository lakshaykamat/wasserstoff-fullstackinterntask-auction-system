const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../../models/User");
const app = require("../../app");

describe("UserController Tests", () => {
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
    await User.deleteAll();
  });

  test("POST /api/v1/users/register - Should register a new user", async () => {
    const newUser = {
      username: "testuser",
      email: "test@example.com",
      password: "Password123!",
    };

    try {
      const response = await request(app)
        .post("/api/v1/users/register")
        .send(newUser)
        .expect(201);

      expect(response.body.user).toHaveProperty("_id");
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.message).toBe("User registered successfully");
    } catch (error) {
      console.log("Error in POST /api/v1/users/register test:", error);
      throw error;
    }
  });

  test("POST /api/v1/users/login - Should login a user and return a token", async () => {
    const newUser = {
      username: "testuser",
      email: "test@example.com",
      password: "Password123!",
    };

    try {
      // First, register the user
      await User.create(newUser);

      // Then, attempt to log in
      const response = await request(app)
        .post("/api/v1/users/login")
        .send({ email: newUser.email, password: newUser.password })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.message).toBe("User logged in successfully");
    } catch (error) {
      console.log("Error in POST /api/v1/users/login test:", error);
      throw error;
    }
  });

  test("GET /api/v1/users/:userId - Should retrieve a user by ID", async () => {
    try {
      const newUser = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
      });

      const response = await request(app)
        .get(`/api/v1/users/${newUser._id}`)
        .set("admin-api-key", process.env.ADMIN_API_SECRET) // Set the admin-api-key header
        .expect(200);

      expect(response.body.user).toHaveProperty("_id", String(newUser._id));
      expect(response.body.user.email).toBe(newUser.email);
    } catch (error) {
      console.log("Error in GET /api/v1/users/:id test:", error);
      throw error;
    }
  });
});
