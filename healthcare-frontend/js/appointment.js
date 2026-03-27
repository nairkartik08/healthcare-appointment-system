const BASE_URL = "http://localhost:8080";

async function book() {
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const doctorId = localStorage.getItem("doctorId");

  await fetch(`${BASE_URL}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ doctorId, date, time }),
  });

  alert("Appointment booked!");
}
