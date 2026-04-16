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
        const today = new Date().toDateString();
        
        appState.appointments.forEach(a => {
            if(a.patient) patientSet.add(a.patient.id);
            
            // Calculate today's earnings
            const appDateStr = a.slot && a.slot.startTime ? new Date(a.slot.startTime).toDateString() : '';
            if (appDateStr === today) {
                const mode = (a.paymentMode || '').toUpperCase();
                if(a.status === 'COMPLETED' || mode === 'CARD' || mode === 'UPI') {
                    totalRevenue += (a.doctor ? a.doctor.consultationFee : 0);
                }
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
        if(app.status === 'BOOKED') statusBadge = `<span style="color: var(--primary-color)">BOOKED</span>`;
        if(app.status === 'CANCELLED') statusBadge = `<span style="color: var(--danger-color)">CANCELLED</span>`;
        if(app.status === 'COMPLETED') statusBadge = `<span style="color: var(--success-color)">COMPLETED</span>`;

        let formattedDateTime = '-';
        if (app.slot && app.slot.startTime) {
            const dateObj = new Date(app.slot.startTime);
            const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            formattedDateTime = `<div><strong style="color:var(--text-main)">${formattedDate}</strong></div><div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">${formattedTime}</div>`;
        }

        let paymentStatusHtml = '';
        const pMode = (app.paymentMode || '').toUpperCase();
        if(pMode === 'CARD' || pMode === 'UPI') {
            paymentStatusHtml = `<div style="font-size:0.85rem; margin-top: 4px; color: var(--success-color)">Paid</div>`;
        } else {
            paymentStatusHtml = `<div style="font-size:0.85rem; margin-top: 4px; color: var(--danger-color)">Not Paid (Clinic)</div>`;
        }

        tr.innerHTML = `
            <td>#${app.id}</td>
            <td>
                 <div style="font-weight: 500; font-size: 1.05rem;">${app.patient ? app.patient.name : 'Unknown Patient'}</div>
                 <div style="font-size:0.85rem; color:var(--text-muted); margin-top: 4px; line-height: 1.4;">
                     ${app.patient && app.patient.mobileNo ? '📞 '+app.patient.mobileNo : ''}
                 </div>
            </td>
            <td>${formattedDateTime}</td>
            <td>${statusBadge}${paymentStatusHtml}</td>
            <td style="display: flex; gap: 0.5rem;">
                ${app.status === 'BOOKED' ? `<button class="btn-outline btn-success btn-small" onclick="openCompletionModal(${app.id})">Complete</button>` : ''}
                ${app.status === 'BOOKED' ? `<button class="btn-outline btn-danger btn-small" onclick="cancelAppointmentAdmin(${app.id})">Cancel</button>` : '-'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openCompletionModal(id) {
    const app = appState.appointments.find(a => a.id === id);
    const patientName = app && app.patient ? app.patient.name : 'Unknown';

    document.getElementById('modalApptId').value = id;
    document.getElementById('modalPatientName').textContent = patientName;
    
    // Reset Form
    document.getElementById('recordDiagnosis').value = '';
    document.getElementById('recordSymptoms').value = '';
    document.getElementById('recordTreatment').value = '';
    document.getElementById('prescMedicine').value = '';
    document.getElementById('prescDosage').value = '';
    document.getElementById('prescDuration').value = '';

    document.getElementById('completionModal').style.display = "flex";
}

function closeCompletionModal() {
    document.getElementById('completionModal').style.display = "none";
}

async function submitCompletion() {
    const id = document.getElementById('modalApptId').value;
    if(!id) return;

    // Record Data
    const diagnosis = document.getElementById('recordDiagnosis').value.trim();
    const symptoms = document.getElementById('recordSymptoms').value.trim();
    const treatment = document.getElementById('recordTreatment').value.trim();

    // Prescription Data
    const medicineName = document.getElementById('prescMedicine').value.trim();
    const dosage = document.getElementById('prescDosage').value.trim();
    const duration = document.getElementById('prescDuration').value.trim();

    try {
        if (diagnosis || symptoms || treatment) {
            await apiFetch(`/records/diagnosis/${id}`, {
                method: 'POST',
                body: JSON.stringify({ diagnosis, symptoms, treatment })
            });
        }

        if (medicineName || dosage || duration) {
            await apiFetch(`/prescriptions/add/${id}`, {
                method: 'POST',
                body: JSON.stringify({ medicineName, dosage, duration })
            });
        }

        // Mark as Complete
        await apiFetch(`/patient/complete/${id}`, { method: 'PUT' });
        
        closeCompletionModal();
        await loadDoctorAppointments();
        alert("Appointment completed successfully!");

    } catch (err) {
        console.error("Failed to complete appointment:", err);
        alert("Failed to submit data. Please check connection and try again.");
    }
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

// approveAppointment logic was folded into submitCompletion() over openCompletionModal()

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

// --- Campaign Logic ---
function populateCampaignPatients() {
    const listDiv = document.getElementById('campaignPatientsList');
    listDiv.innerHTML = '';

    // Extract unique patients from appointments
    const patientMap = new Map();
    appState.appointments.forEach(a => {
        if (a.patient && a.patient.id) {
            patientMap.set(a.patient.id, a.patient.name);
        }
    });

    if (patientMap.size === 0) {
        listDiv.innerHTML = '<div class="text-muted">No patients found.</div>';
        return;
    }

    patientMap.forEach((name, id) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '0.5rem';
        div.innerHTML = `
            <input type="checkbox" id="camp_pat_${id}" value="${id}" class="patient-checkbox" />
            <label for="camp_pat_${id}" style="color: var(--text-main); margin-bottom:0; cursor:pointer;">${name}</label>
        `;
        listDiv.appendChild(div);
    });
}

// Call this at the end of loadDoctorAppointments
const _originalLoadDoctorAppointments = loadDoctorAppointments;
loadDoctorAppointments = async function() {
    await _originalLoadDoctorAppointments();
    populateCampaignPatients();
};

async function createCampaign() {
    const campaignName = document.getElementById('campName').value.trim();
    const notificationTitle = document.getElementById('campTitle').value.trim();
    const message = document.getElementById('campMessage').value.trim();

    if (!campaignName || !notificationTitle || !message) {
        return alert("Please fill all campaign fields.");
    }

    const checkboxes = document.querySelectorAll('.patient-checkbox:checked');
    const patientIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    if (patientIds.length === 0) {
        return alert("Please select at least one patient to notify.");
    }

    try {
        await apiFetch(`/doctor/campaign/create/${currentUser.doctorId}`, {
            method: 'POST',
            body: JSON.stringify({
                campaignName,
                notificationTitle,
                message,
                patientIds
            })
        });
        alert("Campaign created and notifications sent successfully!");
        
        // Reset form
        document.getElementById('campName').value = '';
        document.getElementById('campTitle').value = '';
        document.getElementById('campMessage').value = '';
        document.querySelectorAll('.patient-checkbox').forEach(cb => cb.checked = false);

    } catch (err) {
        console.error(err);
        alert("Failed to create campaign.");
    }
}

