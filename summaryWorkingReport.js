import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "4m", target: 5000 }, // เพิ่มจำนวนผู้ใช้งานถึง 5000 คนใน 4 นาที
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% ของคำขอควรตอบกลับในเวลาไม่เกิน 500ms
    "http_req_duration{status:200}": ["p(95)<400"], // 95% ของคำขอที่สถานะ 200 ควรตอบกลับในเวลาไม่เกิน 400ms
    checks: ["rate>0.90"], // 90% ของการตรวจสอบ (checks) ควรผ่าน
  },
};

const BASE_URL =
  "http://203.154.184.162:5004/api/employee/filterSummaryWorkingReport";

const payload = JSON.stringify({
  oem_id: "e9549a12-9b0d-4b10-b2ef-ac3607c42ab4",
  company_id: "1a947e52-07ad-44fb-baca-aa24741512c3",
  emp_name_th: "",
  date_start: "2024-12-31T17:00:00.000Z",
  date_end: "2025-01-30T17:00:00.000Z",
  page: 1,
  size: 10,
});

const params = {
  headers: {
    "Content-Type": "application/json",
    Authorization:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGl0eUlEIjoiZmExY2VjMjAtOTc0NC00ZWUzLWFhNmQtM2Y4MTcyZTEwYTcwIiwiZmlyc3RuYW1lIjoiS2lzc2FkYXBhIiwibGFzdG5hbWUiOiJOZ3VhbmNob24iLCJjb21wYW55SUQiOiIiLCJpYXQiOjE3MzkwMzg3NTMsImV4cCI6MTczOTEyNTE1M30.9pBUOdiBKz_unHX-ajxXE9o9HJd-QDUVv4n0Nceoadk",
    "X-TTT-PMRP": "ecffd46cf0f300f79f21afcac734ea9c",
  },
};

export default function () {
  const response = http.post(BASE_URL, payload, params);

  console.log(`Response Status: ${response.status}`);
  console.log(`Response Body: ${response.body}`);

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
}
