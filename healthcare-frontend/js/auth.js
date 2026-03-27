const BASE_URL = "http://localhost:8080";

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const role = await res.text();

  localStorage.setItem("role", role);

  if (role.includes("PATIENT")) {
    window.location.href = "patient.html";
  } else if (role.includes("DOCTOR")) {
    window.location.href = "doctor.html";
  } else {
    alert("Login failed");
  }
}
async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  const res = await fetch("http://localhost:8080/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password, role }),
  });

  const data = await res.text();

  alert(data);
}
