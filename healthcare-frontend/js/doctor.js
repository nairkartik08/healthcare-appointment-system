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
    if(target) {
        target.classList.add('active');
        if (sectionId === 'campaign') {
            loadCampaignHistory();
        }
        if (sectionId === 'reviews') {
            loadDoctorReviews();
        }
    }
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

        // Render analytics charts
        renderAnalytics();

    } catch (err) {
        console.error("Failed to load appointments:", err);
    }
}

// --- Interactions & Rendering ---
function renderAppointments() {
    const tbody = document.querySelector("#appointmentsTable tbody");
    tbody.innerHTML = '';

    if (!appState.appointments || appState.appointments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📅</div>
                    <h3 style="color: var(--text-main); margin-bottom: 0.5rem;">No Appointments Yet</h3>
                    <p class="text-muted">You have no scheduled appointments at the moment.</p>
                </td>
            </tr>
        `;
        return;
    }

    appState.appointments.forEach(app => {
        const tr = document.createElement('tr');
        
        let statusBadge = app.status;
        if(app.status === 'BOOKED') statusBadge = `<span style="color: var(--primary-color)">BOOKED</span>`;
        if(app.status === 'CANCELLED') statusBadge = `<span style="color: var(--danger-color)">CANCELLED</span>`;
        if(app.status === 'COMPLETED') statusBadge = `<span style="color: var(--success-color)">COMPLETED</span>`;
        if(app.status === 'EXPIRED') statusBadge = `<span style="color: #64748b; font-weight: bold;">EXPIRED</span>`;
        if(app.status === 'EXPIRED_REFUNDED') statusBadge = `<span style="color: #38bdf8; font-weight: bold;">REFUNDED</span>`;

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
                ${app.status === 'BOOKED' ? `<button class="btn-outline btn-success btn-small" onclick="openCompletionModal(${app.id})">Complete</button>
                                          <button class="btn-outline btn-danger btn-small" onclick="cancelAppointmentAdmin(${app.id})">Cancel</button>` : '-'}
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
        listDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.7;">👥</div>
                <div style="color: var(--text-main); font-weight: 500;">No Patients Available</div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.3rem;">Complete an appointment to add patients to your campaign list.</div>
            </div>
        `;
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

        // Refresh History
        loadCampaignHistory();

    } catch (err) {
        console.error(err);
        alert("Failed to create campaign.");
    }
}

async function loadCampaignHistory() {
    const listDiv = document.getElementById('campaignHistoryList');
    if (!listDiv) return;

    if (!currentUser.doctorId) return;

    try {
        const history = await apiFetch(`/doctor/campaign/history/${currentUser.doctorId}`);
        listDiv.innerHTML = '';
        
        if (!history || history.length === 0) {
            listDiv.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px dashed var(--glass-border);">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.7;">📢</div>
                    <div style="color: var(--text-main); font-weight: 500;">No Campaign History</div>
                    <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.3rem;">Once you send a campaign, it will appear here.</div>
                </div>
            `;
            return;
        }

        history.forEach(camp => {
            const div = document.createElement('div');
            div.style.cssText = "background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--primary-color);";
            
            const printDate = camp.createdAt ? new Date(camp.createdAt).toLocaleString() : 'Just now';
            
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem;">
                    <strong style="color: white; font-size: 1.1rem;">${camp.campaignName}</strong>
                    <span style="color: var(--text-muted); font-size: 0.85rem;">${printDate}</span>
                </div>
                <div style="color: var(--accent-color); font-weight: 500; margin-bottom: 0.5rem; font-size: 0.95rem;">Subject: ${camp.notificationTitle}</div>
                <div style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5;">${camp.message}</div>
            `;
            listDiv.appendChild(div);
        });

    } catch (err) {
        console.error("Failed to load campaign history:", err);
        listDiv.innerHTML = '<div class="text-muted error-msg" style="padding: 1rem;">Failed to load history</div>';
    }
}

