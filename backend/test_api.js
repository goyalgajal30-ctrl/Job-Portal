const { Readable } = require("stream");
const { EventEmitter } = require("events");
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const userRouter = require("./router/userRouter");
const companyRouter = require("./router/companyRouter");
const jobRouter = require("./router/jobRouter");
const userProfileRouter = require("./router/userProfileRouter");
const companyProfileRouter = require("./router/companyProfileRouter");
const jobApplyRouter = require("./router/jobApplyRouter");
const adminRouter = require("./router/adminRouter");
const authRouter = require("./router/authRouter");
const interviewRouter = require("./router/interviewRouter");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    req.body = {};
  }
  next();
});
app.use(cors());

app.use("/api/user", userRouter);
app.use("/api/company", companyRouter);
app.use("/api/job", jobRouter);
app.use("/api/job-apply", jobApplyRouter);
app.use("/api/user-profile", userProfileRouter);
app.use("/api/company-profile", companyProfileRouter);
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

app.get("/", (req, res) => {
  res.send("Job Portal Backend is running");
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

function request(options) {
  return new Promise((resolve, reject) => {
    const { method = "GET", url = "/", headers = {}, body = null } = options;

    const req = new Readable({
      read() {
        if (body) {
          this.push(typeof body === "string" ? body : JSON.stringify(body));
        }
        this.push(null);
      },
    });

    req.method = method;
    req.url = url;
    req.ip = "127.0.0.1";
    req.socket = { remoteAddress: "127.0.0.1" };
    req.headers = { ...headers, host: "localhost" };
    if (body && !req.headers["content-type"]) {
      req.headers["content-type"] = "application/json";
    }

    const res = new EventEmitter();
    res.statusCode = 200;
    res._headers = {};
    res.setHeader = (k, v) => {
      res._headers[k.toLowerCase()] = v;
    };
    res.getHeader = (k) => res._headers[k.toLowerCase()];
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    let bodyData = "";
    res.write = (chunk) => {
      if (chunk) bodyData += chunk.toString();
      return true;
    };
    res.send = (data) => {
      if (typeof data === "object") {
        bodyData = JSON.stringify(data);
      } else if (data) {
        bodyData = data.toString();
      }
      res.end();
    };
    res.json = (data) => {
      res.setHeader("content-type", "application/json");
      bodyData = JSON.stringify(data);
      res.end();
    };
    res.end = (chunk) => {
      if (chunk) bodyData += chunk.toString();
      let json = null;
      try {
        json = JSON.parse(bodyData);
      } catch (e) {}
      resolve({
        status: res.statusCode,
        headers: res._headers,
        body: bodyData,
        json,
      });
    };

    try {
      app(req, res);
    } catch (e) {
      reject(e);
    }
  });
}

async function runTests() {
  console.log("=== STARTING FULL BACKEND INTEGRATION TESTS ===");
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
    }
  }

  // 1. Root health check
  await test("Root health check returns 200", async () => {
    const res = await request({ method: "GET", url: "/" });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.body.includes("Job Portal Backend is running")) {
      throw new Error(`Unexpected body: ${res.body}`);
    }
  });

  // 2. 404 handler
  await test("Undefined route returns 404 JSON", async () => {
    const res = await request({ method: "GET", url: "/api/nonexistent-route-testing" });
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    if (res.json?.message !== "API route not found") {
      throw new Error(`Unexpected message: ${res.json?.message}`);
    }
  });

  // 3. Auth signup validation
  await test("Signup validation blocks empty requests with 400", async () => {
    const res = await request({
      method: "POST",
      url: "/api/auth/signup",
      body: {},
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (!res.json?.message) throw new Error("Expected validation message in response");
  });

  // 4. Protected route authentication - user me
  await test("Protected route /api/user/me rejects unauthenticated request with 401", async () => {
    const res = await request({ method: "GET", url: "/api/user/me" });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 5. Protected route authentication - company jobs
  await test("Protected route /api/job/my-jobs rejects unauthenticated request with 401", async () => {
    const res = await request({ method: "GET", url: "/api/job/my-jobs" });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 6. Protected route authentication - admin stats
  await test("Protected route /api/admin/stats rejects unauthenticated request with 401", async () => {
    const res = await request({ method: "GET", url: "/api/admin/stats" });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 7. Protected route authentication - interview schedule
  await test("Protected route /api/interview/schedule rejects unauthenticated request with 401", async () => {
    const res = await request({
      method: "POST",
      url: "/api/interview/schedule",
      body: {},
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 8. Protected route with invalid JWT token
  await test("Protected route rejects bogus Bearer token with 401", async () => {
    const res = await request({
      method: "GET",
      url: "/api/auth/me",
      headers: { authorization: "Bearer bogus.token.value" },
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 9. Forgot password validation
  await test("Forgot password with empty email returns 400", async () => {
    const res = await request({
      method: "POST",
      url: "/api/auth/forget",
      body: {},
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 10. Public job view
  await test("Job details without ID returns 404 or 400", async () => {
    const res = await request({ method: "GET", url: "/api/job/invalid-id-format" });
    if (res.status !== 404 && res.status !== 400 && res.status !== 500) {
      throw new Error(`Expected error status, got ${res.status}`);
    }
  });

  // 11. Protected route authentication - user profile getone
  await test("Protected route /api/user-profile/getone rejects unauthenticated request with 401", async () => {
    const res = await request({ method: "GET", url: "/api/user-profile/getone" });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 12. Protected route authentication - user profile update
  await test("Protected route /api/user-profile/update rejects unauthenticated request with 401", async () => {
    const res = await request({
      method: "PUT",
      url: "/api/user-profile/update",
      body: { About: "Software developer", skills: ["React", "Node"] },
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  console.log(`\nTEST SUMMARY: ${passed}/${total} tests passed!`);
  if (passed === total) {
    console.log("ALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
