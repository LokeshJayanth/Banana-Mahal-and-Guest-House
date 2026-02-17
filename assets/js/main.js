// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
  
  // Close mobile menu when clicking on a link
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
}

// Swiper - Testimonials
new Swiper(".testimonialSwiper", {
  loop: true,
  autoplay: {
    delay: 4000
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});

// GSAP Animations
gsap.from(".hero-title", {
  y: -50,
  opacity: 0,
  duration: 1.2
});

gsap.from(".section-title", {
  y: 40,
  opacity: 0,
  duration: 1,
  stagger: 0.3
});

// Scroll Progress
window.onscroll = function() {
  let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  let scrolled = (winScroll / height) * 100;
  document.getElementById("progress-bar").style.width = scrolled + "%";
};

// Modal
function openModal(){
  document.getElementById("bookingModal").style.display = "flex";
}

function closeModal(){
  document.getElementById("bookingModal").style.display = "none";
}


// Dark Mode Toggle
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
}

// Load Dark Mode Preference
if (localStorage.getItem('darkMode') === 'true') {
  document.documentElement.classList.add('dark');
}

// Animated Counter
const counters = document.querySelectorAll('.counter');
let counterAnimated = false;

const animateCounters = () => {
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const increment = target / 100;
    
    const updateCounter = () => {
      const current = +counter.innerText;
      if (current < target) {
        counter.innerText = Math.ceil(current + increment);
        setTimeout(updateCounter, 20);
      } else {
        counter.innerText = target + '+';
      }
    };
    updateCounter();
  });
};

// Trigger counter on scroll
window.addEventListener('scroll', () => {
  if (!counterAnimated) {
    const counterSection = document.querySelector('.counter');
    if (counterSection) {
      const rect = counterSection.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        animateCounters();
        counterAnimated = true;
      }
    }
  }
});

// Check Availability
function checkAvailability() {
  const dateInput = document.getElementById('eventDate');
  const result = document.getElementById('availabilityResult');
  
  if (!dateInput.value) {
    result.innerHTML = '<p class="error-message">Please select a date</p>';
    return;
  }
  
  const selectedDate = new Date(dateInput.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    result.innerHTML = '<p class="error-message">Please select a future date</p>';
    return;
  }
  
  // Simulate availability check (in real app, check against database)
  const bookedDates = ['2026-03-15', '2026-03-20', '2026-04-10'];
  const dateStr = dateInput.value;
  
  if (bookedDates.includes(dateStr)) {
    result.innerHTML = '<p class="error-message">❌ Sorry, this date is already booked</p>';
  } else {
    result.innerHTML = '<p class="success-message">✅ Great! This date is available. Click "Book Now" to proceed.</p>';
  }
}

// Set minimum date for calendar
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach(input => {
    input.setAttribute('min', today);
  });
});

// Contact Form Submission - WhatsApp Smart Contact
function submitContact(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const message = document.getElementById('message').value;
  const messageDiv = document.getElementById('formMessage');
  
  // Basic validation
  if (!name || !email || !phone || !message) {
    messageDiv.innerHTML = '<p class="error-message">Please fill all fields</p>';
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    messageDiv.innerHTML = '<p class="error-message">Please enter a valid email</p>';
    return;
  }
  
  // Phone validation (Indian format)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
    messageDiv.innerHTML = '<p class="error-message">Please enter a valid 10-digit phone number</p>';
    return;
  }
  
  // Format WhatsApp message
  let whatsappText = `📧 *New Contact Message*\n\n`;
  whatsappText += `👤 *NAME:* ${name}\n`;
  whatsappText += `📧 *EMAIL:* ${email}\n`;
  whatsappText += `📱 *PHONE:* ${phone}\n`;
  whatsappText += `💬 *MESSAGE:* ${message}\n`;
  whatsappText += `\n_Sent from Banana Mahal Website_`;
  
  // Owner's WhatsApp number
  const ownerNumber = "919384376599";
  
  // Show success message
  messageDiv.innerHTML = '<p class="success-message">✅ Opening WhatsApp... Please send the message!</p>';
  document.getElementById('contactForm').reset();
  
  // Open WhatsApp with pre-filled message
  setTimeout(() => {
    window.open(
      `https://wa.me/${ownerNumber}?text=${encodeURIComponent(whatsappText)}`,
      '_blank'
    );
  }, 1000);
}

