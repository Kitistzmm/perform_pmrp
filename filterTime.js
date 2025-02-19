import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "4m", target: 5000 }, // ค่อยๆเพิ่มผู้ใช้งานถึง 5000 คนใน 4 นาที
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% ของคำขอควรตอบกลับในเวลาไม่เกิน 500ms
    "http_req_duration{status:200}": ["p(95)<400"], // 95% ของคำขอที่สถานะ 200 ควรตอบกลับในเวลาไม่เกิน 400ms
    checks: ["rate>0.90"], // 90% ของการตรวจสอบ (checks) ควรผ่าน
  },
};

// ✅ Base URL ของ API
const BASE_URL =
  "http://203.154.184.162:5004/api/employeeTimeAttendance/filterTimeAttendance";

// ✅ Payload (Body)
const payload = JSON.stringify({
  company_id: "1a947e52-07ad-44fb-baca-aa24741512c3",
  emp_name_th: "",
  emp_type_id: "",
  emp_type_name: "",
  emp_contract_type_id: "",
  oem_id: "e9549a12-9b0d-4b10-b2ef-ac3607c42ab4",
  timeStart: "2024-11-29T00:00:00.000Z",
  timeEnd: "2024-11-29T02:39:21.498Z",
  emp_status_id: "",
  page: "1",
  size: "10",
});

// ✅ Headers
const params = {
  headers: {
    "Content-Type": "application/json",
    Authorization:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGl0eUlEIjoiZmExY2VjMjAtOTc0NC00ZWUzLWFhNmQtM2Y4MTcyZTEwYTcwIiwiZmlyc3RuYW1lIjoiS2lzc2FkYXBhIiwibGFzdG5hbWUiOiJOZ3VhbmNob24iLCJjb21wYW55SUQiOiIiLCJpYXQiOjE3MzkwMzg3NTMsImV4cCI6MTczOTEyNTE1M30.9pBUOdiBKz_unHX-ajxXE9o9HJd-QDUVv4n0Nceoadk",
    "X-TTT-PMRP": "ecffd46cf0f300f79f21afcac734ea9c",
  },
};

export default function () {
  // ✅ ส่ง Request แบบ POST และใส่ body + headers
  const response = http.post(BASE_URL, payload, params);

  // ✅ Log Response Status และ Body
  console.log(`Response Status: ${response.status}`);
  console.log(`Response Body: ${response.body}`);

  // ✅ ตรวจสอบเงื่อนไขของ Response
  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
    "response is not empty": (r) => r.body && r.body.length > 0,
  });
}
