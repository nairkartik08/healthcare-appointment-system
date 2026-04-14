// --- Global State ---
let currentUser = {
    userId: localStorage.getItem("userId"),
    patientId: null,
    name: localStorage.getItem("username"),
    role: localStorage.getItem("role")
};

let appState = {
    doctors: [],
    appointments: [],
    invoices: [],
    records: [],
    prescriptions: []
};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", async () => {
    // Auth Check
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    if (!currentUser.role || !currentUser.role.includes("PATIENT")) {
        console.warn("User is not a patient, but trying to access patient dashboard.");
        // We could redirect here if we wanted strictly enforced roles on the client
    }

    await loadPatientProfile();
    if (currentUser.patientId) {
        await loadAppointments();
        await loadDoctors();
        await loadBilling();
        await loadRecordsAndPrescriptions();
    }
});

// --- UI Navigation ---
function switchSection(sectionId) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if(item.getAttribute('onclick').includes(sectionId)) {
            item.classList.add('active');
        }
    });

    // Update active section
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    const target = document.getElementById(sectionId);
    if(target) target.classList.add('active');
}

// --- Data Fetching ---
async function loadPatientProfile() {
    try {
        const patientData = await apiFetch(`/patient/user/${currentUser.userId}`);
        currentUser.patientId = patientData.id;
        currentUser.name = patientData.name;
        
        // Update UI
        document.getElementById('headerPatientName').textContent = patientData.name;
        document.getElementById('profileName').value = patientData.name || '';
        document.getElementById('profileEmail').value = patientData.email || '';
        document.getElementById('profileMobile').value = patientData.mobileNo || '';
        document.getElementById('profileGender').value = patientData.gender || '';
        document.getElementById('profileDob').value = patientData.dob || '';
        document.getElementById('profileBloodGroup').value = patientData.bloodGroup || '';
        document.getElementById('profileAddress').value = patientData.address || '';
        document.getElementById('profileEmergency').value = patientData.emergencyContact || '';
        document.getElementById('profileInsurance').value = patientData.insuranceProvider || '';
        document.getElementById('profileDiseases').value = patientData.existingDiseases || '';
    } catch (err) {
        console.error("Failed to load patient profile:", err);
        alert("Error loading profile. Your backend might not have the new ID mapping code loaded yet.");
    }
}

async function updateProfile() {
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const mobileNo = document.getElementById('profileMobile').value;
    const bloodGroup = document.getElementById('profileBloodGroup').value;
    const address = document.getElementById('profileAddress').value;
    const emergencyContact = document.getElementById('profileEmergency').value;
    const insuranceProvider = document.getElementById('profileInsurance').value;
    const existingDiseases = document.getElementById('profileDiseases').value;
    
    // gender and dob are usually read-only or not edited easily, but we'll include them if they ever unlock them
    const gender = document.getElementById('profileGender').value;
    const dob = document.getElementById('profileDob').value;

    const msgBox = document.getElementById('profileStatusMsg');

    try {
        await apiFetch(`/patient/update/${currentUser.patientId}`, {
            method: 'PUT',
            body: JSON.stringify({ 
                name, email, mobileNo, bloodGroup, address, 
                emergencyContact, insuranceProvider, existingDiseases, 
                gender, dob, userId: currentUser.userId 
            })
        });
        
        document.getElementById('headerPatientName').textContent = name;
        
        msgBox.textContent = "Profile updated successfully!";
        msgBox.className = "status-msg success-msg show";
        setTimeout(() => msgBox.classList.remove('show'), 3000);
    } catch (err) {
        console.error("Failed to update profile", err);
        msgBox.textContent = "Error updating profile.";
        msgBox.className = "status-msg error-msg show";
        setTimeout(() => msgBox.classList.remove('show'), 3000);
    }
}

async function loadAppointments() {
    try {
        appState.appointments = await apiFetch(`/patient/appointments/${currentUser.patientId}`);
        renderAppointments();
    } catch (err) {
        console.error("Failed to load appointments:", err);
    }
}

async function loadDoctors() {
    try {
        appState.doctors = await apiFetch(`/doctor/all`);
        renderDoctors(appState.doctors);
    } catch (err) {
        console.error("Failed to load doctors:", err);
    }
}

async function loadBilling() {
    try {
        appState.invoices = await apiFetch(`/billing/patient/${currentUser.patientId}`);
        // Calculate pending bills sum
        let pendingSum = 0;
        appState.invoices.forEach(inv => {
            if(inv.status === "UNPAID" || inv.status === "PENDING") {
                pendingSum += inv.amount;
            }
        });
        // Update metric card (Pending Bills is 2nd card)
        const pendingUI = document.querySelectorAll('.dashboard-grid .metric-card .value')[1];
        if(pendingUI) pendingUI.textContent = `₹ ${pendingSum}`;
    } catch (err) {
        console.error("Failed to load billing:", err);
    }
}

