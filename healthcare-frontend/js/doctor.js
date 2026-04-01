// --- Global State ---
let currentUser = {
    userId: localStorage.getItem("userId"),
    doctorId: null,
    name: localStorage.getItem("username"),
    role: localStorage.getItem("role")
};

let appState = {
    appointments: [],
    slots: []
};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", async () => {
    // Auth Check
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    if (!currentUser.role || !(currentUser.role.includes("CLINIC") || currentUser.role.includes("DOCTOR"))) {
        console.warn("Role mismatch: Expected DOCTOR/CLINIC");
    }

    await loadDoctorProfile();
    if (currentUser.doctorId) {
        await loadDoctorAppointments();
    }
});

// --- UI Navigation ---
function switchSection(sectionId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if(item.getAttribute('onclick').includes(sectionId)) {
            item.classList.add('active');
        }
    });

    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    const target = document.getElementById(sectionId);
    if(target) target.classList.add('active');
}

// --- Data Fetching ---
async function loadDoctorProfile() {
    try {
        const doctorData = await apiFetch(`/doctor/user/${currentUser.userId}`);
        if (!doctorData) {
            alert("Doctor profile not found.");
            return;
        }
        
        currentUser.doctorId = doctorData.id;
        currentUser.name = doctorData.name;
        
        document.getElementById('headerDoctorName').textContent = doctorData.name;
        
        // Populate profile form (read-only for now)
        document.getElementById('docName').value = doctorData.name || '';
        document.getElementById('docEmail').value = doctorData.email || '';
        document.getElementById('docMobile').value = doctorData.mobileNo || '';
        document.getElementById('docGender').value = doctorData.gender || '';
        document.getElementById('docSpec').value = doctorData.specialization || '';
        document.getElementById('docQual').value = doctorData.qualification || '';
        document.getElementById('docExp').value = doctorData.experienceYears || '0';
        document.getElementById('docLicense').value = doctorData.licenseNumber || '';
        document.getElementById('docHospital').value = doctorData.hospitalName || '';
        document.getElementById('docFee').value = doctorData.consultationFee || '0';
        document.getElementById('docAddress').value = doctorData.clinicAddress || '';
        document.getElementById('docDays').value = doctorData.availableDays || '';
        document.getElementById('docSlots').value = doctorData.availableTimeSlots || '';
        
    } catch (err) {
        console.error("Failed to load doctor profile:", err);
        alert("Error loading doctor profile. Please contact admin.");
    }
}

async function loadDoctorAppointments() {
    try {
        // Fetch all clinic appointments. Since the backend lacks a specific /doctor/appointments/{doctorId} 
        // that returns this DTO right now, we will fetch clinic appointments and filter by doctorId.
        // Wait, the backend has /clinic/appointments which fetches ALL appointments. 
        // In a real scenario we'd query /doctor/appointments/{id}. 
        const allAppts = await apiFetch(`/clinic/appointments`);
        
        appState.appointments = allAppts.filter(a => a.doctor && a.doctor.id === currentUser.doctorId);
        renderAppointments();
        
        // Calculate metrics
        document.getElementById('metricsTodayAppts').textContent = appState.appointments.length;
        
        // Simple distinct patients logic
        const patientSet = new Set();
        let totalRevenue = 0;
        appState.appointments.forEach(a => {
            if(a.patient) patientSet.add(a.patient.id);
            if(a.status === 'COMPLETED' || a.status === 'PAID') {
                totalRevenue += (a.doctor ? a.doctor.consultationFee : 0);
            }
        });
        
        document.getElementById('metricsPatients').textContent = patientSet.size;
        document.getElementById('metricsRevenue').textContent = totalRevenue;

    } catch (err) {
        console.error("Failed to load appointments:", err);
    }
}

// --- Interactions & Rendering ---
function renderAppointments() {
    const tbody = document.querySelector("#appointmentsTable tbody");
    tbody.innerHTML = '';

    if (!appState.appointments || appState.appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No appointments found.</td></tr>';
        return;
    }

    appState.appointments.forEach(app => {
        const tr = document.createElement('tr');
        
        let statusBadge = app.status;
        if(app.status === 'SCHEDULED') statusBadge = `<span style="color: var(--primary-color)">SCHEDULED</span>`;
        if(app.status === 'CANCELLED') statusBadge = `<span style="color: var(--danger-color)">CANCELLED</span>`;
        if(app.status === 'COMPLETED') statusBadge = `<span style="color: var(--success-color)">COMPLETED</span>`;

        tr.innerHTML = `
            <td>#${app.id}</td>
            <td>
                 <div style="font-weight: 500; font-size: 1.05rem;">${app.patient ? app.patient.name : 'Unknown Patient'}</div>
                 <div style="font-size:0.85rem; color:var(--text-muted); margin-top: 4px; line-height: 1.4;">
                     ${app.patient && app.patient.mobileNo ? '📞 '+app.patient.mobileNo : ''}
                 </div>
            </td>
            <td>${statusBadge}</td>
            <td style="display: flex; gap: 0.5rem;">
                ${app.status === 'SCHEDULED' ? `<button class="btn-outline btn-success btn-small" onclick="approveAppointment(${app.id})">Complete</button>` : ''}
                ${app.status === 'SCHEDULED' ? `<button class="btn-outline btn-danger btn-small" onclick="cancelAppointmentAdmin(${app.id})">Cancel</button>` : '-'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function createSlot() {
    const slotDate = document.getElementById('slotDate').value;
    const startTime = document.getElementById('slotStartTime').value;

    if(!slotDate || !startTime) return alert("Select date and time");

    const finalDateTime = `${slotDate}T${startTime}:00`;

    try {
        await apiFetch(`/clinic/create-slot/${currentUser.doctorId}`, {
            method: 'POST',
            body: JSON.stringify({ startTime: finalDateTime })
        });
        alert("Slot added to your schedule.");
        document.getElementById('slotDate').value = "";
        document.getElementById('slotStartTime').value = "";
    } catch(err) {
        console.error(err);
        alert("Failed to create slot.");
    }
}

async function approveAppointment(appointmentId) {
    try {
        await apiFetch(`/patient/complete/${appointmentId}`, { method: 'PUT' });
        await loadDoctorAppointments();
    } catch(err) {
        console.error(err);
        alert("Action failed.");
    }
}

async function cancelAppointmentAdmin(appointmentId) {
    if(!confirm("Cancel this appointment?")) return;
    try {
        await apiFetch(`/appointments/cancel/${appointmentId}`, { method: 'PUT' });
        await loadDoctorAppointments();
    } catch(err) {
        console.error(err);
        alert("Cancellation failed.");
    }
}