// ===============================
// ADVANCED BOOKING SYSTEM - FINAL PRODUCTION VERSION
// Matches Google Sheet: S.No | Resource | EventType | StartDate | EndDate | Slot | Name | Phone | Guests | Message | Status
// ===============================

// 🔧 CONFIGURATION - REPLACE WITH YOUR WEB APP URL
const BOOKING_API_URL = "https://script.google.com/macros/s/AKfycbxZJ-MTVLg9piRn1bjdfkFVvxH3L_70wzFsQx44XetUs-uv-lrcN7Qk13gahA3tkfEJ/exec";
const OWNER_WHATSAPP = "919384376599";

// Store bookings data (only CONFIRMED and BLOCKED)
let blockedBookings = [];

// Event type options based on resource
const eventTypeOptions = {
  "Function Hall": [
    "Marriage",
    "Reception",
    "Engagement",
    "Showering",
    "Birthday Party",
    "Meeting",
    "Conference",
    "Corporate Event",
    "Anniversary",
    "Other"
  ],
  "Guest House": [
    "Stay",
    "Family Stay",
    "Guest Accommodation"
  ]
};

// Update event type dropdown based on resource
function updateEventTypeOptions() {
  const resource = document.getElementById('bookingType').value;
  const eventTypeSelect = document.getElementById('bookingPurpose');
  const endDateInput = document.getElementById('checkOutDate');
  const timeSlotSelect = document.getElementById('timeSlot');
  
  // Clear existing options
  eventTypeSelect.innerHTML = '<option value="">Select Event Type</option>';
  
  if (resource) {
    const options = eventTypeOptions[resource] || [];
    options.forEach(eventType => {
      const option = document.createElement('option');
      option.value = eventType;
      option.textContent = eventType;
      eventTypeSelect.appendChild(option);
    });
    
    // Show/hide end date for guest house
    if (resource === "Guest House") {
      endDateInput.style.display = 'block';
      endDateInput.required = true;
      endDateInput.placeholder = 'Check-out Date';
      timeSlotSelect.style.display = 'none';
      timeSlotSelect.required = false;
      timeSlotSelect.value = 'FULL_DAY'; // Default for guest house
    } else {
      endDateInput.style.display = 'none';
      endDateInput.required = false;
      timeSlotSelect.style.display = 'block';
      timeSlotSelect.required = true;
    }
  }
}

