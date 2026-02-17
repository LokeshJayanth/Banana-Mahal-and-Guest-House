// ============================================
// PREMIUM BOOKING PAGE - BANANA MAHAL
// Function Hall & Guest House
// WITH FLATPICKR CALENDAR - DISABLED BOOKED DATES
// ENHANCED SECURITY - XSS PROTECTION
// ============================================

// 🔧 CONFIGURATION
const API_URL = "https://script.google.com/macros/s/AKfycbxZJ-MTVLg9piRn1bjdfkFVvxH3L_70wzFsQx44XetUs-uv-lrcN7Qk13gahA3tkfEJ/exec";
const OWNER_WHATSAPP = "919384376599";

// Store blocked bookings
let blockedBookings = [];

// Flatpickr instances
let startDatePicker = null;
let endDatePicker = null;

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

// ============================================
// SECURITY: INPUT SANITIZATION
// ============================================

// Sanitize text input to prevent XSS attacks
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags and dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .trim()
    .substring(0, 500); // Limit length to prevent buffer overflow
}

// Sanitize phone number - only allow digits
function sanitizePhone(phone) {
  if (typeof phone !== 'string') return '';
  return phone.replace(/\D/g, '').substring(0, 10);
}

// Sanitize number input
function sanitizeNumber(num) {
  const parsed = parseInt(num, 10);
  if (isNaN(parsed) || parsed < 1) return 1;
  if (parsed > 10000) return 10000; // Max guests limit
  return parsed;
}

// Validate date format (yyyy-MM-dd)
function isValidDateFormat(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

// Validate resource type
function isValidResource(resource) {
  return resource === "Function Hall" || resource === "Guest House";
}

// Validate event type
function isValidEventType(resource, eventType) {
  if (!isValidResource(resource)) return false;
  const validTypes = eventTypeOptions[resource] || [];
  return validTypes.includes(eventType);
}

// Validate slot
function isValidSlot(slot) {
  const validSlots = ["FULL_DAY", "MORNING", "AFTERNOON", "EVENING", "NIGHT"];
  return validSlots.includes(slot);
}

// ============================================
// SECURITY: RATE LIMITING
// ============================================
let lastSubmitTime = 0;
const SUBMIT_COOLDOWN = 3000; // 3 seconds between submissions

function canSubmit() {
  const now = Date.now();
  if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
    return false;
  }
  lastSubmitTime = now;
  return true;
}

// DOM Elements
const resourceSelect = document.getElementById('resource');
const eventTypeSelect = document.getElementById('eventType');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const endDateBox = document.getElementById('endDateBox');
const slotSelect = document.getElementById('slot');
const slotBox = document.getElementById('slotBox');
const availabilityDiv = document.getElementById('availability');
const submitBtn = document.getElementById('submitBtn');
const bookingForm = document.getElementById('bookingForm');

// ============================================
// HELPER: NORMALIZE DATE TO TIMESTAMP (MIDNIGHT)
// ============================================
function normalizeDate(dateInput) {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      console.warn('⚠️ Invalid date:', dateInput);
      return null;
    }
    
    // Set to midnight to ignore time component
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  } catch (err) {
    console.error('❌ Date normalization error:', err);
    return null;
  }
}

// ============================================
// HELPER: CONVERT DATE TO yyyy-MM-dd STRING
// ============================================
function formatDateString(dateInput) {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return null;
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (err) {
    return null;
  }
}

