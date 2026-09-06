// ============================================================
// DASHBOARD LOGIC — dashboard.html
// Depends on firebase-config.js + auth.js + devices.js loaded first.
// ============================================================

function initDashboard() {
  const nameEl = document.getElementById("dash-name");
  if (!nameEl) return;

  const avatarEl = document.getElementById("dash-avatar");
  const roleEl = document.getElementById("dash-role");
  const listingsEl = document.getElementById("my-listings");
  const listingsEmptyEl = document.getElementById("my-listings-empty");
  const statListings = document.getElementById("stat-listings");
  const statBids = document.getElementById("stat-bids");
  const statSold = document.getElementById("stat-sold");

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const userDoc = await db.collection("users").doc(user.uid).get();
    const profile = userDoc.exists ? userDoc.data() : { name: user.email, role: "user" };

    nameEl.textContent = profile.name || user.email;
    avatarEl.textContent = (profile.name || user.email || "?").charAt(0).toUpperCase();
    roleEl.textContent = profile.role === "vendor" ? "Vendor" : "Seller";

    db.collection("devices").where("ownerId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .onSnapshot(async (snap) => {
        if (snap.empty) {
          listingsEl.innerHTML = "";
          listingsEmptyEl.style.display = "block";
          statListings.textContent = "0";
          statSold.textContent = "0";
          statBids.textContent = "0";
          return;
        }
        listingsEmptyEl.style.display = "none";

        let activeCount = 0;
        let soldCount = 0;
        let totalBids = 0;

        const rows = await Promise.all(snap.docs.map(async (doc) => {
          const d = doc.data();
          if (d.status === "sold" || d.status === "exchanged") soldCount++;
          else activeCount++;

          const bidsSnap = await doc.ref.collection("bids").get();
          totalBids += bidsSnap.size;

          return `
            <a href="device-detail.html?id=${doc.id}" class="bid-row" style="text-decoration:none;">
              <div>
                <strong>${escapeHtml(d.title)}</strong>
                <p class="bid-message">${DEVICE_TYPES[d.type] || "Device"} · ${bidsSnap.size} bid${bidsSnap.size === 1 ? "" : "s"}</p>
              </div>
              <span class="device-card-status status-${d.status}">${labelForStatus(d.status)}</span>
            </a>
          `;
        }));

        listingsEl.innerHTML = rows.join("");
        statListings.textContent = String(activeCount);
        statSold.textContent = String(soldCount);
        statBids.textContent = String(totalBids);
      });
  });
}

document.addEventListener("DOMContentLoaded", initDashboard);
