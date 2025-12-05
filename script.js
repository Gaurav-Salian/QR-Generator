// ========================================
// Professional QR Code Generator JS
// ========================================

// Element References - Location QR
const qrcodeElement = document.getElementById("qrcode");
const downloadBtn = document.getElementById("downloadBtn");
const successMessage = document.getElementById("successMessage");
const errorMessage = document.getElementById("errorMessage");
const dataInput = document.getElementById("data");
const sizeSelect = document.getElementById("size");

// Element References - Payment QR
const paymentQrcodeElement = document.getElementById("paymentQrcode");
const paymentDownloadBtn = document.getElementById("paymentDownloadBtn");
const paymentSuccessMessage = document.getElementById("paymentSuccessMessage");
const paymentErrorMessage = document.getElementById("paymentErrorMessage");
const upiIdInput = document.getElementById("upiId");
const payeeNameInput = document.getElementById("payeeName");
const amountInput = document.getElementById("amount");
const paymentSizeSelect = document.getElementById("paymentSize");
const transactionNoteInput = document.getElementById("transactionNote");

// QR Code Instances
let qrCode = null;
let paymentQrCode = null;

// Logo Image
const logoImage = new Image();
logoImage.src = './favicon.ico';

logoImage.onload = () => console.log("Logo loaded successfully");
logoImage.onerror = () => console.warn("Logo failed to load");



document.getElementById("currentYear").textContent = new Date().getFullYear();


// Collapse header on scroll (Mobile only)
let lastScrollTop = 0;
const header = document.getElementById("header-content");

window.addEventListener('scroll', function () {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Only apply for mobile screens
    if (window.innerWidth <= 768) {
        if (currentScroll > lastScrollTop) {
            // Scrolling DOWN → Hide Header
            header.classList.add("header-hidden");
        } else {
            // Scrolling UP → Show Header
            header.classList.remove("header-hidden");
        }
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});




// ========================================
// Tab Switching Functionality
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
});

// ========================================
// Validation Functions
// ========================================
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return string.trim().length > 0;
    }
}

function isGoogleMapsLink(url) {
    const mapsPatterns = [
        'maps.google.com',
        'maps.app.goo.gl',
        'goo.gl/maps',
        'google.com/maps'
    ];
    return mapsPatterns.some(pattern => url.toLowerCase().includes(pattern));
}

function isValidUpiId(upiId) {
    const upiPattern = /^[\w.-]+@[\w.-]+$/;
    return upiPattern.test(upiId);
}

// ========================================
// Location QR Code Generation
// ========================================
async function generateQRCode() {
    const data = dataInput.value.trim();
    const size = parseInt(sizeSelect.value);
    const backgroundRatio = 0.90;
    const errorCorrection = "H";

    // Hide previous messages
    successMessage.classList.add("hidden");
    errorMessage.classList.add("hidden");

    // Validation
    if (!data) {
        showError("Please enter a URL or text to generate QR code");
        qrcodeElement.innerHTML = '';
        downloadBtn.classList.add("hidden");
        return;
    }

    if (!isValidURL(data)) {
        showError("Please enter valid data. For URLs, include https://");
        qrcodeElement.innerHTML = '';
        downloadBtn.classList.add("hidden");
        return;
    }

    try {
        qrcodeElement.innerHTML = '';

        // Create canvas with white background
        const containerCanvas = document.createElement('canvas');
        containerCanvas.width = size;
        containerCanvas.height = size;
        
        const containerCtx = containerCanvas.getContext('2d');
        containerCtx.fillStyle = "#ffffff";
        containerCtx.fillRect(0, 0, size, size);

        // QR Code options
        const options = {
            text: data,
            width: size,
            height: size,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel[errorCorrection]
        };

        // Create QR in temp div
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
        
        qrCode = new QRCode(tempDiv, options);
        
        setTimeout(() => {
            const qrCanvas = tempDiv.querySelector('canvas');
            
            if (qrCanvas) {
                const qrDisplaySize = size * backgroundRatio;
                const offset = (size - qrDisplaySize) / 2;
                
                containerCtx.drawImage(qrCanvas, offset, offset, qrDisplaySize, qrDisplaySize);
                addLogoToQRCode(containerCanvas, containerCtx, qrDisplaySize, offset);
                
                document.body.removeChild(tempDiv);
                
                containerCanvas.style.borderRadius = "8px";
                qrcodeElement.appendChild(containerCanvas);
                
                downloadBtn.classList.remove("hidden");
                
                if (isGoogleMapsLink(data)) {
                    showSuccess("✓ Location QR code generated! Perfect for invitations!");
                } else {
                    showSuccess("✓ QR code generated successfully!");
                }
            } else {
                throw new Error("QR code canvas not found.");
            }
        }, 100);
    } catch (error) {
        showError(`Error: ${error.message || "Failed to generate QR code"}`);
        downloadBtn.classList.add("hidden");
        console.error("QR Generation Error:", error);
    }
}