// ============================================
// LOAD BLOCKED BOOKINGS
// ============================================
async function loadBookings() {
  try {
    console.log('📥 Loading blocked bookings...');
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📦 Raw data received:', data);
    
    // Validate and filter bookings - ENHANCED ERROR HANDLING
    blockedBookings = (Array.isArray(data) ? data : []).filter(booking => {
      // Skip if not an object
      if (!booking || typeof booking !== 'object') {
        console.warn('⚠️ Invalid booking object:', booking);
        return false;
      }
      
      // Check if booking has required fields (use 'startDate' from API response)
      if (!booking.resource || !booking.startDate) {
        console.warn('⚠️ Missing required fields:', booking);
        return false;
      }
      
      // Validate resource type
      if (booking.resource !== 'Function Hall' && booking.resource !== 'Guest House') {
        console.warn('⚠️ Invalid resource type:', booking.resource);
        return false;
      }
      
      // Only block CONFIRMED, BLOCKED, and CANCELLED bookings
      const blockingStatuses = ['CONFIRMED', 'BLOCKED', 'CANCELLED'];
      if (!booking.status || !blockingStatuses.includes(booking.status)) {
        console.log(`ℹ️ Skipping ${booking.status || 'UNKNOWN'} booking:`, booking);
        return false;
      }
      
      // Normalize dates to timestamps for comparison
      const startTimestamp = normalizeDate(booking.startDate);
      const endTimestamp = booking.endDate ? normalizeDate(booking.endDate) : startTimestamp;
      
      if (!startTimestamp) {
        console.warn('⚠️ Invalid start date:', booking.startDate);
        return false;
      }
      
      // Store both timestamp and formatted string
      booking.startTimestamp = startTimestamp;
      booking.endTimestamp = endTimestamp;
      booking.startDateStr = formatDateString(booking.startDate);
      booking.endDateStr = formatDateString(booking.endDate || booking.startDate);
      
      console.log(`✅ Blocking ${booking.resource} from ${booking.startDateStr} to ${booking.endDateStr} (${booking.status})`);
      return true;
    });
    
    console.log('✅ Valid bookings loaded:', blockedBookings.length);
    console.log('📋 Blocked bookings:', blockedBookings);
    
    // Initialize calendar after bookings are loaded
    initCalendar();
  } catch (error) {
    console.warn('⚠️ Could not load bookings:', error.message);
    blockedBookings = [];
    // Initialize calendar even if bookings fail to load
    initCalendar();
  }
}

// ============================================
// HELPER: CHECK DATE OVERLAP (REMOVED - USING TIMESTAMP COMPARISON)
// ============================================

// ============================================
// INITIALIZE FLATPICKR CALENDAR
// ============================================
function initCalendar() {
  console.log('📅 Initializing calendar...');
  
  const resource = resourceSelect.value;
  
  // Destroy existing instances
  if (startDatePicker) {
    try {
      startDatePicker.destroy();
    } catch (e) {
      console.warn('Error destroying start date picker:', e);
    }
  }
  if (endDatePicker) {
    try {
      endDatePicker.destroy();
    } catch (e) {
      console.warn('Error destroying end date picker:', e);
    }
  }
  
  // Check if Flatpickr is loaded
  if (typeof flatpickr === 'undefined') {
    console.error('❌ Flatpickr library not loaded!');
    return;
  }
  
  try {
    // Start Date Picker
    startDatePicker = flatpickr("#startDate", {
      dateFormat: "Y-m-d",
      minDate: "today",
      allowInput: false,
      clickOpens: true,
      disable: [
        function(date) {
          if (!resource) return false;
          
          try {
            const dateTimestamp = normalizeDate(date);
            
            if (!dateTimestamp) return false;
            
            return blockedBookings.some(booking => {
              try {
                if (booking.resource !== resource) return false;
                if (!booking.startTimestamp) return false;
                
                // Function Hall: Block exact date match
                if (resource === "Function Hall") {
                  return booking.startTimestamp === dateTimestamp;
                }
                
                // Guest House: Block if date falls within any booked range
                // A single date overlaps if: date >= bookedStart AND date <= bookedEnd
                if (resource === "Guest House") {
                  return dateTimestamp >= booking.startTimestamp && dateTimestamp <= booking.endTimestamp;
                }
              } catch (err) {
                return false;
              }
              
              return false;
            });
          } catch (err) {
            return false;
          }
        }
      ],
      onChange: function(selectedDates) {
        const dateStr = selectedDates.length > 0 ? formatDateString(selectedDates[0]) : '';
        console.log('📅 Start date selected:', dateStr);
        checkAvailability();
      }
    });
    
    // End Date Picker (for Guest House)
    endDatePicker = flatpickr("#endDate", {
      dateFormat: "Y-m-d",
      minDate: "today",
      allowInput: false,
      clickOpens: true,
      disable: [
        function(date) {
          if (resource !== "Guest House") return false;
          
          try {
            const dateTimestamp = normalizeDate(date);
            
            if (!dateTimestamp) return false;
            
            return blockedBookings.some(booking => {
              try {
                if (booking.resource !== "Guest House") return false;
                if (!booking.startTimestamp) return false;
                
                // Block if date falls within any booked range
                return dateTimestamp >= booking.startTimestamp && dateTimestamp <= booking.endTimestamp;
              } catch (err) {
                return false;
              }
            });
          } catch (err) {
            return false;
          }
        }
      ],
      onChange: function(selectedDates) {
        const dateStr = selectedDates.length > 0 ? formatDateString(selectedDates[0]) : '';
        console.log('📅 End date selected:', dateStr);
        checkAvailability();
      }
    });
    
    console.log('✅ Calendar initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing calendar:', error);
  }
}

