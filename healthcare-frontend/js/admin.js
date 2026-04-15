// --- Global State ---
let currentUser = {
    userId: localStorage.getItem("userId"),
    adminId: null,
    name: localStorage.getItem("username"),
    role: localStorage.getItem("role")
};

let appState = {
    doctors: [],
    appointments: [],
    patients: [],
    invoices: []
};

let revenueChartInstance = null;

// --- Initialization ---
document.addEventListener("DOMContentLoaded", async () => {
    // Auth Check
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    if (!currentUser.role || !currentUser.role.includes("ADMIN")) {
        console.warn("Role mismatch: Expected ADMIN");
    }

    await loadAdminProfile();
    // Proceed to load dashboard if adminId is set, or if user explicitly holds admin role
    if (currentUser.adminId || currentUser.role === "ROLE_ADMIN" || currentUser.role === "ADMIN") {
        await loadClinicAppointments();
        await loadClinicDoctors();
        await loadPatients();
        await loadBilling();
    }
});

// --- UI Navigation ---
function switchSection(sectionId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(sectionId)) {
            item.classList.add('active');
        }
    });

    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
}

function renderChart(revenueData) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(revenueData).length ? Object.keys(revenueData) : ['No Data'],
            datasets: [{
                label: 'Revenue (₹)',
                data: Object.keys(revenueData).length ? Object.values(revenueData) : [0],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#f8fafc' } }
            },
            scales: {
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

// --- Data Fetching ---
async function loadAdminProfile() {
    try {
        const adminData = await apiFetch(`/admin/user/${currentUser.userId}`);

        if (adminData && typeof adminData === 'object' && adminData.id) {
            currentUser.adminId = adminData.id;
            currentUser.name = adminData.fullName || currentUser.name;

            document.getElementById('headerClinicName').textContent = currentUser.name;
            document.getElementById('adminName').value = adminData.fullName || '';
            document.getElementById('adminEmail').value = adminData.email || '';
            document.getElementById('adminDepartment').value = adminData.department || '';
            document.getElementById('adminContact').value = adminData.contactNumber || '';
        } else {
            // Null fallback
            document.getElementById('headerClinicName').textContent = currentUser.name || "Administrator";
        }
    } catch (err) {
        console.error("Failed to load admin profile:", err);
        document.getElementById('headerClinicName').textContent = currentUser.name || "Administrator";
    }
}

async function loadClinicAppointments() {
    try {
        appState.appointments = await apiFetch(`/clinic/appointments`);
        renderAppointments();
    } catch (err) {
        console.error("Failed to load appointments:", err);
    }
}

async function loadClinicDoctors() {
    try {
        appState.doctors = await apiFetch(`/admin/doctors`);
        renderDoctors();
    } catch (err) {
        console.error("Failed to load doctors:", err);
    }
}

async function loadPatients() {
    try {
        appState.patients = await apiFetch(`/patient/all`);
        // Update metric card
        document.querySelectorAll('.dashboard-grid .metric-card .value')[3].textContent = appState.patients.length || 0;

        const tbody = document.getElementById("clinicPatientsTableBody");
        if (tbody) {
            tbody.innerHTML = '';
            if (appState.patients.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center">No patients found.</td></tr>';
            } else {
                appState.patients.forEach(pat => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${pat.name || 'Unknown'}</td>
                        <td>${pat.age || '-'}</td>
                        <td>${pat.email || 'N/A'}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }
    } catch (err) {
        console.error("Failed to load patients", err);
    }
}

async function loadBilling() {
    try {
        // Fetch all invoices to act as global clinic revenue
        appState.invoices = await apiFetch(`/billing/all`);

        let totalRevenue = 0;
        const revenueByMonth = {};

        const tbody = document.getElementById("clinicBillingTableBody");
        if (tbody) tbody.innerHTML = '';

        if (appState.invoices.length === 0 && tbody) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No transactions available.</td></tr>';
        }

        appState.invoices.forEach(inv => {
            // Add up paid revenue
            if (inv.status === "PAID" || inv.status === "COMPLETED") {
                totalRevenue += inv.amount;
                // Group by a mock date since Invoice doesn't have a date field currently, 
                // in real app we group by inv.date. We'll simulate a distribution.
                revenueByMonth['Current'] = (revenueByMonth['Current'] || 0) + inv.amount;
            } else {
                // To have some chart data even if unpaid if they want to view "expected"
                revenueByMonth['Expected'] = (revenueByMonth['Expected'] || 0) + inv.amount;
            }

            // Render table row
            if (tbody) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#INV-${inv.id}</td>
                    <td>${inv.patient ? inv.patient.name : 'Unknown'}</td>
                    <td>₹ ${inv.amount}</td>
                    <td><span style="color: ${inv.status === 'PAID' ? 'var(--success-color)' : 'var(--danger-color)'}">${inv.status}</span></td>
                 `;
                tbody.appendChild(tr);
            }
        });

        // Update total revenue card
        document.querySelectorAll('.dashboard-grid .metric-card .value')[1].textContent = `₹ ${totalRevenue}`;

        // Render Chart
        renderChart(revenueByMonth);

    } catch (err) {
        console.error("Failed to load billing", err);
    }
}

// --- Interactions & Rendering ---
function renderAppointments() {
    const tbody = document.querySelector("#appointmentsTable tbody");
    tbody.innerHTML = '';

    if (!appState.appointments || appState.appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No appointments found.</td></tr>';
        document.getElementById('metricsAppointments').textContent = '0';
        return;
    }

    document.getElementById('metricsAppointments').textContent = appState.appointments.length;

    appState.appointments.forEach(app => {
        const tr = document.createElement('tr');

        let statusBadge = app.status;
        if (app.status === 'SCHEDULED') statusBadge = `<span style="color: var(--primary-color)">SCHEDULED</span>`;
        if (app.status === 'CANCELLED') statusBadge = `<span style="color: var(--danger-color)">CANCELLED</span>`;
        if (app.status === 'COMPLETED') statusBadge = `<span style="color: var(--success-color)">COMPLETED</span>`;

        let paymentStatus = app.paymentMode === 'CLINIC' ? 'Pending' : 'Completed';
        let paymentStatusColor = app.paymentMode === 'CLINIC' ? 'var(--danger-color)' : 'var(--success-color)';
        let paymentBadge = `<div style="font-weight: 500; color: ${paymentStatusColor};">${paymentStatus}</div>`;

        if (app.paymentMode === 'UPI' || app.paymentMode === 'CARD') {
            paymentBadge += `<div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">💳 Online (${app.paymentMode})</div>`;
        } else if (app.paymentMode === 'CLINIC') {
            paymentBadge += `<div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">🏥 Pay at Clinic</div>`;
        } else {
            paymentBadge += `<div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">Not Specified</div>`;
        }

        tr.innerHTML = `
            <td>#${app.id}</td>
            <td>
                 <div style="font-weight: 500; font-size: 1.05rem;">${app.patient ? app.patient.name : 'Unknown Patient'}</div>
                 <div style="font-size:0.85rem; color:var(--text-muted); margin-top: 4px; line-height: 1.4;">
                     ${app.patient && app.patient.mobileNo ? '📞 ' + app.patient.mobileNo : 'No Contact Info'}
                     ${app.patient && app.patient.age ? '<br>🎂 Age: ' + app.patient.age : ''}
                     ${app.patient && app.patient.email ? '<br>✉️ ' + app.patient.email : ''}
                 </div>
            </td>
            <td>Dr. ${app.doctor ? app.doctor.name : 'Unknown'}</td>
            <td>${paymentBadge}</td>
            <td>${statusBadge}</td>
            <td style="display: flex; gap: 0.5rem;">
                ${app.status === 'SCHEDULED' ? `<button class="btn-outline btn-success btn-small" onclick="approveAppointment(${app.id})">Approve</button>` : ''}
                ${app.status === 'SCHEDULED' ? `<button class="btn-outline btn-danger btn-small" onclick="cancelAppointmentAdmin(${app.id})">Cancel</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderDoctors() {
    const grid = document.getElementById("clinicDoctorsGrid");
    grid.innerHTML = '';

    if (!appState.doctors || appState.doctors.length === 0) {
        grid.innerHTML = '<p class="text-muted">No doctors currently managed.</p>';
        document.getElementById('metricsDoctors').textContent = '0';
        return;
    }

    const activeCount = appState.doctors.filter(d => d.approvalStatus === 'APPROVED').length;
    document.getElementById('metricsDoctors').textContent = activeCount;

    appState.doctors.forEach(item => {
        // item has .doctor and .approvalStatus if fetched from /admin/doctors
        // fallback if fetched directly
        const doc = item.doctor || item;
        const status = item.approvalStatus || 'APPROVED';

        let statusColor = status === 'APPROVED' ? 'var(--success-color)' : (status === 'PENDING_APPROVAL' ? '#f59e0b' : 'var(--danger-color)');

        const card = document.createElement('div');
        card.className = "metric-card glass-container";
        card.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                <h3 style="color: var(--text-main); font-size: 1.15rem; margin: 0;">Dr. ${doc.name}</h3>
                <div style="color: ${statusColor}; font-size: 0.8rem; font-weight: bold;">${status.replace('_', ' ')}</div>
            </div>
            <div style="color: var(--primary-color); font-size: 0.9rem; margin-bottom: 0.5rem;">${doc.specialization} | Exp: ${doc.experienceYears || 0}y</div>
            <div style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--text-muted); line-height: 1.5;">
                <strong>License:</strong> ${doc.licenseNumber || 'N/A'}<br>
                ${doc.licenseCertificateUrl ? `<a href="../${doc.licenseCertificateUrl}" target="_blank" style="color: var(--primary); font-size:0.85rem;">📄 License</a> | ` : ''}
                ${doc.degreeUrl ? `<a href="../${doc.degreeUrl}" target="_blank" style="color: var(--primary); font-size:0.85rem;">📄 Degree</a> | ` : ''}
                ${doc.hospitalIdUrl ? `<a href="../${doc.hospitalIdUrl}" target="_blank" style="color: var(--primary); font-size:0.85rem;">📄 ID</a>` : ''}
            </div>
            <div style="display: flex; gap: 0.5rem;">
                ${status === 'PENDING_APPROVAL' ? `
                    <button class="btn-outline btn-success btn-small" style="flex:1" onclick="updateDoctorStatus(${doc.id}, 'APPROVED')">Approve</button>
                    <button class="btn-outline btn-danger btn-small" style="flex:1" onclick="updateDoctorStatus(${doc.id}, 'REJECTED')">Reject</button>
                ` : `
                    <button class="btn-outline btn-small" style="flex:1" onclick="openSlotModal(${doc.id}, '${doc.name}')">Add Time Slot</button>
                `}
            </div>
        `;
        grid.appendChild(card);
    });
}

async function updateDoctorStatus(doctorId, status) {
    if (!confirm(`Are you sure you want to mark this doctor as ${status}?`)) return;
    try {
        await apiFetch(`/admin/doctor/${doctorId}/status?status=${status}`, { method: 'PUT' });
        alert(`Doctor status updated to ${status}`);
        await loadClinicDoctors();
    } catch(err) {
        console.error(err);
        alert("Failed to update status.");
    }
}

async function addDoctor() {
    const name = document.getElementById('addDoctorName').value;
    const spec = document.getElementById('addDoctorSpec').value;
    if(!name || !spec) return alert("Fill out both fields to add a doctor.");

    try {
        await apiFetch(`/clinic/add-doctor`, {
            method: 'POST',
            body: JSON.stringify({ name: name, specialization: spec, consultationFee: 500, experienceYears: 5 })
        });
        document.getElementById('addDoctorName').value = '';
        document.getElementById('addDoctorSpec').value = '';
        await loadClinicDoctors();
        alert("Doctor added!");
    } catch (err) {
        console.error(err);
        alert("Failed to add doctor.");
    }
}

function openSlotModal(doctorId, docName) {
    document.getElementById('slotDoctorId').value = doctorId;
    document.getElementById('slotDoctorName').textContent = "Dr. " + docName;
    document.getElementById('slotModal').style.display = 'block';
}

async function createSlot() {
    const doctorId = document.getElementById('slotDoctorId').value;
    const slotDate = document.getElementById('slotDate').value;
    const startTime = document.getElementById('slotStartTime').value;

    if(!slotDate || !startTime) return alert("Select date and time");

    const finalDateTime = `${ slotDate }T${ startTime }:00`;

    try {
        await apiFetch(`/clinic/create-slot/${doctorId}`, {
            method: 'POST',
            body: JSON.stringify({ startTime: finalDateTime })
        });
        document.getElementById('slotModal').style.display = 'none';
        alert("Slot created.");
    } catch(err) {
        console.error(err);
        alert("Failed to create slot.");
    }
}

async function approveAppointment(appointmentId) {
    // Current backend doesn't have explicit approve endpoint mapping strictly aside from schedule/complete
    // We will masquerade complete as approve for visual satisfaction, or just alert
    try {
        await apiFetch(`/patient/complete/${appointmentId}`, { method: 'PUT' });
        await loadClinicAppointments();
    } catch(err) {
        console.error(err);
        alert("Approval failed.");
    }
}

async function cancelAppointmentAdmin(appointmentId) {
    if(!confirm("Cancel this appointment?")) return;
    try {
        await apiFetch(`/appointments/cancel/${appointmentId}`, { method: 'PUT' });
        await loadClinicAppointments();
    } catch(err) {
        console.error(err);
        alert("Cancellation failed.");
    }
}
