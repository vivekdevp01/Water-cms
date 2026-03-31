import http from "k6/http";
import { sleep } from "k6";

export let options = {
  vus: 50, // 50 concurrent users
  duration: "1m", // for 1 minute
};

export default function () {
  const url =
    "https://firestore.googleapis.com/v1/projects/complaint-system-ef4ef/databases/(default)/documents/complaints";

  http.get(url);
  sleep(1);
}