// ============================================
// UPDATE EVENT TYPE OPTIONS
// ============================================
function updateEventTypeOptions() {
  const resource = resourceSelect.value;
  
  // Clear existing options
  eventTypeSelect.innerHTML = '<option value="">Select Purpose</option>';
  
  if (resource) {
    const options = eventTypeOptions[resource] || [];
    options.forEach(eventType => {
      const option = document.createElement('option');
      option.value = eventType;
      option.textContent = eventType;
      eventTypeSelect.appendChild(option);
    });
    
    // Show/hide end date and slot based on resource
    if (resource === "Guest House") {
      endDateBox.style.display = 'block';
      endDateInput.required = true;
      slotBox.style.display = 'none';
      slotSelect.required = false;
      slotSelect.value = 'FULL_DAY';
    } else {
      endDateBox.style.display = 'none';
      endDateInput.required = false;
      slotBox.style.display = 'block';
      slotSelect.required = true;
    }
    
    // Reinitialize calendar with new resource
    initCalendar();
  }
  
  checkAvailability();
}

// ============================================
// HELPER FUNCTIONS - DATE COMPARISON
// ============================================

// Check if two date ranges overlap (industry standard formula)
// Formula: (start1 <= end2) AND (start2 <= end1)
// 
// TEST CASES (Guest House):
// Existing booking: 2026-02-17 to 2026-02-19 (CONFIRMED)
// 
// User selects 2026-02-17 to 2026-02-19 → ❌ BLOCKED (exact match)
// User selects 2026-02-17 to 2026-02-18 → ❌ BLOCKED (partial overlap)
// User selects 2026-02-18 to 2026-02-19 → ❌ BLOCKED (partial overlap)
// User selects 2026-02-16 to 2026-02-18 → ❌ BLOCKED (starts before, ends during)
// User selects 2026-02-19 to 2026-02-20 → ❌ BLOCKED (starts during, ends after)
// User selects 2026-02-18 to 2026-02-18 → ❌ BLOCKED (single day within range)
// User selects 2026-02-16 to 2026-02-20 → ❌ BLOCKED (encompasses entire booking)
// 
// User selects 2026-02-20 to 2026-02-22 → ✅ AVAILABLE (after booking)
// User selects 2026-02-15 to 2026-02-16 → ✅ AVAILABLE (before booking)
function isDateRangeOverlap(start1, end1, start2, end2) {
  // Overlap exists if: (start1 <= end2) AND (start2 <= end1)
  return start1 <= end2 && start2 <= end1;
}

// Check if Function Hall is available for a specific date
function isFunctionHallAvailable(selectedDate) {
  const userTimestamp = normalizeDate(selectedDate);
  
  if (!userTimestamp) {
    console.warn('⚠️ Invalid selected date:', selectedDate);
    return false;
  }
  
  const isAvailable = !blockedBookings.some(booking => {
    if (booking.resource !== "Function Hall") return false;
    
    const isBlocked = booking.startTimestamp === userTimestamp;
    
    if (isBlocked) {
      console.log(`❌ Function Hall BLOCKED on ${selectedDate} by booking:`, booking.startDateStr);
    }
    
    return isBlocked;
  });
  
  console.log(`🔍 Function Hall on ${selectedDate}: ${isAvailable ? '✅ AVAILABLE' : '❌ BLOCKED'}`);
  return isAvailable;
}

