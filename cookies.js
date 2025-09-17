document.addEventListener("DOMContentLoaded", function() {
  const banner = document.getElementById("cookie-consent");
  const acceptBtn = document.getElementById("accept-cookies");
  const declineBtn = document.getElementById("decline-cookies");

  // Check if user already made a choice
  if (!localStorage.getItem("cookieConsent")) {
    banner.style.display = "flex"; // show banner
  } else {
    banner.style.display = "none"; // hide if already accepted/declined
  }

  // Accept
  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "accepted");
    banner.style.display = "none";
  });

  // Decline
  declineBtn.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "declined");
    banner.style.display = "none";
  });
});
