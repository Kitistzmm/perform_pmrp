import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "3m", target: 5000 },
    { duration: "2m", target: 8500 },
    { duration: "3m", target: 10000 },
    { duration: "15s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% ของคำขอควรตอบกลับในเวลาไม่เกิน 500ms
    "http_req_duration{status:200}": ["p(95)<400"], // 95% ของคำขอที่สถานะ 200 ควรตอบกลับในเวลาไม่เกิน 400ms
    http_reqs: ["count>100000"], // จำนวนคำขอทั้งหมดควรเกิน 100,000
    checks: ["rate>0.95"], // 95% ของการตรวจสอบ (checks) ควรผ่าน
  },
};

const BASE_URL =
  "http://150.95.80.78:9003/api/employeeEntitlementLeaveDetail/getAll";
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGl0eUlEIjoiZmExY2VjMjAtOTc0NC00ZWUzLWFhNmQtM2Y4MTcyZTEwYTcwIiwiZmlyc3RuYW1lIjoiS2lzc2FkYXBhIiwibGFzdG5hbWUiOiJOZ3VhbmNob24iLCJjb21wYW55SUQiOiIiLCJpYXQiOjE3Mzk4NjA4NTEsImV4cCI6MTczOTk0NzI1MX0.9J4ekLpp35Ko2r_aWwrIQjWmO_xv22CX-NxUXjv2uoA";
const X_TTT_PMRP = "ecffd46cf0f300f79f21afcac734ea9c";

export default function () {
  const url = `${BASE_URL}`;
  const params = {
    headers: {
      Authorization: AUTH_TOKEN,
      "X-TTT-PMRP": X_TTT_PMRP,
    },
  };

  const response = http.get(url, params);

  // ✅ Log Response Status และ Response Time
  console.log(
    `🔍 Status: ${response.status} | ⏳ Response Time: ${response.timings.duration} ms`
  );

  // ✅ Log แยกตามประเภทของ HTTP Status Code
  if (response.status === 200) {
    console.log(`✅ SUCCESS: 200 OK | ⏳ ${response.timings.duration} ms`);
  } else if (response.status >= 400 && response.status < 500) {
    console.log(
      `⚠️ CLIENT ERROR: ${response.status} | ⏳ ${response.timings.duration} ms | ❗ Message: ${response.body}`
    );
  } else if (response.status >= 500) {
    console.log(
      `❌ SERVER ERROR: ${response.status} | ⏳ ${response.timings.duration} ms | 🔥 อาจเกิดจากโหลดสูงหรือ API ล่ม`
    );
  }

  // ✅ ตรวจสอบเงื่อนไขของ Response
  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
}
