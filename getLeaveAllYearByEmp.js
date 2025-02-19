import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "5m", target: 5000 }, // Ramp-up เพิ่มจาก 0 ถึง 5,000 user ใน 2 นาที
    // { duration: "5m", target: 10000 }, // ยิง 10,000 user คงที่เป็นเวลา 6 นาที
    // { duration: "2m", target: 0 }, // Ramp-down ลดจาก 10,000 user ลงเป็น 0 ใน 2 นาที
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% ของคำขอควรตอบกลับในเวลาไม่เกิน 500ms
    "http_req_duration{status:200}": ["p(95)<400"], // 95% ของคำขอที่สถานะ 200 ควรตอบกลับในเวลาไม่เกิน 400ms
    http_reqs: ["count>1000000"], // คำขอทั้งหมดควรมีมากกว่า 1 ล้านคำขอ
    checks: ["rate>0.95"], // 95% ของการตรวจสอบควรผ่าน
  },
};

const BASE_URL =
  "http://150.95.80.78:9003/api/employeeEntitlementLeaveDetail/getLeaveAllYearByEmp";
const emp_id = "b6cf9835-230b-4c51-ab77-1eb7f76722a8";
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGl0eUlEIjoiZmExY2VjMjAtOTc0NC00ZWUzLWFhNmQtM2Y4MTcyZTEwYTcwIiwiZmlyc3RuYW1lIjoiS2lzc2FkYXBhIiwibGFzdG5hbWUiOiJOZ3VhbmNob24iLCJjb21wYW55SUQiOiIiLCJpYXQiOjE3Mzk4NjA4NTEsImV4cCI6MTczOTk0NzI1MX0.9J4ekLpp35Ko2r_aWwrIQjWmO_xv22CX-NxUXjv2uoA";
const X_TTT_PMRP = "ecffd46cf0f300f79f21afcac734ea9c";

export default function () {
  const url = `${BASE_URL}/${emp_id}`;
  const params = {
    headers: {
      Authorization: AUTH_TOKEN,
      "X-TTT-PMRP": X_TTT_PMRP,
    },
  };

  const response = http.get(url, params);

  // ✅ บันทึก Log ตาม HTTP Status Code
  if (response.status === 200) {
    console.log(
      `✅ SUCCESS: 200 | Response Time: ${response.timings.duration} ms`
    );
  } else if (response.status >= 400 && response.status < 500) {
    console.log(
      `⚠️ CLIENT ERROR: ${response.status} | Response Time: ${response.timings.duration} ms`
    );
  } else if (response.status >= 500) {
    console.log(
      `❌ SERVER ERROR: ${response.status} | Response Time: ${response.timings.duration} ms`
    );
  }

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
}