// --- Reviews Logic ---
async function loadDoctorReviews() {
    const listDiv = document.getElementById('doctorReviewsList');
    if (!listDiv) return;
    
    if (!currentUser.doctorId) return;

    try {
        const reviews = await apiFetch(`/reviews/doctor/${currentUser.doctorId}`);
        listDiv.innerHTML = '';
        
        if (!reviews || reviews.length === 0) {
            listDiv.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px dashed var(--glass-border);">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.7;">⭐</div>
                    <div style="color: var(--text-main); font-weight: 500;">No Reviews Yet</div>
                    <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.3rem;">Patients haven't left any reviews for you yet.</div>
                </div>
            `;
            return;
        }

        reviews.forEach(rev => {
            const div = document.createElement('div');
            div.style.cssText = "background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--glass-border);";
            
            const printDate = rev.createdAt ? new Date(rev.createdAt).toLocaleString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'Just now';
            const renderStars = (rating) => {
                let stars = '';
                for(let i=0; i<5; i++) {
                    stars += i < rating ? '⭐' : '<span style="opacity:0.3">⭐</span>';
                }
                return stars;
            }
            
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem;">
                    <strong style="color: white; font-size: 1.1rem;">${rev.patientName}</strong>
                    <span style="color: var(--text-muted); font-size: 0.85rem;">${printDate}</span>
                </div>
                <div style="margin-bottom: 0.8rem; font-size: 0.9rem;">${renderStars(rev.rating)}</div>
                <div style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; font-style: italic;">"${rev.comment}"</div>
            `;
            listDiv.appendChild(div);
        });

    } catch (err) {
        console.error("Failed to load reviews:", err);
        listDiv.innerHTML = '<div class="text-muted error-msg" style="padding: 1rem;">Failed to load reviews</div>';
    }
}

// --- Analytics rendered by Chart.js ---
let revenueChartInstance = null;
let statusChartInstance = null;

function renderAnalytics() {
    if (!window.Chart) return; // Prevent errors if CDN fails

    const last7Days = [];
    const revenueData = [];
    
    // Generate dates
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        revenueData.push(0); 
    }

    // Process Revenue
    appState.appointments.forEach(a => {
        if (!a.slot || !a.slot.startTime) return;
        const appDate = new Date(a.slot.startTime);
        const dateStr = appDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const dayIdx = last7Days.indexOf(dateStr);
        if (dayIdx !== -1) {
            const mode = (a.paymentMode || '').toUpperCase();
            if (a.status === 'COMPLETED' || mode === 'CARD' || mode === 'UPI') {
                revenueData[dayIdx] += (a.doctor ? a.doctor.consultationFee : 0);
            }
        }
    });

    // Process Status
    let booked = 0, completed = 0, cancelled = 0;
    appState.appointments.forEach(a => {
        if (a.status === 'BOOKED') booked++;
        if (a.status === 'COMPLETED') completed++;
        if (a.status === 'CANCELLED' || (a.status && a.status.startsWith('EXPIRED'))) cancelled++;
    });

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Outfit', sans-serif";

    // Chart 1: Revenue Trend
    const revCtx = document.getElementById('revenueTrendChart');
    if (revCtx) {
        if (revenueChartInstance) revenueChartInstance.destroy();
        
        // Add a nice gradient fallback
        let ctx = revCtx.getContext("2d");
        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
        gradient.addColorStop(1, 'rgba(14, 165, 233, 0.0)');

        revenueChartInstance = new Chart(revCtx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Earnings (₹)',
                    data: revenueData,
                    borderColor: '#0ea5e9',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointBackgroundColor: '#0f172a',
                    pointBorderColor: '#38bdf8',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false }
                    }
                }
            }
        });
    }

    // Chart 2: Status Breakdown
    const statsCtx = document.getElementById('statusChart');
    if (statsCtx) {
        if (statusChartInstance) statusChartInstance.destroy();
        
        statusChartInstance = new Chart(statsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Booked', 'Completed', 'Cancelled'],
                datasets: [{
                    data: [booked, completed, cancelled],
                    backgroundColor: ['#0ea5e9', '#10b981', '#ef4444'],
                    borderColor: '#0f172a',
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#f8fafc', padding: 20, usePointStyle: true }
                    }
                }
            }
        });
    }
}

