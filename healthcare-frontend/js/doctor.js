const BASE_URL = "http://localhost:8080";

async function loadDoctors() {
  const res = await fetch(`${BASE_URL}/doctor/all`); // ✅ FIXED
  const doctors = await res.json();

  let html = "";

  doctors.forEach((doc) => {
    html += `
      <div>
        <h3>${doc.name}</h3>
        <p>${doc.specialization}</p>
        <p>Fee: ₹${doc.consultationFee}</p>
        <button onclick="book(${doc.id})">Book Appointment</button>
      </div>
      <hr/>
    `;
  });

  document.getElementById("doctorList").innerHTML = html;
}

function book(id) {
  localStorage.setItem("doctorId", id);
  window.location.href = "appointment.html";
}

loadDoctors(); // 🔥 VERY IMPORTANT