// ========================================
// Payment QR Code Generation
// ========================================
function generatePaymentQRCode() {
    const upiId = upiIdInput.value.trim();
    const payeeName = payeeNameInput.value.trim();
    const amount = amountInput.value.trim();
    const size = parseInt(paymentSizeSelect.value);
    const transactionNote = transactionNoteInput.value.trim();
    const backgroundRatio = 0.90;
    const errorCorrection = "H";
    
    // Hide messages
    paymentSuccessMessage.classList.add("hidden");
    paymentErrorMessage.classList.add("hidden");
    
    // Validation
    if (!upiId) {
        showPaymentError("Please enter your UPI ID");
        paymentQrcodeElement.innerHTML = '';
        paymentDownloadBtn.classList.add("hidden");
        return;
    }

    if (!isValidUpiId(upiId)) {
        showPaymentError("Please enter a valid UPI ID (e.g., yourname@paytm)");
        paymentQrcodeElement.innerHTML = '';
        paymentDownloadBtn.classList.add("hidden");
        return;
    }

    if (amount && (isNaN(amount) || parseFloat(amount) < 0)) {
        showPaymentError("Please enter a valid amount");
        paymentQrcodeElement.innerHTML = '';
        paymentDownloadBtn.classList.add("hidden");
        return;
    }
    
    // Build UPI URL
    let upiPaymentUrl = `upi://pay?pa=${encodeURIComponent(upiId)}`;

    if (payeeName) upiPaymentUrl += `&pn=${encodeURIComponent(payeeName)}`;
    if (amount) upiPaymentUrl += `&am=${encodeURIComponent(amount)}`;
    if (transactionNote) upiPaymentUrl += `&tn=${encodeURIComponent(transactionNote)}`;
    
    upiPaymentUrl += "&cu=INR";
    
    try {
        paymentQrcodeElement.innerHTML = '';

        const containerCanvas = document.createElement('canvas');
        containerCanvas.width = size;
        containerCanvas.height = size;
        
        const containerCtx = containerCanvas.getContext('2d');
        containerCtx.fillStyle = "#ffffff";
        containerCtx.fillRect(0, 0, size, size);

        const options = {
            text: upiPaymentUrl,
            width: size,
            height: size,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel[errorCorrection]
        };

        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
        
        paymentQrCode = new QRCode(tempDiv, options);
        
        setTimeout(() => {
            const qrCanvas = tempDiv.querySelector('canvas');
            
            if (qrCanvas) {
                const qrDisplaySize = size * backgroundRatio;
                const offset = (size - qrDisplaySize) / 2;
                
                containerCtx.drawImage(qrCanvas, offset, offset, qrDisplaySize, qrDisplaySize);
                addLogoToQRCode(containerCanvas, containerCtx, qrDisplaySize, offset);
                
                document.body.removeChild(tempDiv);
                
                containerCanvas.style.borderRadius = "8px";
                paymentQrcodeElement.appendChild(containerCanvas);
                
                paymentDownloadBtn.classList.remove("hidden");
                
                if (amount) {
                    showPaymentSuccess(`✓ Payment QR generated for ₹${amount}!`);
                } else {
                    showPaymentSuccess("✓ Payment QR generated successfully!");
                }
            } else {
                throw new Error("QR code canvas not found.");
            }
        }, 100);
    } catch (error) {
        showPaymentError(`Error: ${error.message || "Failed to generate Payment QR code"}`);
        paymentDownloadBtn.classList.add("hidden");
        console.error("Payment QR Error:", error);
    }
}

