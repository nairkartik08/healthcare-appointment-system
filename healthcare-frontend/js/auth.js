async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("errorMsg");

  errorMsg.textContent = "";

  if (!email || !password) {
    errorMsg.textContent = "Please fill in all fields";
    return;
  }

  try {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // The backend now returns a JSON with { token, userId, username, role }
    localStorage.setItem("token", res.token);
    localStorage.setItem("role", res.role);
    localStorage.setItem("username", res.username);
    localStorage.setItem("userId", res.userId);

    // Redirect based on role
    const userRole = res.role.replace("ROLE_", "");
    
    if (userRole === "PATIENT") {
      window.location.href = "patient.html";
    } else if (userRole === "CLINIC" || userRole === "DOCTOR") {
      window.location.href = "doctor.html";
    } else if (userRole === "ADMIN") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "patient.html"; // Fallback
    }

  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Invalid credentials. Please try again.";
  }
}

async function submitRegistration() {
  const role = document.getElementById("role").value;
  const email = document.getElementById("email").value.trim();
  const username = email; // Backend also uses this natively
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const fullName = document.getElementById("fullName").value.trim();
  const mobileNumber = document.getElementById("mobileNumber").value.trim();
  const gender = document.getElementById("gender").value;
  
  const errorMsg = document.getElementById("errorMsg");
  const successMsg = document.getElementById("successMsg");

  errorMsg.textContent = "";
  successMsg.textContent = "";

  if (!email || !password || !fullName) {
    errorMsg.textContent = "Please fill in all core details (Full Name, Email, Password).";
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorMsg.textContent = "Please enter a valid, well-formed email address.";
    return;
  }

  if (password !== confirmPassword) {
    errorMsg.textContent = "Passwords do not match.";
    return;
  }

  let payload = {
    username, password, role, fullName, email, mobileNumber, gender
  };

  if (role === "PATIENT") {
    payload.dob = document.getElementById("dob").value;
    payload.bloodGroup = document.getElementById("bloodGroup").value;
    payload.address = document.getElementById("address").value;
    payload.emergencyContact = document.getElementById("emergencyContact").value;
    payload.existingDiseases = document.getElementById("existingDiseases").value;
    payload.insuranceProvider = document.getElementById("insuranceProvider").value;
  } else if (role === "CLINIC") {
    let spec = document.getElementById("specialization").value;
    if (spec === "Other") {
      spec = document.getElementById("otherSpecialization").value;
    }
    payload.specialization = spec;
    payload.consultationFees = parseFloat(document.getElementById("consultationFees").value || 0);
    payload.qualification = document.getElementById("qualification").value;
    payload.experienceYears = parseInt(document.getElementById("experienceYears").value || 0, 10);
    payload.licenseNumber = document.getElementById("licenseNumber").value;
    payload.hospitalName = document.getElementById("hospitalName").value;
    payload.clinicAddress = document.getElementById("clinicAddress").value;
    payload.profilePhotoUrl = document.getElementById("profilePhotoUrl").value;

    const days = [];
    document.querySelectorAll('input[name="availDays"]:checked').forEach(e => days.push(e.value));
    payload.availableDays = days.join(",");

    const tFrom = document.getElementById("timeFrom").value || "";
    const tTo = document.getElementById("timeTo").value || "";
    payload.availableTimeSlots = (tFrom && tTo) ? `${tFrom} - ${tTo}` : "";

  } else if (role === "ADMIN") {
    payload.department = document.getElementById("department").value;
    payload.adminCode = (document.getElementById("adminCode").value || "").trim();
    
    if (!payload.adminCode) {
      errorMsg.textContent = "Admin Secret Code is required.";
      return;
    }
  }

  try {
    const resText = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    successMsg.textContent = "OTP sent to your email! Please verify.";
    
    // Hide registration fields and show OTP field
    document.getElementById("registrationForm").style.display = "none";
    document.getElementById("registerBtn").style.display = "none";
    document.getElementById("loginLinkTxt").style.display = "none";
    document.getElementById("otp-section").style.display = "block";

  } catch (err) {
    console.error(err);
    errorMsg.textContent = err.message || "Registration failed";
  }
}

async function verifyOtp() {
  const email = document.getElementById("email").value.trim();
  const otp = document.getElementById("otpCode").value.trim();
  const errorMsg = document.getElementById("errorMsg");
  const successMsg = document.getElementById("successMsg");

  errorMsg.textContent = "";
  successMsg.textContent = "";

  if (!otp) {
    errorMsg.textContent = "Please enter the OTP.";
    return;
  }

  try {
    const resText = await apiFetch("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });

    successMsg.textContent = "Account verified successfully! Redirecting...";
    
    setTimeout(() => {
      window.location.href = `login.html?email=${encodeURIComponent(email)}`;
    }, 2000);

  } catch (err) {
    console.error(err);
    errorMsg.textContent = err.message || "OTP Verification failed";
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}