async function loadRecordsAndPrescriptions() {
    try {
        appState.records = await apiFetch(`/records/patient/${currentUser.patientId}`);
        appState.prescriptions = await apiFetch(`/prescriptions/patient/${currentUser.patientId}`);
        renderRecordsAndPrescriptions();
    } catch (err) {
        console.error("Failed to load medical history:", err);
    }
}

// --- Rendering ---
function renderAppointments() {
    const tbody = document.querySelector("#appointmentsTable tbody");
    tbody.innerHTML = '';

    if (!appState.appointments || appState.appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No appointments found.</td></tr>';
        document.getElementById('metricsAppointments').textContent = '0';
        return;
    }

    // Active apps count
    const activeCount = appState.appointments.filter(a => a.status !== 'CANCELLED').length;
    document.getElementById('metricsAppointments').textContent = activeCount;

    appState.appointments.forEach(app => {
        const tr = document.createElement('tr');
        
        let statusBadge = app.status;
        if(app.status === 'BOOKED') statusBadge = `<span style="color: var(--primary-color)">BOOKED</span>`;
        if(app.status === 'CANCELLED') statusBadge = `<span style="color: var(--danger-color)">CANCELLED</span>`;
        if(app.status === 'COMPLETED') statusBadge = `<span style="color: var(--success-color)">COMPLETED</span>`;

        tr.innerHTML = `
            <td>#${app.id}</td>
            <td>Dr. ${app.doctor ? app.doctor.name : 'Unknown'}</td>
            <td>${statusBadge}</td>
            <td>
                ${app.status === 'BOOKED' ? `<button class="btn-outline btn-danger btn-small" onclick="cancelAppointment(${app.id})">Cancel</button>` : '-'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderDoctors(doctorsList) {
    const grid = document.getElementById("doctorsGrid");
    grid.innerHTML = '';

    if (!doctorsList || doctorsList.length === 0) {
        grid.innerHTML = '<p class="text-muted">No doctors found matching criteria.</p>';
        return;
    }

    doctorsList.forEach(doc => {
        const card = document.createElement('div');
        card.className = "metric-card glass-container";
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white;">
                    👨‍⚕️
                </div>
                <div>
                    <h3 style="color: var(--text-main); font-size: 1.15rem; margin-bottom: 0.2rem;">Dr. ${doc.name}</h3>
                    <div style="color: var(--primary-color); font-size: 0.9rem;">${doc.specialization}</div>
                </div>
            </div>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                ⭐ ${doc.rating} | 🗓️ ${doc.experienceYears} Years Exp.
            </div>
            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1.2rem;">
                ₹${doc.consultationFee} <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted)">/ visit</span>
            </div>
            <button class="btn-primary btn-small" style="margin-top: auto;" onclick="openBookingModal(${doc.id}, '${doc.name}')">Book Appointment</button>
        `;
        grid.appendChild(card);
    });
}

function renderRecordsAndPrescriptions() {
    // 1. Render Reports (Diagnosis)
    const recordsList = document.getElementById("patientReportsList");
    if(recordsList) {
        recordsList.innerHTML = '';
        if(!appState.records || appState.records.length === 0) {
            recordsList.innerHTML = '<li class="text-muted">No medical records found.</li>';
        } else {
            appState.records.forEach(rec => {
                const li = document.createElement('li');
                li.style.cssText = "display: flex; flex-direction: column; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;";
                li.innerHTML = `
                    <div style="font-weight: 600; color: var(--text-main); font-size: 1.1rem">${rec.diagnosis || 'Diagnosis Pending'}</div>
                    <div style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.4rem;">Symptoms: ${rec.symptoms || 'None recorded'}</div>
                    <div style="font-size: 0.95rem; color: var(--primary-color); margin-top: 0.2rem;">Treatment: ${rec.treatment || 'Consult Doctor'}</div>
                `;
                recordsList.appendChild(li);
            });
        }
        document.getElementById('metricsReports').textContent = appState.records.length || 0;
    }

    // 2. Render Prescriptions
    const prescList = document.getElementById("patientPrescriptionsList");
    if(prescList) {
        prescList.innerHTML = '';
        if(!appState.prescriptions || appState.prescriptions.length === 0) {
            prescList.innerHTML = '<li class="text-muted">No active prescriptions.</li>';
        } else {
            appState.prescriptions.forEach(p => {
                const li = document.createElement('li');
                li.style.cssText = "border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;";
                li.innerHTML = `
                    <div style="font-weight: 600; color: var(--text-main); font-size: 1.1rem">${p.medicineName}</div>
                    <div style="font-size: 0.9rem; color: var(--text-muted)">Dosage: ${p.dosage} | Duration: ${p.duration}</div>
                `;
                prescList.appendChild(li);
            });
        }
        
        // Update metric card (Prescriptions is 4th card)
        const prescUI = document.querySelectorAll('.dashboard-grid .metric-card .value')[3];
        if(prescUI) prescUI.textContent = appState.prescriptions.length || 0;
    }
}

