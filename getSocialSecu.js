import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 5000 },
    { duration: "2m", target: 7000 },
    { duration: "3m", target: 10000 },
    { duration: "15s", target: 0 },
  ],

  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% ของคำขอควรตอบกลับในเวลาไม่เกิน 500ms
    "http_req_duration{status:200}": ["p(95)<400"], // 95% ของคำขอที่สถานะ 200 ควรตอบกลับในเวลาไม่เกิน 400ms
    http_reqs: ["count>100000"], // จำนวนคำขอทั้งหมดควรเกิน 100,000
    checks: ["rate>0.90"], // 90% ของการตรวจสอบ (checks) ควรผ่าน
  },
};

const BASE_URL =
  "http://203.154.184.162:5013/api/configParameterCompany/getSocialSecurity";
const oem_id = "e9549a12-9b0d-4b10-b2ef-ac3607c42ab4";
const company_id = "1a947e52-07ad-44fb-baca-aa24741512c3";
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGl0eUlEIjoiZmExY2VjMjAtOTc0NC00ZWUzLWFhNmQtM2Y4MTcyZTEwYTcwIiwiZmlyc3RuYW1lIjoiS2lzc2FkYXBhIiwibGFzdG5hbWUiOiJOZ3VhbmNob24iLCJjb21wYW55SUQiOiIiLCJpYXQiOjE3NDAwMTg0NjgsImV4cCI6MTc0MDEwNDg2OH0.XY_cfmpvNlw5uYQMJdLtr-keu8I7P8CsyL483m8LBTc";
const X_TTT_PMRP = "ecffd46cf0f300f79f21afcac734ea9c";

export default function () {
  const url = `${BASE_URL}/${oem_id}/${company_id}`;
  const params = {
    headers: {
      Authorization: AUTH_TOKEN,
      "X-TTT-PMRP": X_TTT_PMRP,
    },
  };

  const response = http.get(url, params);

  // Logging HTTP Status
  console.log(`🟢 [Request] URL: ${url}`);
  console.log(
    `📡 [Response] Status: ${response.status} | Time: ${response.timings.duration}ms`
  );

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  // Log เซิร์ฟล่มแบบบรรทัดเดียว
  if (response.status >= 500) {
    console.error(`🔥 [ERROR] Server Down! Status: ${response.status}`);
  }
}
