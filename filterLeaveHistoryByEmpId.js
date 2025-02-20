import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    // { duration: "2m", target: 7500 },
    // { duration: "3m", target: 10000 },
    // { duration: "5s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% ของคำขอควรตอบกลับในเวลาไม่เกิน 500ms
    "http_req_duration{status:200}": ["p(95)<400"], // 95% ของคำขอที่สถานะ 200 ควรตอบกลับในเวลาไม่เกิน 400ms
    checks: ["rate>0.90"], // 90% ของการตรวจสอบ (checks) ควรผ่าน
  },
};

// ✅ Base URL ของ API
const BASE_URL =
  "http://203.154.184.162:5013/api/entitilementLeave/filterLeaveHistoryByEmpId";

// ✅ Payload (Body)
const payload = JSON.stringify({
  emp_id: "afe4dc09-e9e2-4082-abbb-a48df5a2d6f2",
  start_date: "2023-01-01",
  finish_date: "2025-12-31",
  leave_type: "",
});

// ✅ Headers
const params = {
  headers: {
    "Content-Type": "application/json",
    Authorization:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGl0eUlEIjoiZmExY2VjMjAtOTc0NC00ZWUzLWFhNmQtM2Y4MTcyZTEwYTcwIiwiZmlyc3RuYW1lIjoiS2lzc2FkYXBhIiwibGFzdG5hbWUiOiJOZ3VhbmNob24iLCJjb21wYW55SUQiOiIiLCJpYXQiOjE3NDAwMjA4MzYsImV4cCI6MTc0MDEwNzIzNn0.zc3E1begjla3S2Sm4u3D34d1Qya1GPtvwLoXVYQgh_k",
    "X-TTT-PMRP": "ecffd46cf0f300f79f21afcac734ea9c",
  },
};

export default function () {
  // ✅ ส่ง Request แบบ POST และใส่ body + headers
  const response = http.post(BASE_URL, payload, params);

  // ✅ Log Status และ Response
  console.log(
    `🔍 [${new Date().toISOString()}] Status: ${
      response.status
    } | ⏳ Response Time: ${response.timings.duration} ms`
  );

  // ✅ Log Response Body แบบดูง่ายขึ้น
  //   console.log(`📥 Response Body:\n${response.body}\n`);

  // ✅ เช็คตามประเภทของ Status Code
  if (response.status === 200) {
    console.log(`✅ SUCCESS: 200 | ⏳ ${response.timings.duration} ms`);
  } else if (response.status === 400) {
    console.log(
      `⚠️ BAD REQUEST: 400 | ⏳ ${response.timings.duration} ms | ❗ ${response.body}`
    );
  } else if (response.status === 401) {
    console.log(
      `🔑 UNAUTHORIZED: 401 | ⏳ ${response.timings.duration} ms | 🔒 Authentication Failed`
    );
  } else if (response.status === 403) {
    console.log(
      `🚫 FORBIDDEN: 403 | ⏳ ${response.timings.duration} ms | ❌ Access Denied`
    );
  } else if (response.status === 404) {
    console.log(
      `🔍 NOT FOUND: 404 | ⏳ ${response.timings.duration} ms | 🔎 API Endpoint Not Found`
    );
  } else if (response.status >= 500) {
    console.log(
      `🔥 SERVER ERROR: ${response.status} | ⏳ ${response.timings.duration} ms | 💥 API Server Issue`
    );
  } else {
    console.log(
      `❓ UNKNOWN STATUS: ${response.status} | ⏳ ${response.timings.duration} ms`
    );
  }

  // ✅ ตรวจสอบเงื่อนไขของ Response
  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
    "response is not empty": (r) => r.body && r.body.length > 0,
  });
}
