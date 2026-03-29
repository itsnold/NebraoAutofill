// Remove old popup listener
function createOverlay() {
  if (document.getElementById("form-autofill-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "form-autofill-overlay";
  overlay.style.position = "fixed";
  overlay.style.bottom = "20px";
  overlay.style.right = "20px";
  overlay.style.backgroundColor = "white";
  overlay.style.padding = "15px";
  overlay.style.border = "1px solid #ccc";
  overlay.style.borderRadius = "8px";
  overlay.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
  overlay.style.zIndex = "999999";
  overlay.style.width = "250px";
  overlay.style.fontFamily = "Arial, sans-serif";

  overlay.innerHTML = `
    <h3 style="margin-top: 0; font-size: 16px;">Nebrao Autofill</h3>
    
    <div style="margin-bottom: 10px;">
      <label style="display: block; font-size: 12px; margin-bottom: 3px;">Full Name</label>
      <input type="text" id="auto-fullName" placeholder="Last Name, First Name" style="width: 100%; box-sizing: border-box; padding: 4px;" />
    </div>

    <div style="margin-bottom: 10px;">
      <label style="display: block; font-size: 12px; margin-bottom: 3px;">Email (ADDU)</label>
      <input type="email" id="auto-email" placeholder="example@addu.edu.ph" style="width: 100%; box-sizing: border-box; padding: 4px;" />
    </div>

    <div style="margin-bottom: 10px;">
      <label style="display: block; font-size: 12px; margin-bottom: 3px;">Section</label>
      <select id="auto-section" style="width: 100%; box-sizing: border-box; padding: 4px;">
        <option value="">Select Section</option>
        <option value="4-304">4-304</option>
        <option value="4-305">4-305</option>
        <option value="4-306">4-306</option>
        <option value="4-103">4-103</option>
      </select>
    </div>

    <button id="auto-saveBtn" style="width: 100%; padding: 6px; margin-bottom: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Save Info</button>
    <button id="auto-fillBtn" style="width: 100%; padding: 6px; background-color: #2196F3; color: white; border: none; cursor: pointer;">Autofill</button>
    <button id="auto-closeBtn" style="position: absolute; top: 5px; right: 5px; border: none; background: none; cursor: pointer; font-size: 14px;">X</button>
  `;

  document.body.appendChild(overlay);

  chrome.storage.local.get(["fullName", "email", "section"], (data) => {
    if (data.fullName) document.getElementById("auto-fullName").value = data.fullName;
    if (data.email) document.getElementById("auto-email").value = data.email;
    if (data.section) document.getElementById("auto-section").value = data.section;
  });

  document.getElementById("auto-saveBtn").addEventListener("click", () => {
    const preset = {
      fullName: document.getElementById("auto-fullName").value,
      email: document.getElementById("auto-email").value,
      section: document.getElementById("auto-section").value
    };
    chrome.storage.local.set(preset, () => {
      alert("Preset saved!");
    });
  });

  document.getElementById("auto-fillBtn").addEventListener("click", () => {
    chrome.storage.local.get(["fullName", "email", "section"], (data) => {
      fillGoogleForm(data);
    });
  });

  document.getElementById("auto-closeBtn").addEventListener("click", () => {
    overlay.style.display = "none";
  });
}

function fillGoogleForm(data) {
  const items = document.querySelectorAll("div[role=\"listitem\"]");

  items.forEach(item => {
    const textContent = item.innerText || "";
    
    if (textContent.includes("Full Name") || textContent.includes("Last Name, First Name")) {
      const input = item.querySelector("input[type=\"text\"]");
      if (input && data.fullName) {
        simulateInput(input, data.fullName);
      }
    }
    
    if (textContent.includes("Email") || textContent.includes("ADDU Email")) {
      const input = item.querySelector("input[type=\"email\"], input[type=\"text\"]");
      if (input && data.email) {
        simulateInput(input, data.email);
      }
    }

    if (textContent.includes("ection")) {
      if (data.section) {
        const option = item.querySelector(`[data-value="${data.section}"]`);
        if (option) {
          option.click();
        }
      }
    }
  });
}

function simulateInput(input, value) {
  input.focus();
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.blur();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createOverlay);
} else {
  createOverlay();
}