// ========================================
// Add Logo to QR Code
// ========================================
function addLogoToQRCode(canvas, ctx, qrDisplaySize, offset) {
    const logoSize = qrDisplaySize * 0.3;
    const logoX = (canvas.width - logoSize) / 2;
    const logoY = (canvas.height - logoSize) / 2;

    if (logoImage.complete && logoImage.naturalHeight !== 0) {
        ctx.save();
        
        const padding = 8;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(logoX - padding, logoY - padding, logoSize + padding * 2, logoSize + padding * 2);
        
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        ctx.restore();
    }
}

// ========================================
// Download Functions
// ========================================
function downloadQRCode() {
    const canvas = qrcodeElement.querySelector("canvas");
    if (!canvas) {
        showError("No QR code to download. Please generate one first.");
        return;
    }
    
    try {
        const link = document.createElement("a");
        const data = dataInput.value.trim();
        
        let filename = "qrcode";
        if (isGoogleMapsLink(data)) {
            filename = "location_qrcode";
        } else if (data.startsWith("http")) {
            try {
                const url = new URL(data);
                filename = url.hostname.replace(/\./g, '_') + "_qrcode";
            } catch (e) {
                filename = "qrcode";
            }
        }
        
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        showSuccess("✓ QR code downloaded successfully!");
    } catch (error) {
        showError(`Error downloading: ${error.message || "Failed to download"}`);
    }
}

function downloadPaymentQRCode() {
    const canvas = paymentQrcodeElement.querySelector("canvas");
    if (!canvas) {
        showPaymentError("No QR code to download. Please generate one first.");
        return;
    }
    
    try {
        const link = document.createElement("a");
        const payeeName = payeeNameInput.value.trim();
        const upiId = upiIdInput.value.trim();
        
        let filename = "payment_qrcode";
        if (payeeName) {
            filename = payeeName.replace(/\s+/g, '_').toLowerCase() + "_payment_qr";
        } else if (upiId) {
            filename = upiId.split('@')[0] + "_payment_qr";
        }
        
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        showPaymentSuccess("✓ Payment QR code downloaded successfully!");
    } catch (error) {
        showPaymentError(`Error downloading: ${error.message || "Failed to download"}`);
    }
}

// ========================================
// Message Display Functions
// ========================================
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
    setTimeout(() => errorMessage.classList.add("hidden"), 5000);
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.remove("hidden");
    setTimeout(() => successMessage.classList.add("hidden"), 4000);
}

function showPaymentError(message) {
    paymentErrorMessage.textContent = message;
    paymentErrorMessage.classList.remove("hidden");
    setTimeout(() => paymentErrorMessage.classList.add("hidden"), 5000);
}

function showPaymentSuccess(message) {
    paymentSuccessMessage.textContent = message;
    paymentSuccessMessage.classList.remove("hidden");
    setTimeout(() => paymentSuccessMessage.classList.add("hidden"), 4000);
}

// ========================================
// Event Listeners
// ========================================
dataInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        generateQRCode();
    }
});

upiIdInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        generatePaymentQRCode();
    }
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Initialize
window.addEventListener('load', () => {
    console.log("QR Code Generator loaded successfully");
    dataInput.value = "";
});

// Prevent form submission
document.addEventListener('submit', (e) => {
    e.preventDefault();
    return false;
});
