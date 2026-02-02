import { describe, test, expect, beforeAll, afterAll, beforeEach, mock } from "bun:test";
import request from "supertest";
import { app, prisma } from "../../index";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Mock admin user
const adminUser = {
  id: 1,
  email: "admin@test.com",
  role: "ADMIN",
};

// Mock regular user
const regularUser = {
  id: 2,
  email: "user@test.com",
  role: "USER",
};

// Generate tokens
const adminToken = jwt.sign(
  { id: adminUser.id, role: adminUser.role },
  JWT_SECRET
);

const userToken = jwt.sign(
  { id: regularUser.id, role: regularUser.role },
  JWT_SECRET
);

describe("Admin Routes", () => {
  let testUserId: number;
  let testPostId: number;
  let dbConnected = false;

  beforeAll(async () => {
    // Check if database is connected
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
      
      // Create test data
      const testUser = await prisma.user.create({
        data: {
          email: "testuser@test.com",
          password: "hashedpassword",
          username: "testuser",
          role: "USER",
          profile: {
            create: {
              fullName: "Test User",
              bio: "Test bio",
            }
          }
        }
      });
      testUserId = testUser.id;

      const testPost = await prisma.post.create({
        data: {
          content: "Test post content",
          authorId: testUser.id,
        }
      });
      testPostId = testPost.id;
    } catch (error) {
      console.warn("Database not available, some tests may be skipped");
      dbConnected = false;
    }
  });

  afterAll(async () => {
    // Cleanup test data
    if (dbConnected) {
      try {
        if (testPostId) {
          await prisma.post.delete({ where: { id: testPostId } }).catch(() => {});
        }
        if (testUserId) {
          await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    await prisma.$disconnect();
  });

  describe("Authentication & Authorization", () => {
    test("should return 401 when no token is provided", async () => {
      const response = await request(app).get("/api/admin/users");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "No token provided");
    });

    test("should return 401 when invalid token is provided", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", "Bearer invalid_token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    test("should return 403 when non-admin user tries to access admin routes", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message", "Forbidden: Access denied");
    });
  });

  describe("GET /api/admin/users", () => {
    test("should return all users for admin", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /api/admin/stats", () => {
    test("should return admin statistics", async () => {
      const response = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("userCount");
      expect(response.body).toHaveProperty("postCount");
      expect(response.body).toHaveProperty("communityCount");
      expect(typeof response.body.userCount).toBe("number");
      expect(typeof response.body.postCount).toBe("number");
      expect(typeof response.body.communityCount).toBe("number");
    });
  });

  describe("GET /api/admin/posts", () => {
    test("should return all posts for admin", async () => {
      const response = await request(app)
        .get("/api/admin/posts")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /api/admin/reports", () => {
    test("should return all reports for admin", async () => {
      const response = await request(app)
        .get("/api/admin/reports")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /api/admin/analytics", () => {
    test("should return analytics data", async () => {
      const response = await request(app)
        .get("/api/admin/analytics")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        const dataPoint = response.body[0];
        expect(dataPoint).toHaveProperty("date");
        expect(dataPoint).toHaveProperty("users");
        expect(dataPoint).toHaveProperty("posts");
      }
    });
  });

  describe("DELETE /api/admin/users/:id", () => {
    test("should return 500 when trying to delete non-existent user", async () => {
      const nonExistentId = 999999;
      const response = await request(app)
        .delete(`/api/admin/users/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Failed to delete user");
    });

    test("should not allow non-admin to delete users", async () => {
      const response = await request(app)
        .delete("/api/admin/users/1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /api/admin/posts/:id", () => {
    test("should return 500 when trying to delete non-existent post", async () => {
      const nonExistentId = 999999;
      const response = await request(app)
        .delete(`/api/admin/posts/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Failed to delete post");
    });

    test("should not allow non-admin to delete posts", async () => {
      const response = await request(app)
        .delete("/api/admin/posts/1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});