// Check if Guest House is available for date range (HOTEL-STYLE LOGIC)
// Only ONE Guest House exists, so only ONE booking can exist at a time
// Uses industry-standard date range overlap detection
function isGuestHouseAvailable(startDate, endDate) {
  const userStart = normalizeDate(startDate);
  const userEnd = normalizeDate(endDate || startDate);
  
  if (!userStart || !userEnd) {
    console.warn('⚠️ Invalid date range:', startDate, endDate);
    return false;
  }
  
  // Check if user's date range overlaps with ANY blocked booking
  const isAvailable = !blockedBookings.some(booking => {
    if (booking.resource !== "Guest House") return false;
    
    // Use industry-standard overlap formula: (start1 <= end2) AND (start2 <= end1)
    const hasOverlap = isDateRangeOverlap(
      userStart,
      userEnd,
      booking.startTimestamp,
      booking.endTimestamp
    );
    
    if (hasOverlap) {
      console.log(`❌ Guest House BLOCKED: User range ${startDate} to ${endDate} overlaps with ${booking.startDateStr} to ${booking.endDateStr}`);
      console.log(`   Overlap check: userStart(${userStart}) <= bookedEnd(${booking.endTimestamp}) = ${userStart <= booking.endTimestamp}`);
      console.log(`   Overlap check: bookedStart(${booking.startTimestamp}) <= userEnd(${userEnd}) = ${booking.startTimestamp <= userEnd}`);
    }
    
    return hasOverlap;
  });
  
  console.log(`🔍 Guest House ${startDate} to ${endDate}: ${isAvailable ? '✅ AVAILABLE' : '❌ BLOCKED'}`);
  return isAvailable;
}

// ============================================
// CHECK AVAILABILITY
// ============================================
function checkAvailability() {
  const resource = resourceSelect.value;
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;
  const slot = slotSelect.value;
  
  // Clear availability message if no date selected
  if (!resource || !startDate) {
    availabilityDiv.innerHTML = '';
    availabilityDiv.className = 'status';
    submitBtn.disabled = false;
    return;
  }
  
  console.log('🔍 Checking availability for:', resource, startDate);
  console.log('📋 Total bookings to check:', blockedBookings.length);
  
  // Check if date is in the past
  const selectedDate = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    availabilityDiv.innerHTML = '❌ Please select a future date';
    availabilityDiv.className = 'status error';
    submitBtn.disabled = true;
    return;
  }
  
  let available = false;
  
  // ============================================
  // GUEST HOUSE: Date Range Overlap Check
  // ============================================
  if (resource === "Guest House") {
    if (!endDate) {
      availabilityDiv.innerHTML = '';
      availabilityDiv.className = 'status';
      submitBtn.disabled = false;
      return;
    }
    
    const checkInDate = new Date(startDate);
    const checkOutDate = new Date(endDate);
    
    if (checkOutDate <= checkInDate) {
      availabilityDiv.innerHTML = '❌ Check-out must be after check-in';
      availabilityDiv.className = 'status error';
      submitBtn.disabled = true;
      return;
    }
    
    available = isGuestHouseAvailable(startDate, endDate);
    
    if (!available) {
      availabilityDiv.innerHTML = '❌ Guest house not available for these dates';
      availabilityDiv.className = 'status error';
      submitBtn.disabled = true;
    } else {
      availabilityDiv.innerHTML = '✅ Guest house available!';
      availabilityDiv.className = 'status success';
      submitBtn.disabled = false;
    }
    return;
  }
  
  // ============================================
  // FUNCTION HALL: Same Date Check
  // ============================================
  if (!slot) {
    availabilityDiv.innerHTML = '';
    availabilityDiv.className = 'status';
    submitBtn.disabled = false;
    return;
  }
  
  available = isFunctionHallAvailable(startDate);
  
  if (!available) {
    availabilityDiv.innerHTML = '❌ This date is already booked';
    availabilityDiv.className = 'status error';
    submitBtn.disabled = true;
    return;
  }
  
  // Date is available
  availabilityDiv.innerHTML = '✅ Date is available!';
  availabilityDiv.className = 'status success';
  submitBtn.disabled = false;
}

