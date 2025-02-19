import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [{ duration: "5m", target: 100000 }],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% ของคำขอควรตอบกลับในเวลาไม่เกิน 500ms
    "http_req_duration{status:200}": ["p(95)<400"], // 95% ของคำขอที่สถานะ 200 ควรตอบกลับในเวลาไม่เกิน 400ms
    http_reqs: ["count>100000"], // จำนวนคำขอทั้งหมดควรเกิน 100,000
    checks: ["rate>0.90"], // 90% ของการตรวจสอบ (checks) ควรผ่าน
  },
};

// ✅ Base URL ของ API
const BASE_URL = "http://150.95.80.78:9003/api/employeeNation/getEmpMasterType";

// ✅ Payload (ส่งข้อมูลเป็น JSON ใน body)
const payload = JSON.stringify({
  oem_id: "b6840fbf-e8b3-4fde-a01c-85f79fd03001",
  company_id: "5146dd92-19f6-4dab-ad49-735a114fcfdb",
});

// ✅ Headers ที่ต้องใช้
const params = {
  headers: {
    "Content-Type": "application/json", // ต้องระบุว่าเป็น JSON
    Authorization:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGl0eUlEIjoiZmExY2VjMjAtOTc0NC00ZWUzLWFhNmQtM2Y4MTcyZTEwYTcwIiwiZmlyc3RuYW1lIjoiS2lzc2FkYXBhIiwibGFzdG5hbWUiOiJOZ3VhbmNob24iLCJjb21wYW55SUQiOiIiLCJpYXQiOjE3Mzk4NjA4NTEsImV4cCI6MTczOTk0NzI1MX0.9J4ekLpp35Ko2r_aWwrIQjWmO_xv22CX-NxUXjv2uoA",
    "X-TTT-PMRP": "ecffd46cf0f300f79f21afcac734ea9c",
  },
};

export default function () {
  // ✅ ส่ง Request แบบ POST และใส่ body + headers
  const response = http.post(BASE_URL, payload, params);

  // ✅ ตรวจสอบสถานะของ Response และ Log ตามสถานะ
  if (response.status === 200) {
    console.log(
      `✅ SUCCESS: ${response.status} | Time: ${response.timings.duration}ms`
    );
  } else if (response.status >= 400 && response.status < 500) {
    console.log(
      `⚠️ CLIENT ERROR: ${response.status} | Time: ${response.timings.duration}ms`
    );
  } else if (response.status >= 500) {
    console.log(
      `❌ SERVER ERROR: ${response.status} | Time: ${response.timings.duration}ms`
    );
  } else {
    console.log(
      `ℹ️ OTHER RESPONSE: ${response.status} | Time: ${response.timings.duration}ms`
    );
  }

  // ✅ ตรวจสอบเงื่อนไขของ Response
  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
}