// Load bookings on page load - FINAL VERSION
async function loadBookings() {
  if (BOOKING_API_URL === "YOUR_GOOGLE_SCRIPT_URL_HERE") {
    console.warn("⚠️ Please configure BOOKING_API_URL in main.js");
    return;
  }
  
  try {
    console.log('📥 Loading blocked bookings from:', BOOKING_API_URL);
    const response = await fetch(BOOKING_API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    blockedBookings = await response.json();
    console.log("✅ Blocked bookings loaded:", blockedBookings.length);
    console.log("Bookings:", blockedBookings);
  } catch (error) {
    console.warn("⚠️ Could not load bookings:", error.message);
    blockedBookings = [];
  }
}

// Helper: Generate date range array
function dateRange(start, end) {
  const arr = [];
  let d = new Date(start);
  const endDate = new Date(end);
  
  while (d <= endDate) {
    arr.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  
  return arr;
}

// Helper: Check if date ranges overlap
function isOverlapping(start1, end1, start2, end2) {
  return new Date(start1) <= new Date(end2) && new Date(start2) <= new Date(end1);
}

// Advanced availability check - ENHANCED WITH DEBUGGING
function checkAdvancedAvailability() {
  const resource = document.getElementById('bookingType').value;
  const startDate = document.getElementById('bookingDate').value;
  const endDate = document.getElementById('checkOutDate').value;
  const slot = document.getElementById('timeSlot').value;
  const checkDiv = document.getElementById('availabilityCheck');
  
  if (!resource || !startDate) {
    checkDiv.innerHTML = '';
    return;
  }
  
  console.log('🔍 Checking availability for:', resource, startDate);
  console.log('📋 Total blocked bookings:', blockedBookings.length);
  console.log('📋 Blocked bookings data:', blockedBookings);
  
  // Check if date is in the past
  const selectedDate = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    checkDiv.innerHTML = '<p class="error-message">❌ Please select a future date</p>';
    document.getElementById('bookingSubmitBtn').disabled = true;
    return;
  }
  
  // ============================================
  // GUEST HOUSE: Date Range Overlap Check
  // ============================================
  if (resource === "Guest House") {
    if (!endDate) {
      checkDiv.innerHTML = '<p class="text-yellow-600">⚠️ Please select check-out date</p>';
      document.getElementById('bookingSubmitBtn').disabled = false;
      return;
    }
    
    const checkInDate = new Date(startDate);
    const checkOutDate = new Date(endDate);
    
    if (checkOutDate <= checkInDate) {
      checkDiv.innerHTML = '<p class="error-message">❌ Check-out must be after check-in</p>';
      document.getElementById('bookingSubmitBtn').disabled = true;
      return;
    }
    
    // Check for overlapping guest house bookings
    const overlap = blockedBookings.some(booking => {
      if (booking.resource !== "Guest House") return false;
      console.log('Checking overlap with:', booking);
      return isOverlapping(startDate, endDate, booking.start, booking.end);
    });
    
    if (overlap) {
      checkDiv.innerHTML = '<p class="error-message">❌ Guest house not available for these dates</p>';
      document.getElementById('bookingSubmitBtn').disabled = true;
    } else {
      checkDiv.innerHTML = '<p class="success-message">✅ Guest house available!</p>';
      document.getElementById('bookingSubmitBtn').disabled = false;
    }
    return;
  }
  
  // ============================================
  // FUNCTION HALL: Same Date Check (ENHANCED)
  // ============================================
  if (!slot) {
    checkDiv.innerHTML = '';
    return;
  }
  
  console.log('🔍 Checking Function Hall for date:', startDate);
  console.log('🔍 Input type:', typeof startDate);
  console.log('🔍 Input value length:', startDate.length);
  
  // Filter Function Hall bookings first
  const functionHallBookings = blockedBookings.filter(b => b.resource === "Function Hall");
  console.log('🏛️ Function Hall bookings:', functionHallBookings.length);
  
  // Direct string comparison (input already gives yyyy-mm-dd)
  const isBlocked = blockedBookings.some(booking => {
    if (booking.resource !== "Function Hall") return false;
    
    console.log('📊 Comparing:');
    console.log('  Input date:', startDate, '(type:', typeof startDate, ')');
    console.log('  Booking date:', booking.start, '(type:', typeof booking.start, ')');
    console.log('  Exact match?', booking.start === startDate);
    console.log('  Trimmed match?', booking.start.trim() === startDate.trim());
    
    // Try both exact and trimmed comparison
    return booking.start === startDate || booking.start.trim() === startDate.trim();
  });
  
  console.log('❓ Is blocked?', isBlocked);
  
  if (isBlocked) {
    checkDiv.innerHTML = '<p class="error-message">❌ This date is already booked</p>';
    document.getElementById('bookingSubmitBtn').disabled = true;
    return;
  }
  
  // Date is available
  checkDiv.innerHTML = '<p class="success-message">✅ Date is available!</p>';
  document.getElementById('bookingSubmitBtn').disabled = false;
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Page loaded, initializing booking system...');
  
  loadBookings().then(() => {
    console.log('✅ Bookings loaded, system ready');
  });
  
  const typeInput = document.getElementById('bookingType');
  const dateInput = document.getElementById('bookingDate');
  const checkOutInput = document.getElementById('checkOutDate');
  const slotInput = document.getElementById('timeSlot');
  
  if (typeInput) {
    typeInput.addEventListener('change', () => {
      console.log('📝 Resource changed to:', typeInput.value);
      updateEventTypeOptions();
      checkAdvancedAvailability();
    });
    console.log('✅ Event listener attached to bookingType');
  } else {
    console.warn('⚠️ bookingType input not found');
  }
  
  if (dateInput) {
    dateInput.addEventListener('change', () => {
      console.log('📅 Date changed to:', dateInput.value);
      checkAdvancedAvailability();
    });
    console.log('✅ Event listener attached to bookingDate');
  } else {
    console.warn('⚠️ bookingDate input not found');
  }
  
  if (checkOutInput) {
    checkOutInput.addEventListener('change', () => {
      console.log('📅 Check-out date changed to:', checkOutInput.value);
      checkAdvancedAvailability();
    });
    console.log('✅ Event listener attached to checkOutDate');
  } else {
    console.warn('⚠️ checkOutDate input not found');
  }
  
  if (slotInput) {
    slotInput.addEventListener('change', () => {
      console.log('⏰ Slot changed to:', slotInput.value);
      checkAdvancedAvailability();
    });
    console.log('✅ Event listener attached to timeSlot');
  } else {
    console.warn('⚠️ timeSlot input not found');
  }
});