// ============================================
// SUBMIT BOOKING
// ============================================
async function submitBooking(event) {
  event.preventDefault();
  
  // Rate limiting check
  if (!canSubmit()) {
    availabilityDiv.innerHTML = '⚠️ Please wait a few seconds before submitting again';
    availabilityDiv.className = 'status error';
    return;
  }
  
  // Get and sanitize form values
  const resource = resourceSelect.value;
  const eventType = eventTypeSelect.value;
  const startDate = startDateInput.value;
  const endDate = endDateInput.value || startDate;
  const slot = slotSelect.value || 'FULL_DAY';
  const name = sanitizeInput(document.getElementById('name').value);
  const phone = sanitizePhone(document.getElementById('phone').value);
  const guests = sanitizeNumber(document.getElementById('guests').value);
  const message = sanitizeInput(document.getElementById('message').value);
  
  // Security validations
  if (!isValidResource(resource)) {
    availabilityDiv.innerHTML = '❌ Invalid venue selection';
    availabilityDiv.className = 'status error';
    return;
  }
  
  if (!isValidEventType(resource, eventType)) {
    availabilityDiv.innerHTML = '❌ Invalid event type';
    availabilityDiv.className = 'status error';
    return;
  }
  
  if (!isValidDateFormat(startDate)) {
    availabilityDiv.innerHTML = '❌ Invalid start date format';
    availabilityDiv.className = 'status error';
    return;
  }
  
  if (resource === "Guest House" && !isValidDateFormat(endDate)) {
    availabilityDiv.innerHTML = '❌ Invalid end date format';
    availabilityDiv.className = 'status error';
    return;
  }
  
  if (resource === "Function Hall" && !isValidSlot(slot)) {
    availabilityDiv.innerHTML = '❌ Invalid time slot';
    availabilityDiv.className = 'status error';
    return;
  }
  
  // Basic validation
  if (!name || name.length < 2) {
    availabilityDiv.innerHTML = '❌ Please enter a valid name (minimum 2 characters)';
    availabilityDiv.className = 'status error';
    return;
  }
  
  if (name.length > 100) {
    availabilityDiv.innerHTML = '❌ Name is too long (maximum 100 characters)';
    availabilityDiv.className = 'status error';
    return;
  }
  
  // Phone validation
  if (phone.length !== 10) {
    availabilityDiv.innerHTML = '❌ Please enter a valid 10-digit phone number';
    availabilityDiv.className = 'status error';
    return;
  }
  
  if (!phone.match(/^[6-9]\d{9}$/)) {
    availabilityDiv.innerHTML = '❌ Phone number must start with 6, 7, 8, or 9';
    availabilityDiv.className = 'status error';
    return;
  }
  
  // Guests validation
  if (guests < 1 || guests > 10000) {
    availabilityDiv.innerHTML = '❌ Number of guests must be between 1 and 10,000';
    availabilityDiv.className = 'status error';
    return;
  }
  
  // Message length validation
  if (message.length > 500) {
    availabilityDiv.innerHTML = '❌ Message is too long (maximum 500 characters)';
    availabilityDiv.className = 'status error';
    return;
  }
  
  // Date validation
  const selectedDate = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    availabilityDiv.innerHTML = '❌ Cannot book dates in the past';
    availabilityDiv.className = 'status error';
    return;
  }
  
  // Guest house validation
  if (resource === "Guest House") {
    const checkInDate = new Date(startDate);
    const checkOutDate = new Date(endDate);
    
    if (checkOutDate <= checkInDate) {
      availabilityDiv.innerHTML = '❌ Check-out must be after check-in';
      availabilityDiv.className = 'status error';
      return;
    }
    
    const daysDiff = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      availabilityDiv.innerHTML = '❌ Booking period cannot exceed 1 year';
      availabilityDiv.className = 'status error';
      return;
    }
  }
  
  // Check availability one more time before submitting
  let available = false;
  if (resource === "Function Hall") {
    available = isFunctionHallAvailable(startDate);
  } else {
    available = isGuestHouseAvailable(startDate, endDate);
  }
  
  if (!available) {
    availabilityDiv.innerHTML = '❌ Selected dates are no longer available. Please refresh and try again.';
    availabilityDiv.className = 'status error';
    return;
  }
  
  // Show loading
  availabilityDiv.innerHTML = '⏳ Submitting booking request...';
  availabilityDiv.className = 'status info';
  submitBtn.disabled = true;
  
  // Prepare booking data (sanitized)
  const bookingData = {
    resource: resource,
    eventType: eventType,
    startDate: startDate,
    endDate: endDate,
    slot: slot,
    name: name,
    phone: phone,
    guests: guests,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  try {
    console.log('📤 Submitting booking:', bookingData);
    
    // Submit to Google Sheets
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });
    
    console.log('📥 Response received');
    
    // Show success message
    availabilityDiv.innerHTML = '✅ Booking request submitted successfully!';
    availabilityDiv.className = 'status success';
    
    // Send WhatsApp notification
    sendWhatsAppNotification(bookingData);
    
    // Reload bookings
    setTimeout(() => loadBookings(), 1000);
    
    // Reset form after delay
    setTimeout(() => {
      bookingForm.reset();
      availabilityDiv.innerHTML = '';
      availabilityDiv.className = 'status';
      updateEventTypeOptions();
    }, 3000);
    
  } catch (error) {
    console.error('❌ Booking error:', error);
    availabilityDiv.innerHTML = '❌ Error submitting booking. Please try again.';
    availabilityDiv.className = 'status error';
  } finally {
    submitBtn.disabled = false;
  }
}

