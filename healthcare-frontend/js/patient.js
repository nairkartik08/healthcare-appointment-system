const BASE_URL = "http://localhost:8080";

async function loadDoctors() {
  const res = await fetch(`${BASE_URL}/doctor/all`);
  const doctors = await res.json();

  let html = "";

  doctors.forEach((doc) => {
    html += `
      <div>
        <h3>${doc.name}</h3>
        <p>${doc.specialization}</p>
        <button onclick="book(${doc.id})">Book Appointment</button>
      </div>
    `;
  });

  document.getElementById("doctorList").innerHTML = html;
}

function book(id) {
  localStorage.setItem("doctorId", id);
  window.location.href = "appointment.html";
}
function viewDoctors() {
  window.location.href = "doctors.html";
}