// Manual test function - call from console
window.testAvailability = function(testDate) {
  console.log('🧪 MANUAL TEST');
  console.log('Testing date:', testDate);
  console.log('Blocked bookings:', blockedBookings);
  
  const matches = blockedBookings.filter(b => {
    console.log('Checking:', b.start, '===', testDate, '?', b.start === testDate);
    return b.start === testDate;
  });
  
  console.log('Matches found:', matches.length);
  console.log('Matches:', matches);
  
  return matches;
};

// Advanced booking submission - FINAL VERSION
async function submitAdvancedBooking(event) {
  event.preventDefault();
  
  const resource = document.getElementById('bookingType').value;
  const eventType = document.getElementById('bookingPurpose').value;
  const startDate = document.getElementById('bookingDate').value;
  const endDate = document.getElementById('checkOutDate').value;
  const slot = document.getElementById('timeSlot').value || 'FULL_DAY';
  const name = document.getElementById('bookingName').value;
  const phone = document.getElementById('bookingPhone').value;
  const guests = document.getElementById('guestCount').value;
  const message = document.getElementById('bookingMessage').value;
  const statusDiv = document.getElementById('bookingStatus');
  
  // Validation
  if (!resource || !eventType || !startDate || !name || !phone || !guests) {
    statusDiv.innerHTML = '<p class="error-message">Please fill all required fields</p>';
    return;
  }
  
  // Phone validation
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
    statusDiv.innerHTML = '<p class="error-message">Please enter a valid 10-digit phone number</p>';
    return;
  }
  
  // Guest house validation
  if (resource === "Guest House" && !endDate) {
    statusDiv.innerHTML = '<p class="error-message">Please select check-out date</p>';
    return;
  }
  
  // Check if API is configured
  if (BOOKING_API_URL === "YOUR_GOOGLE_SCRIPT_URL_HERE") {
    submitWhatsAppBooking(resource, eventType, startDate, endDate, slot, name, phone, guests, message);
    return;
  }
  
  // Show loading
  statusDiv.innerHTML = '<p class="text-blue-600">⏳ Submitting booking request...</p>';
  document.getElementById('bookingSubmitBtn').disabled = true;
  
  // Prepare booking data matching Google Sheet structure
  const bookingData = {
    resource: resource,
    eventType: eventType,
    startDate: startDate,
    endDate: endDate || startDate,
    slot: slot,
    name: name,
    phone: phone,
    guests: guests,
    message: message
  };
  
  try {
    console.log('📤 Submitting booking data:', bookingData);
    
    // Submit to Google Sheets with proper headers
    const response = await fetch(BOOKING_API_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });
    
    console.log('📥 Response status:', response.status, response.statusText);
    
    // With no-cors mode, we can't read the response, so assume success if no error thrown
    statusDiv.innerHTML = '<p class="success-message">✅ Booking request submitted successfully! We will confirm within 24 hours.</p>';
    sendAdvancedWhatsAppNotification(bookingData);
    
    // Reload bookings to update availability
    setTimeout(() => loadBookings(), 1000);
    
    setTimeout(() => {
      document.getElementById('bookingForm').reset();
      document.getElementById('availabilityCheck').innerHTML = '';
      closeModal();
    }, 3000);
    
  } catch (error) {
    console.error('❌ Booking error:', error);
    statusDiv.innerHTML = '<p class="error-message">❌ Error submitting booking. Please try again or contact us directly.</p>';
  } finally {
    document.getElementById('bookingSubmitBtn').disabled = false;
  }
}