// ============================================
// SEND WHATSAPP NOTIFICATION
// ============================================
function sendWhatsAppNotification(booking) {
  // Sanitize all data before sending to WhatsApp
  const safeName = sanitizeInput(booking.name);
  const safeResource = sanitizeInput(booking.resource);
  const safeEventType = sanitizeInput(booking.eventType);
  const safeMessage = sanitizeInput(booking.message);
  
  let whatsappText = `BOOKING REQUEST\n\n`;
  whatsappText += `Hello ${safeName},\n\n`;
  whatsappText += `Thank you for your booking request.\n\n`;
  whatsappText += `Venue: ${safeResource}\n`;
  whatsappText += `Event Type: ${safeEventType}\n`;
  whatsappText += `Date: ${booking.startDate}\n`;
  
  if (booking.endDate && booking.endDate !== booking.startDate) {
    whatsappText += `Check-out Date: ${booking.endDate}\n`;
  }
  
  if (booking.slot && booking.resource === "Function Hall") {
    whatsappText += `Time Slot: ${booking.slot.replace('_', ' ')}\n`;
  }
  
  whatsappText += `Guests: ${booking.guests}\n`;
  
  if (safeMessage) {
    whatsappText += `\nYour Message: ${safeMessage}\n`;
  }
  
  whatsappText += `\nYour booking is currently under review. We will confirm within 24 hours.\n\n`;
  whatsappText += `For any assistance or enquiries, please contact:\n`;
  whatsappText += `9384376599\n\n`;
  whatsappText += `We look forward to hosting your event.\n\n`;
  whatsappText += `Warm regards,\n`;
  whatsappText += `Banana Mahal`;
  
  // Validate WhatsApp URL before opening
  const encodedText = encodeURIComponent(whatsappText);
  const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP}?text=${encodedText}`;
  
  // Security: Validate URL length (WhatsApp has limits)
  if (whatsappUrl.length > 8000) {
    console.warn('⚠️ WhatsApp message too long, truncating...');
    return;
  }
  
  setTimeout(() => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }, 1000);
}

// ============================================
// EVENT LISTENERS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Premium booking page loaded');
  
  // Load bookings and initialize calendar
  loadBookings();
  
  // Attach event listeners
  resourceSelect.addEventListener('change', updateEventTypeOptions);
  slotSelect.addEventListener('change', checkAvailability);
  bookingForm.addEventListener('submit', submitBooking);
  
  // Real-time input sanitization and validation
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const guestsInput = document.getElementById('guests');
  const messageInput = document.getElementById('message');
  
  // Name input: Remove dangerous characters in real-time
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      let value = e.target.value;
      // Remove < > and other dangerous characters
      value = value.replace(/[<>]/g, '');
      if (value !== e.target.value) {
        e.target.value = value;
      }
    });
    
    nameInput.addEventListener('blur', (e) => {
      e.target.value = sanitizeInput(e.target.value);
    });
  }
  
  // Phone input: Only allow digits
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 10) {
        value = value.substring(0, 10);
      }
      e.target.value = value;
    });
  }
  
  // Guests input: Only allow positive numbers
  if (guestsInput) {
    guestsInput.addEventListener('input', (e) => {
      let value = parseInt(e.target.value, 10);
      if (isNaN(value) || value < 1) {
        e.target.value = '';
      } else if (value > 10000) {
        e.target.value = '10000';
      }
    });
  }
  
  // Message input: Remove dangerous characters
  if (messageInput) {
    messageInput.addEventListener('input', (e) => {
      let value = e.target.value;
      value = value.replace(/[<>]/g, '');
      if (value.length > 500) {
        value = value.substring(0, 500);
      }
      if (value !== e.target.value) {
        e.target.value = value;
      }
    });
    
    messageInput.addEventListener('blur', (e) => {
      e.target.value = sanitizeInput(e.target.value);
    });
  }
  
  console.log('✅ Event listeners attached with security measures');
});
