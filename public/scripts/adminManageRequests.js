$(".collectionRequests").addClass("current");

var pendingReschedule = { id: null };
var pendingApproval = { id: null };

function viewItems(requestId) {
  fetch(`/api/items/${requestId}`)
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
    const res = await fetch(`/requests/${pendingReschedule.id}/reschedule`, {
      method: 'PATCH'
    });

    const result = await res.json();
    console.log(result);
    document.getElementById("deleteModal").classList.add("hidden");
    document.getElementById("deleteModal").style.display = "none";
    showMessageModal("Collection request succesfully sent for rescheduling");
    fetchUpcomingRequests();
  } catch (err) {
    showMessageModalFail("Failed to send request for rescheduling: " + err);
  }
});

async function fetchUpcomingRequests() {
  try {
    const response = await fetch(`/api/requestsAdmin?status=pending`);
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
      <button onclick="viewItems(${req.id})" class="viewItemBtn">View Items</button>
      <div class="collectionDesc">Name: ${req.lastname} ${req.firstname}</div>
      <div class="collectionDesc">Date: ${formattedDate}</div>
      <button onclick="showRescheduleModal(${req.id})" class="rescheduleBtn">Request Reschedule</button>
      <div class="collectionDesc">Phone no.: ${req.phoneno}</div>
      <div class="collectionDesc">Address: ${req.address}</div>
      <button onclick="showApproveModal(${req.id})" class="approveBtn">Approve</button>
    `;
    container.appendChild(card);
  });
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

function showApproveModal(id) {
pendingApproval = { id };
$('#approveModal').removeClass('hidden').css('display', 'flex');
}

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
  const res = await fetch(`/requests/${pendingApproval.id}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ approvedTime: time, driverID: driver }),
  });

  const result = await res.json();
  console.log(result);

  $('#approveModal').addClass('hidden').hide();
  showMessageModal("Collection request successfully approved!");
  fetchUpcomingRequests();
} catch (err) {
  showMessageModal("Failed to approve request: " + err)
}
});

fetchUpcomingRequests();