// Send advanced WhatsApp notification - CORRECTED VERSION
function sendAdvancedWhatsAppNotification(booking) {
  let whatsappText = `📢 *NEW BOOKING REQUEST*\n\n`;
  whatsappText += `🏛️ *RESOURCE:* ${booking.resource}\n`;
  whatsappText += `🎯 *EVENT TYPE:* ${booking.eventType}\n`;
  whatsappText += `📅 *START DATE:* ${booking.startDate}\n`;
  
  if (booking.endDate && booking.endDate !== booking.startDate) {
    whatsappText += `📅 *END DATE:* ${booking.endDate}\n`;
  }
  
  if (booking.slot && booking.resource === "Function Hall") {
    whatsappText += `⏰ *TIME SLOT:* ${booking.slot.replace('_', ' ')}\n`;
  }
  
  whatsappText += `👤 *NAME:* ${booking.name}\n`;
  whatsappText += `📱 *PHONE:* ${booking.phone}\n`;
  whatsappText += `👥 *GUESTS:* ${booking.guests}\n`;
  
  if (booking.message) {
    whatsappText += `💬 *MESSAGE:* ${booking.message}\n`;
  }
  
  whatsappText += `\n⚠️ *STATUS:* PENDING\n`;
  whatsappText += `📋 *ACTION:* Review in Google Sheet\n`;
  whatsappText += `\n_Sent from Banana Mahal Website_`;
  
  setTimeout(() => {
    window.open(
      `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(whatsappText)}`,
      '_blank'
    );
  }, 1000);
}

// Fallback WhatsApp booking
function submitWhatsAppBooking(type, purpose, date, checkOut, slot, name, phone, guests, message) {
  const statusDiv = document.getElementById('bookingStatus');
  
  let whatsappText = `📢 *BOOKING REQUEST*\n\n`;
  whatsappText += `🏛️ *TYPE:* ${type}\n`;
  whatsappText += `🎯 *PURPOSE:* ${purpose}\n`;
  whatsappText += `📅 *DATE:* ${date}\n`;
  
  if (checkOut) {
    whatsappText += `📅 *CHECK-OUT:* ${checkOut}\n`;
  }
  
  if (slot && type === "Function Hall") {
    whatsappText += `⏰ *TIME SLOT:* ${slot.replace('_', ' ')}\n`;
  }
  
  whatsappText += `👤 *NAME:* ${name}\n`;
  whatsappText += `📱 *PHONE:* ${phone}\n`;
  whatsappText += `👥 *GUESTS:* ${guests}\n`;
  
  if (message) {
    whatsappText += `💬 *MESSAGE:* ${message}\n`;
  }
  
  whatsappText += `\n_Sent from Banana Mahal Website_`;
  
  statusDiv.innerHTML = '<p class="success-message">✅ Opening WhatsApp... Please send the message!</p>';
  
  setTimeout(() => {
    window.open(
      `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(whatsappText)}`,
      '_blank'
    );
    
    setTimeout(() => {
      document.getElementById('bookingForm').reset();
      document.getElementById('availabilityCheck').innerHTML = '';
      closeModal();
    }, 2000);
  }, 500);
}

