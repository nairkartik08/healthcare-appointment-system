document.addEventListener("DOMContentLoaded", () => {
    // 1. Verify Authentication & Data
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Session expired. Please log in.");
        window.location.href = "login.html";
        return;
    }

    const currentBookingRaw = localStorage.getItem('pendingBooking');
    if(!currentBookingRaw) {
        window.location.href = "patient.html"; // Redirect back if accessed directly without booking
        return;
    }

    const bookingData = JSON.parse(currentBookingRaw);

    // 2. Populate Summary
    document.getElementById('sumDoctorName').textContent = "Dr. " + (bookingData.doctorName || "Unknown");
    document.getElementById('sumPatientName').textContent = bookingData.patientName;
    document.getElementById('sumDate').textContent = bookingData.slotDate || "-";
    document.getElementById('sumTime').textContent = bookingData.slotTime || "-";
    document.getElementById('sumTotal').textContent = "₹ " + (bookingData.fee || 500);
});

let selectedPaymentMode = null;
let isProcessing = false;

// Handle UI selection for payment modes
function selectMethod(method) {
    selectedPaymentMode = method;

    // Reset UI
    document.querySelectorAll('.payment-option-label').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.payment-details-box').forEach(el => el.classList.remove('active'));

    // Set Active UI
    const targetLabel = document.getElementById(method === 'CARD' ? 'labelCard' : method === 'UPI' ? 'labelUpi' : 'labelClinic');
    const targetBox = document.getElementById(method === 'CARD' ? 'detailsCard' : method === 'UPI' ? 'detailsUpi' : 'detailsClinic');
    
    if(targetLabel) targetLabel.classList.add('active');
    if(targetBox) targetBox.classList.add('active');
    
    // Check hidden radio
    const selectedRadio = targetLabel.querySelector('input[type="radio"]');
    if(selectedRadio) selectedRadio.checked = true;
}

// Ensure default selection mapping (UPI)
selectMethod('CARD'); // default to card for visual impact

async function processPayment() {
    if(isProcessing) return;
    if(!selectedPaymentMode) return alert("Please select a payment method.");

    // Basic frontend validation for fields depending on method
    if(selectedPaymentMode === 'CARD') {
        const cNum = document.getElementById('cardNumber').value.trim();
        const cExp = document.getElementById('cardExpiry').value.trim();
        const cCvv = document.getElementById('cardCvv').value.trim();
        if(!cNum || !cExp || !cCvv) {
             return alert("Please fill out complete card details.");
        }
    } else if(selectedPaymentMode === 'UPI') {
        const uId = document.getElementById('upiId').value.trim();
        if(!uId) return alert("Please enter a valid UPI ID.");
    }

    // 1. Show processing overlay & lock UI
    isProcessing = true;
    const loader = document.getElementById('fullScreenLoader');
    loader.style.display = "flex";

    // Allow UI to update
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Execute Backend API call
    try {
        const bookingData = JSON.parse(localStorage.getItem('pendingBooking'));
        const { patientId, doctorId, slotId, patientName, patientAge, patientMobile } = bookingData;
        
        const url = `/patient/book?patientId=${patientId}&doctorId=${doctorId}&slotId=${slotId}&name=${encodeURIComponent(patientName)}&age=${patientAge || ''}&mobileNo=${encodeURIComponent(patientMobile)}&paymentMode=${selectedPaymentMode}`;
        
        await apiFetch(url, { method: 'POST' });
        
        // 3. Cleanup & Success feedback
        localStorage.removeItem('pendingBooking');
        alert(`Payment Successful (${selectedPaymentMode})! Your appointment is confirmed.`);
        window.location.href = "patient.html";
    } catch (err) {
        console.error("Payment API Error:", err);
        loader.style.display = "none";
        isProcessing = false;
        alert(`Payment failed. Error: ${err.message}. Please refresh the dashboard and try again.`);
    }
}
