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
    prescriptions: [],
    reviewedDoctorIds: new Set()
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
        const [appts, reviewedIds] = await Promise.all([
            apiFetch(`/patient/appointments/${currentUser.patientId}`),
            apiFetch(`/reviews/patient/${currentUser.patientId}/doctors`)
        ]);
        appState.appointments = appts;
        if (reviewedIds) {
            appState.reviewedDoctorIds = new Set(reviewedIds);
        }
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
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📅</div>
                    <h3 style="color: var(--text-main); margin-bottom: 0.5rem;">No Appointments Yet</h3>
                    <p class="text-muted" style="margin-bottom: 1.5rem;">You haven't booked any appointments.</p>
                    <button class="btn-primary btn-small" onclick="switchSection('doctors')" style="width: auto;">Find a Doctor</button>
                </td>
            </tr>
        `;
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
        if(app.status === 'EXPIRED') statusBadge = `<span style="color: #64748b; font-weight: bold;">EXPIRED</span>`;
        if(app.status === 'EXPIRED_REFUNDED') statusBadge = `<span style="color: #38bdf8; font-weight: bold;">REFUNDED</span>`;

        const dateObj = app.slot ? new Date(app.slot.startTime) : null;
        const timeDisplay = dateObj ? dateObj.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

        let actionBtn = '-';
        if (app.status === 'BOOKED') {
            actionBtn = `<button class="btn-outline btn-danger btn-small" onclick="cancelAppointment(${app.id})">Cancel</button>`;
        } else if (app.status === 'COMPLETED' && app.doctor) {
            if (appState.reviewedDoctorIds.has(app.doctor.id)) {
                actionBtn = `<span class="badge" style="color: var(--success-color); border: 1px solid var(--glass-border); padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 500; background: rgba(34, 197, 94, 0.1);">⭐ Reviewed</span>`;
            } else {
                actionBtn = `<button class="btn-outline btn-success btn-small" onclick="openReviewModal(${app.doctor.id}, '${app.doctor.name}')">Leave Review</button>`;
            }
        }
        
        tr.innerHTML = `
            <td>#${app.id}</td>
            <td>Dr. ${app.doctor ? app.doctor.name : 'Unknown'}</td>
            <td>${timeDisplay}</td>
            <td>${statusBadge}</td>
            <td>${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderDoctors(doctorsList) {
    const grid = document.getElementById("doctorsGrid");
    grid.innerHTML = '';

    if (!doctorsList || doctorsList.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; background: var(--glass-bg); border-radius: 12px; border: 1px dashed var(--glass-border);">
                <div style="font-size: 3.5rem; margin-bottom: 1rem;">👨‍⚕️</div>
                <h3 style="color: var(--text-main); margin-bottom: 0.5rem;">No Doctors Found</h3>
                <p class="text-muted">We couldn't find any doctors matching your criteria.</p>
            </div>
        `;
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
                ⭐ ${doc.rating > 0 ? doc.rating : 'New'} | 🗓️ ${doc.experienceYears || 0} Years Exp.
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
            recordsList.innerHTML = `
                <li style="text-align: center; padding: 2rem;">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.7;">🩺</div>
                    <div style="color: var(--text-main); font-weight: 500;">No Medical Records</div>
                    <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.3rem;">Your diagnosis history will appear here.</div>
                </li>
            `;
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
            prescList.innerHTML = `
                <li style="text-align: center; padding: 2rem;">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.7;">💊</div>
                    <div style="color: var(--text-main); font-weight: 500;">No Active Prescriptions</div>
                    <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.3rem;">You have no prescribed medications right now.</div>
                </li>
            `;
        } else {
            appState.prescriptions.forEach(p => {
                const li = document.createElement('li');
                li.style.cssText = "border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;";
                li.innerHTML = `
                    <div>
                        <div style="font-weight: 600; color: var(--text-main); font-size: 1.1rem">${p.medicineName}</div>
                        <div style="font-size: 0.8rem; color: var(--primary-color); margin-bottom: 0.3rem;">Prescribed by Dr. ${p.doctor ? p.doctor.name : 'Unknown'}</div>
                        <div style="font-size: 0.9rem; color: var(--text-muted)">Dosage: ${p.dosage} | Duration: ${p.duration}</div>
                    </div>
                    <button class="btn-outline btn-small" style="white-space: nowrap; margin: 0; align-self: center;" onclick="downloadPrescription(${p.id})">⬇ Download PDF</button>
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
    const exp = parseInt(document.getElementById('filterExperience').value) || 0;
    const rating = parseInt(document.getElementById('filterRating').value) || 0;
    const fee = parseInt(document.getElementById('filterFee').value) || 0;

    const filtered = appState.doctors.filter(d => {
        const matchesQuery = (d.name && d.name.toLowerCase().includes(query)) || 
                             (d.specialization && d.specialization.toLowerCase().includes(query));
        const matchesExp = (d.experienceYears || 0) >= exp;
        const matchesRating = (d.rating || 0) >= rating;
        const matchesFee = fee === 0 || (d.consultationFee || 0) <= fee;
        
        return matchesQuery && matchesExp && matchesRating && matchesFee;
    });
    
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
        
        const now = new Date();
        const availableSlots = slots.filter(s => {
            if (s.booked) return false;
            const slotTime = new Date(s.startTime);
            return slotTime > now;
        });
        
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

// --- Notifications Logic ---
async function loadNotifications() {
    if (!currentUser.patientId) return;
    try {
        const notifications = await apiFetch(`/patient/notifications/${currentUser.patientId}`);
        renderNotifications(notifications);
    } catch (err) {
        console.error("Failed to load notifications:", err);
    }
}

function renderNotifications(notifications) {
    const list = document.getElementById('notificationsList');
    const badge = document.getElementById('notificationBadge');
    
    list.innerHTML = '';
    
    if (!notifications || notifications.length === 0) {
        list.innerHTML = '<div class="text-muted">No notifications</div>';
        badge.style.display = 'none';
        return;
    }

    let unreadCount = 0;
    
    notifications.forEach(notif => {
        if (!notif.isRead) unreadCount++;
        
        const div = document.createElement('div');
        div.style.cssText = `
            padding: 1rem; 
            border-radius: 8px; 
            background: rgba(255,255,255,0.05); 
            cursor: pointer;
            border-left: 4px solid ${notif.isRead ? 'transparent' : 'var(--danger-color)'};
            transition: all 0.3s ease;
            position: relative;
        `;
        
        const titleStyle = notif.isRead ? 'color: var(--text-main); font-weight: normal;' : 'color: white; font-weight: bold;';
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">${new Date(notif.createdAt).toLocaleDateString()}</div>
                <button class="delete-notif-btn" style="background: none; border: none; color: var(--danger-color); cursor: pointer; font-size: 1rem; opacity: 0.7; padding: 0 4px;" title="Delete">✖</button>
            </div>
            <div style="${titleStyle} margin-bottom: 0.5rem; font-size: 1.05rem;">${notif.title}</div>
            <div style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.4;">${notif.message}</div>
        `;
        
        div.onclick = async () => {
            if (!notif.isRead) {
                await markNotificationRead(notif.id);
                notif.isRead = true; // Optimistic update
                renderNotifications(notifications); // Re-render logic
            }
        };

        const deleteBtn = div.querySelector('.delete-notif-btn');
        deleteBtn.onclick = async (e) => {
            e.stopPropagation(); // Prevent trigger of mark-as-read
            if (!confirm("Are you sure you want to delete this notification?")) return;
            try {
                await apiFetch(`/patient/notifications/delete/${notif.id}`, { method: 'DELETE' });
                // Remove out of local array to re-render properly without waiting for backend delay
                const index = notifications.findIndex(n => n.id === notif.id);
                if (index > -1) notifications.splice(index, 1);
                renderNotifications(notifications);
            } catch(err) {
                console.error("Failed to delete:", err);
                alert("Failed to delete notification.");
            }
        };
        
        list.appendChild(div);
    });

    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

async function markNotificationRead(id) {
    try {
        await apiFetch(`/patient/notifications/read/${id}`, { method: 'PUT' });
    } catch (err) {
        console.error("Failed to mark notification as read", err);
    }
}

function toggleNotifications() {
    const panel = document.getElementById('notificationsPanel');
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

const _originalLoadPatientProfile = loadPatientProfile;
loadPatientProfile = async function() {
    await _originalLoadPatientProfile();
    await loadNotifications();
};

// --- PDF Generation Logic ---
async function downloadPrescription(id) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("PDF generator not yet loaded. Please try again in a moment.");
        return;
    }
    const { jsPDF } = window.jspdf;
    
    const p = appState.prescriptions.find(x => x.id === id);
    if (!p) {
        alert("Prescription details not found.");
        return;
    }

    const doc = new jsPDF();
    
    // Theme Colors
    const primaryColor = [15, 23, 42]; // Dark Slate
    const secondaryColor = [56, 189, 248]; // Accent Blue

    // Header rect
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("MEDICAL PRESCRIPTION", 105, 20, { align: "center" });
    
    // Subtext
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text("Generated by Healthcare Portal", 105, 28, { align: "center" });

    // Body Setup
    doc.setTextColor(0, 0, 0);

    // Doctor & Patient Info 
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Doctor Details:", 20, 60);
    doc.text("Patient Details:", 120, 60);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Dr. ${p.doctor ? p.doctor.name : 'Unknown Doctor'}`, 20, 70);
    
    const patientName = p.patient ? p.patient.name : currentUser.name;
    doc.text(`Name: ${patientName}`, 120, 70);
    
    const issuedDate = new Date().toLocaleDateString();
    doc.text(`Date Issued: ${issuedDate}`, 120, 78);

    // Divider Line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 90, 190, 90);

    // Prescription Details Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...secondaryColor);
    doc.text("Rx", 20, 110);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Medicine Information", 20, 130);

    // Table-like structure
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Medicine / Drug", 30, 145);
    doc.text("Dosage", 100, 145);
    doc.text("Duration", 150, 145);
    
    doc.setFont("helvetica", "normal");
    doc.text(`${p.medicineName}`, 30, 155);
    doc.text(`${p.dosage}`, 100, 155);
    doc.text(`${p.duration}`, 150, 155);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("This is an electronically generated prescription and does not require a physical signature.", 105, 280, { align: "center" });

    doc.save(`Prescription_${patientName.replace(/\s+/g, '_')}_${issuedDate.replace(/\//g, '-')}.pdf`);
}

// --- Review Logic ---
function openReviewModal(doctorId, doctorName) {
    document.getElementById('reviewDoctorId').value = doctorId;
    document.getElementById('reviewDoctorName').textContent = doctorName;
    document.getElementById('reviewRating').value = '5';
    document.getElementById('reviewComment').value = '';
    document.getElementById('reviewModal').style.display = 'flex';
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
}

async function submitReview() {
    const doctorId = document.getElementById('reviewDoctorId').value;
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value.trim();

    if (!comment) return alert("Please write a short review.");

    try {
        const response = await apiFetch('/reviews/add', {
            method: 'POST',
            body: JSON.stringify({
                patientId: currentUser.patientId,
                doctorId: parseInt(doctorId),
                rating: parseInt(rating),
                comment: comment
            })
        });
        
        if (response && response.error) {
            alert(response.error);
        } else {
            alert("Review submitted successfully! Thank you.");
            appState.reviewedDoctorIds.add(parseInt(doctorId));
            renderAppointments();
        }
        closeReviewModal();
    } catch (err) {
        console.error(err);
        alert(err.message || "Failed to submit review. You may have already reviewed this doctor.");
        closeReviewModal();
    }
}
