import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  vus: 50,
  duration: "30s",
};

export default function () {
  let url = "http://203.154.184.162:5002/api/authenticate/signIn";
  let headers = {
    "Content-Type": "application/json",
  };

  let payload = JSON.stringify({
    username: "Shimizu_Director",
    password: "123456",
  });

  let res = http.post(url, payload, { headers: headers });

  check(res, {
    "Login สำเร็จ (Status 200 หรือ 201)": (r) =>
      r.status === 200 || r.status === 201,
    "Response Time น้อยกว่า 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1);
}
