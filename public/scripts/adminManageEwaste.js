$(".e-waste").addClass("current");

var pendingReschedule = { id: null };
var pendingApproval = { id: null };

function viewItems(requestId) {
  fetch(`/api/ewaste/items/${requestId}`)
    .then(res => res.json())
    .then(items => {
      const itemList = document.getElementById("item-list");
      itemList.innerHTML = '';

      items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${item.item}</td><td>${item.quantity}</td>`;
        itemList.appendChild(row);
      });

      document.getElementById("modal").style.display = "flex";
    })
    .catch(err => {
      console.error("Error fetching items:", err);
      alert("Failed to fetch items.");
    });
}

function showRescheduleModal(id) {
  pendingReschedule = { id };
  document.getElementById("deleteModal").classList.remove("hidden");
  document.getElementById("deleteModal").style.display = "flex";
}

document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  pendingReschedule = { id: null };
  document.getElementById("deleteModal").classList.add("hidden");
  document.getElementById("deleteModal").style.display = "none";
});

document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
  try {
    const res = await fetch(`/api/requests/${pendingReschedule.id}/delete`, {
      method: 'DELETE'
    });

    const result = await res.json();
    console.log(result);
    document.getElementById("deleteModal").classList.add("hidden");
    document.getElementById("deleteModal").style.display = "none";
    showMessageModal("Request Rejected!");
    fetchUpcomingRequests();
  } catch (err) {
    showMessageModalFail("Reschedule failed:", err);
  }
});

async function fetchUpcomingRequests() {
  try {
    const response = await fetch(`/api/ewaste/requestsAdmin?status=Pending`);
    const data = await response.json();
    renderRequests(data.requests);
  } catch (err) {
    console.error("Error fetching upcoming requests:", err);
  }
}

function renderRequests(requests) {
  const container = document.getElementById("list");
  container.innerHTML = "";

  requests.forEach(req => {
    const dateObj = new Date(req.date);
    let isoString = dateObj.toISOString();

    // Get the UTC offset in minutes for Kuala Lumpur (GMT+8)
    const klOffsetMinutes = -8 * 60; // Negative because UTC is "ahead"

    // Create a new Date object by adding the offset
    const adjustedDate = new Date(dateObj.getTime() - klOffsetMinutes * 60 * 1000);
    const formattedDate = adjustedDate.toISOString().split('T')[0];

    const card = document.createElement("div");
    card.classList.add("listItem");
    card.innerHTML = `
      <div class="collectionDesc span2">ID: ${req.id}</div>
      <div class="collectionDesc">Type: ${req.type}</div>
      <div class="collectionDesc">Date: ${date}</div>
      <button onclick="viewItems(${req.id})" class="viewItemBtn">View Items</button>
      <button onclick="showRescheduleModal(${req.id})" class="rescheduleBtn">Reject</button>
      <button onclick="showApproveModal(${req.id})" class="approveBtn">Approve</button>
    `;
    container.appendChild(card);
  });
}

function showApproveModal(id) {
    pendingApproval = { id };
    $('#approveModal').removeClass('hidden').css('display', 'flex');
}

function showMessageModal(message) {
    console.log("kjsdf")
    const $modal = $('#messageModalSuccess');
    $('#messageBody').text(message);

    $modal.removeClass('hidden');
}

function showMessageModalFail(message) {
    const $modal = $('#messageModalFail');
    $('#messageBodyFail').text(message);

    $modal.removeClass('hidden');
}

$('#closeMessageBtn').on('click', function () {
    $('#messageModalSuccess').addClass('hidden');
});

$('#closeMessageBtnFail').on('click', function () {
    $('#messageModalFail').addClass('hidden');
});

$('#cancelApproveBtn').click(() => {
    pendingApproval = { id: null };
    $('#approveModal').addClass('hidden').hide();
});

$('#confirmApproveBtn').click(async () => {
    const time = $('#timeSelect').val();
    const driver = $('#driverSelect').val();
    console.log(time + driver)

    if (!time || !driver) {
    alert("Please select both time and driver.");
    return;
    }

    try {
    const res = await fetch(`/requests/ewaste/${pendingApproval.id}/approve`, {
        method: 'PATCH',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approvedTime: time, driverID: driver }),
    });

    const result = await res.json();
    console.log(result);

    $('#approveModal').addClass('hidden').hide();
    showMessageModal("Request Approved!");
    fetchUpcomingRequests();
    } catch (err) {
    console.error("Approval failed:", err);
    showMessageModalFail("Failed to approve request.");
    }
});

fetchUpcomingRequests();