// Backward compatibility
function submitPlatformBooking(event) {
  submitAdvancedBooking(event);
}

function submitBooking(event) {
  submitAdvancedBooking(event);
}


// Send advanced WhatsApp notification - FINAL VERSION
function sendAdvancedWhatsAppNotification(booking) {
  let whatsappText = `📢 *NEW BOOKING REQUEST*\n\n`;
  whatsappText += `🏛️ *RESOURCE:* ${booking.resource}\n`;
  whatsappText += `🎯 *EVENT TYPE:* ${booking.eventType}\n`;
  whatsappText += `📅 *START DATE:* ${booking.startDate}\n`;
  
  if (booking.endDate && booking.endDate !== booking.startDate) {
    whatsappText += `📅 *END DATE:* ${booking.endDate}\n`;
  }
  
  if (booking.slot && booking.resource === "Function Hall") {
    whatsappText += `⏰ *TIME SLOT:* ${booking.slot.replace('_', ' ')}\n`;
  }
  
  whatsappText += `👤 *NAME:* ${booking.name}\n`;
  whatsappText += `📱 *PHONE:* ${booking.phone}\n`;
  whatsappText += `👥 *GUESTS:* ${booking.guests}\n`;
  
  if (booking.message) {
    whatsappText += `💬 *MESSAGE:* ${booking.message}\n`;
  }
  
  whatsappText += `\n⚠️ *STATUS:* PENDING\n`;
  whatsappText += `📋 *ACTION:* Review in Google Sheet\n`;
  whatsappText += `\n_Sent from Banana Mahal Website_`;
  
  setTimeout(() => {
    window.open(
      `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(whatsappText)}`,
      '_blank'
    );
  }, 1000);
}

// Fallback WhatsApp booking - FINAL VERSION
function submitWhatsAppBooking(resource, eventType, startDate, endDate, slot, name, phone, guests, message) {
  const statusDiv = document.getElementById('bookingStatus');
  
  let whatsappText = `📢 *BOOKING REQUEST*\n\n`;
  whatsappText += `🏛️ *RESOURCE:* ${resource}\n`;
  whatsappText += `🎯 *EVENT TYPE:* ${eventType}\n`;
  whatsappText += `📅 *START DATE:* ${startDate}\n`;
  
  if (endDate && endDate !== startDate) {
    whatsappText += `📅 *END DATE:* ${endDate}\n`;
  }
  
  if (slot && resource === "Function Hall") {
    whatsappText += `⏰ *TIME SLOT:* ${slot.replace('_', ' ')}\n`;
  }
  
  whatsappText += `👤 *NAME:* ${name}\n`;
  whatsappText += `📱 *PHONE:* ${phone}\n`;
  whatsappText += `👥 *GUESTS:* ${guests}\n`;
  
  if (message) {
    whatsappText += `💬 *MESSAGE:* ${message}\n`;
  }
  
  whatsappText += `\n_Sent from Banana Mahal Website_`;
  
  statusDiv.innerHTML = '<p class="success-message">✅ Opening WhatsApp... Please send the message!</p>';
  
  setTimeout(() => {
    window.open(
      `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(whatsappText)}`,
      '_blank'
    );
    
    setTimeout(() => {
      document.getElementById('bookingForm').reset();
      document.getElementById('availabilityCheck').innerHTML = '';
      closeModal();
    }, 2000);
  }, 500);
}

