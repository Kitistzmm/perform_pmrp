import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 200 },
    { duration: "2m", target: 0 },
    // { duration: '3m', target: 100000 },
    // { duration: '3m', target: 100000 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% ของคำขอควรตอบกลับในเวลาไม่เกิน 500ms
    "http_req_duration{status:200}": ["p(95)<400"], // 95% ของคำขอที่สถานะ 200 ควรตอบกลับในเวลาไม่เกิน 400ms
    http_reqs: ["count>100000"], // จำนวนคำขอทั้งหมดควรเกิน 100,000
    checks: ["rate>0.95"], // 95% ของการตรวจสอบ (checks) ควรผ่าน
  },
};

const BASE_URL = "http://203.154.184.162:5004/api/employee/getById";
// const oem_id = 'b6840fbf-e8b3-4fde-a01c-85f79fd03001';
// const company_id = '5146dd92-19f6-4dab-ad49-735a114fcfdb';
const emp_id = "963ed9ff-bbb3-4933-8ca5-882d370290f8";
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGl0eUlEIjoiZmExY2VjMjAtOTc0NC00ZWUzLWFhNmQtM2Y4MTcyZTEwYTcwIiwiZmlyc3RuYW1lIjoiS2lzc2FkYXBhIiwibGFzdG5hbWUiOiJOZ3VhbmNob24iLCJjb21wYW55SUQiOiIiLCJpYXQiOjE3Mzg4OTQ1MDMsImV4cCI6MTczODk4MDkwM30.OWLbLTlLTPOdcW_jSvJI2fGvW8FRQhOdEIKCImccDhg";
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

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
}