// --- Interactions ---
function filterDoctors() {
    const query = document.getElementById('doctorSearchInput').value.toLowerCase();
    const filtered = appState.doctors.filter(d => 
        (d.name && d.name.toLowerCase().includes(query)) || 
        (d.specialization && d.specialization.toLowerCase().includes(query))
    );
    renderDoctors(filtered);
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = "none";
}

function goToStep(step) {
    document.getElementById('bookingStep1').style.display = step === 1 ? 'block' : 'none';
    document.getElementById('bookingStep2').style.display = step === 2 ? 'block' : 'none';
}

function selectSlot(slotId, dateStr, timeStr) {
    document.getElementById('bookingSlotId').value = slotId;
    
    // Store selected slot date and time for checkout page
    sessionStorage.setItem('selectedSlotDate', dateStr);
    sessionStorage.setItem('selectedSlotTime', timeStr);
    
    // Auto-fill from profile so the user doesn't type it twice
    document.getElementById('bookingName').value = document.getElementById('profileName').value || currentUser.name || '';
    
    const dobInput = document.getElementById('profileDob');
    let age = '';
    if (dobInput && dobInput.value) {
        const birthYear = new Date(dobInput.value).getFullYear();
        if(!isNaN(birthYear)) {
            age = new Date().getFullYear() - birthYear;
        }
    }
    document.getElementById('bookingAge').value = age;
    
    document.getElementById('bookingEmail').value = document.getElementById('profileEmail').value || '';
    document.getElementById('bookingMobile').value = ''; 
    
    goToStep(2);
}

async function openBookingModal(doctorId, doctorName) {
    document.getElementById('bookingDoctorId').value = doctorId;
    document.getElementById('bookingDoctorName').textContent = doctorName;
    document.getElementById('bookingSlotId').value = "";
    
    // Reset UI to step 1
    goToStep(1);
    document.getElementById('slotsContainer').innerHTML = "<div class='text-center text-muted'>Loading available slots...</div>";
    document.getElementById('bookingModal').style.display = "block";

    try {
        const slots = await apiFetch(`/patient/slots/${doctorId}`);
        const container = document.getElementById('slotsContainer');
        container.innerHTML = "";
        
        const availableSlots = slots.filter(s => !s.booked);
        
        if (availableSlots.length === 0) {
            container.innerHTML = "<div class='text-center text-muted' style='padding: 2rem 0;'>No slots available currently.<br>Please try another doctor.</div>";
            return;
        }

        availableSlots.forEach(slot => {
            const dateObj = new Date(slot.startTime);
            const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            const btn = document.createElement('button');
            btn.className = "btn-outline";
            btn.style.cssText = "display: flex; justify-content: space-between; padding: 1rem; border-radius: 8px; cursor: pointer; text-align: left;";
            btn.innerHTML = `<span><strong>${formattedDate}</strong></span> <span>${formattedTime}</span>`;
            btn.onclick = () => selectSlot(slot.id, formattedDate, formattedTime);
            container.appendChild(btn);
        });

    } catch(err) {
        console.error("Failed to load doctor slots:", err);
        document.getElementById('slotsContainer').innerHTML = "<div class='text-center text-danger'>Failed to load slots. Please try again later.</div>";
    }
}

function proceedToPayment() {
    const doctorId = document.getElementById('bookingDoctorId').value;
    const doctorName = document.getElementById('bookingDoctorName').textContent;
    const slotId = document.getElementById('bookingSlotId').value;
    
    const name = document.getElementById('bookingName').value;
    const age = document.getElementById('bookingAge').value;
    const mobileNo = document.getElementById('bookingMobile').value;
    const email = document.getElementById('bookingEmail').value;

    if(!slotId || !name || !age || !mobileNo) {
        return alert('Please fill all the basic details to proceed.');
    }

    // Find doctor fee
    const doctor = appState.doctors.find(d => d.id == doctorId);
    const fee = doctor ? doctor.consultationFee : 500;

    const bookingData = {
        doctorId,
        doctorName,
        fee,
        slotId,
        slotDate: sessionStorage.getItem('selectedSlotDate'),
        slotTime: sessionStorage.getItem('selectedSlotTime'),
        patientId: currentUser.patientId,
        patientName: name,
        patientAge: age,
        patientMobile: mobileNo,
        patientEmail: email
    };

    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    window.location.href = 'payment.html';
}

async function cancelAppointment(appointmentId) {
    if(!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
        await apiFetch(`/patient/cancel/${appointmentId}`, {
            method: 'PUT'
        });
        await loadAppointments();
    } catch (err) {
        console.error(err);
        alert("Failed to cancel appointment");
    }
}
