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

const BASE_URL = "http://150.95.80.78:9003/api/employee/getEmpWorkType";
const oem_id = "e9549a12-9b0d-4b10-b2ef-ac3607c42ab4";
const company_id = "1a947e52-07ad-44fb-baca-aa24741512c3";
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGl0eUlEIjoiZmExY2VjMjAtOTc0NC00ZWUzLWFhNmQtM2Y4MTcyZTEwYTcwIiwiZmlyc3RuYW1lIjoiS2lzc2FkYXBhIiwibGFzdG5hbWUiOiJOZ3VhbmNob24iLCJjb21wYW55SUQiOiIiLCJpYXQiOjE3Mzk4NjA4NTEsImV4cCI6MTczOTk0NzI1MX0.9J4ekLpp35Ko2r_aWwrIQjWmO_xv22CX-NxUXjv2uoA";
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

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
}
