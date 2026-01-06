// K. H. Patel Dental Home - Website Scripts

document.addEventListener("DOMContentLoaded", function () {
  console.log("K. H. Patel Dental Home website loaded successfully");

  // Booking Form Handler
  const bookingForm = document.getElementById("bookingForm");
  
  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form values
      const name = document.getElementById("patientName").value.trim();
      const phone = document.getElementById("patientPhone").value.trim();
      const email = document.getElementById("patientEmail").value.trim();
      const service = document.getElementById("serviceType").value;
      const date = document.getElementById("preferredDate").value;
      const time = document.getElementById("preferredTime").value;
      const message = document.getElementById("patientMessage").value.trim();

      // Validate required fields
      if (!name || !phone || !service) {
        alert("Please fill in all required fields (Name, Phone, Service)");
        return;
      }

      // Format date if provided
      let formattedDate = "Not specified";
      if (date) {
        const dateObj = new Date(date);
        formattedDate = dateObj.toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      // Build WhatsApp message
      let whatsappMessage = `🦷 *New Appointment Request*\n\n`;
      whatsappMessage += `👤 *Name:* ${name}\n`;
      whatsappMessage += `📞 *Phone:* ${phone}\n`;
      if (email) whatsappMessage += `📧 *Email:* ${email}\n`;
      whatsappMessage += `🏥 *Service:* ${service}\n`;
      whatsappMessage += `📅 *Preferred Date:* ${formattedDate}\n`;
      whatsappMessage += `⏰ *Preferred Time:* ${time || "Not specified"}\n`;
      if (message) whatsappMessage += `💬 *Message:* ${message}\n`;
      whatsappMessage += `\n_Sent from K.H. Patel Dental Home Website_`;

      // Encode message for URL
      const encodedMessage = encodeURIComponent(whatsappMessage);

      // Open WhatsApp with pre-filled message
      const whatsappURL = `https://wa.me/919714030699?text=${encodedMessage}`;
      window.open(whatsappURL, "_blank");

      // Show success message
      alert("Redirecting to WhatsApp to send your booking request!");

      // Reset form
      bookingForm.reset();
    });
  }

  // Set minimum date for date picker (today)
  const dateInput = document.getElementById("preferredDate");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  // ========== AI CHATBOT INTEGRATION ==========
  const chatbotToggle = document.getElementById("chatbot-toggle");
  const chatbotWindow = document.getElementById("chatbot-window");
  const chatbotClose = document.getElementById("chatbot-close");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSend = document.getElementById("chatbot-send");
  const chatbotMessages = document.getElementById("chatbot-messages");
  const chatNotification = document.querySelector(".chat-notification");
  const chatbotClear = document.getElementById("chatbot-clear");
  const initialMessages = chatbotMessages.innerHTML;

  // Worker API Configuration
  const WORKER_URL = "https://withered-base-1bc3.cogniq-yatendra.workers.dev/";
  const PROJECT_ID = "KH_PATEL_DENTAL";
  const MODEL = "gemma-3-4b-it";

  // System instruction with all clinic data
  const SYSTEM_INSTRUCTION = `You are the professional and caring virtual assistant for K.H. Patel Dental Home. 

CLINIC DATA:
- Name: K. H. Patel Dental Home
- Type: Multispecialty Pediatric Dental Clinic & Implant Center
- Address: 2, Shreenathdwara Society, Akhbarnagar, Nava Vadaj, Ahmedabad – 380013
- Phone: +91 97140 30699 (Call & WhatsApp)
- Hours: 10:00 AM to 10:00 PM (open all 7 days)
- Doctors: Dr. Manthan K. Patel (Implant Specialist) and Dr. Dhara M. Patel (Pediatric Dentist)
- Services: Pediatric care, Implants, RCT, Cosmetic treatments, Orthodontics, and General Dentistry.
- Features: Child-friendly atmosphere, painless procedures, and modern technology.
- Parking: Convenient street parking is available in the residential area nearby.

STRICT RESPONSE RULES:
1. ONLY answer questions about the clinic using the CLINIC DATA provided above. 
2. If the user says "thanks", "thank you", or shows gratitude, respond warmly and professionally (e.g., "You're very welcome! I'm happy to help. Do you have any other questions?").
3. If a user asks a question that is NOT answered by the CLINIC DATA (e.g., medical advice or external topics), politely explain you don't have that information and suggest calling +91 97140 30699.
4. Keep the tone professional, helpful, and human-like.
5. Keep answers concise and highly relevant.
6. For "location" queries, include the full address and landmarks.
7. For "timings", mention we are open 7 days a week from 10 AM to 10 PM.`;

  // Toggle chat window
  if (chatbotToggle) {
    chatbotToggle.addEventListener("click", function () {
      chatbotWindow.classList.toggle("active");
      if (chatNotification) {
        chatNotification.style.display = "none";
      }
    });
  }

  // Close chat window
  if (chatbotClose) {
    chatbotClose.addEventListener("click", function () {
      chatbotWindow.classList.remove("active");
    });
  }

  // Send message function
  async function sendMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, "user");
    chatbotInput.value = "";

    // Show typing indicator
    showTypingIndicator();

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Project-ID": PROJECT_ID,
        },
        body: JSON.stringify({
          message: message,
          model: MODEL,
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          maxOutputTokens: 1024,
        }),
      });

      const data = await response.json();

      // Remove typing indicator
      removeTypingIndicator();

      if (data.success && data.message) {
        addMessage(data.message, "bot");
      } else {
        addMessage(
          "I apologize, but I'm having trouble responding right now. Please try again or contact us directly at +91 97140 30699.",
          "bot"
        );
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      removeTypingIndicator();
      addMessage(
        "I'm sorry, there was an error connecting. Please contact us directly at +91 97140 30699 or via WhatsApp.",
        "bot"
      );
    }
  }

  // Add message to chat
  function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender}-message`;

    // Format the message text (handle markdown-like formatting)
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");

    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${formattedText}</p>
      </div>
    `;

    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Show typing indicator
  function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "chat-message bot-message typing-message";
    typingDiv.innerHTML = `
      <div class="message-content">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Remove typing indicator
  function removeTypingIndicator() {
    const typingMessage = chatbotMessages.querySelector(".typing-message");
    if (typingMessage) {
      typingMessage.remove();
    }
  }

  // Send message on button click
  if (chatbotSend) {
    chatbotSend.addEventListener("click", sendMessage);
  }

  // Send message on Enter key
  if (chatbotInput) {
    chatbotInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  }

  // Clear chat functionality
  if (chatbotClear) {
    chatbotClear.addEventListener("click", function () {
      chatbotMessages.innerHTML = initialMessages;
    });
  }

  // ========== EMERGENCY MODAL TRIGGER ==========
  const emergencyModalEl = document.getElementById('emergencyModal');
  if (emergencyModalEl) {
    const emergencyModal = new bootstrap.Modal(emergencyModalEl);
    // Show modal automatically after 2 seconds
    setTimeout(() => {
      emergencyModal.show();
    }, 2000);
  }
});
