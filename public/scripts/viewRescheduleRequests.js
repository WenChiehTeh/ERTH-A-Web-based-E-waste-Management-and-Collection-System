let currentPage = 1;
const limit = 5;

$("#next").on("click", function () {
    currentPage++;
    fetchUpcomingRequests(currentPage);
});

$("#back").on("click", function () {
    currentPage--;
    fetchUpcomingRequests(currentPage);
});

function updatePagination(totalPages) {
    const $nextButton = $("#next");
    const $backButton = $("#back");

    if (totalPages <= 1) {
        $nextButton.addClass("hide");
        $backButton.addClass("hide");
    } else if (currentPage === 1) {
        $nextButton.removeClass("hide");
        $backButton.addClass("hide");
    } else if (currentPage === totalPages) {
        $nextButton.addClass("hide");
        $backButton.removeClass("hide");
    } else {
        $nextButton.removeClass("hide");
        $backButton.removeClass("hide");
    }
};

async function fetchUpcomingRequests(page) {
    try {
        const response = await fetch(`/api/requests?status=reschedule&page=${page}&limit=${limit}`);
        const data = await response.json();
        renderRequests(data.requests);
        updatePagination(data.totalPages);
    } catch (error) {
        console.error("Error fetching upcoming requests:", error);
    }
}

function viewItems(requestId) {
    fetch(`/api/items/${requestId}`)
        .then(response => response.json())
        .then(items => {
            const itemList = document.getElementById("item-list");
            itemList.innerHTML = '';


            items.forEach(item => {
                console.log(item);
                
                if (!item.item || !item.quantity) {
                    console.error("Item data is incomplete:", item); 
                    return;
                }
            
                const row = document.createElement('tr');
            
                const itemCell = document.createElement('td');
                itemCell.innerText = item.item;
                row.appendChild(itemCell);
            
                const quantityCell = document.createElement('td');
                quantityCell.innerText = item.quantity;
                row.appendChild(quantityCell);
            
                itemList.appendChild(row);
            });

            const modal = document.getElementById("modal");
            modal.style.display = "flex";

            document.getElementById("close-modal").addEventListener("click", () => {
                modal.style.display = "none";
            });
        })
        .catch(error => {
            console.error("Error fetching items:", error);
            alert("Failed to fetch items.");
        });
}

function openRescheduleModal(requestId) {
    $("#reschedule-request-id").val(requestId);
    $("#reschedule-date").val(""); // clear any previous value
    $("#reschedule-modal").css("display", "flex");
    $("#reschedule-date")[0].setCustomValidity(""); // clear previous validity message
}

// Utility function to check if selected date is at least 7 days from today
function isDateAtLeastSevenDaysAhead(dateStr) {
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // remove time part
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 7);
    return selectedDate >= minDate;
}

$("#cancel-reschedule").on("click", function () {
    $("#reschedule-modal").css("display", "none");
});

$("#confirm-reschedule").on("click", function () {
    const requestId = $("#reschedule-request-id").val();
    const newDate = $("#reschedule-date").val();

    if (!newDate) {
        $("#reschedule-date")[0].setCustomValidity("Please select a new date.");
        $("#reschedule-date")[0].reportValidity();
        return;
    }

    if (!isDateAtLeastSevenDaysAhead(newDate)) {
        $("#reschedule-date")[0].setCustomValidity("Date must be at least 7 days from today.");
        $("#reschedule-date")[0].reportValidity();
        return;
    }

    // Clear previous errors
    $("#reschedule-date")[0].setCustomValidity("");

    fetch(`/api/requests/${requestId}/reschedule`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ date: newDate })
    })
    .then(res => res.json())
    .then(data => {
        $("#reschedule-modal").css("display", "none");
        showMessageModal("Rescheduling successful!")
        fetchUpcomingRequests(currentPage); // refresh list
    })
    .catch(error => {
        console.error("Error rescheduling:", error);
        $("#reschedule-date")[0].setCustomValidity("Failed to reschedule. Try again.");
        $("#reschedule-date")[0].reportValidity();
    });
});

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

        const requestCard = document.createElement("div");
        requestCard.classList.add("listItem");
        requestCard.innerHTML = `
            <div class="collectionDesc" id="id">ID: ${req.id}</div>
            <div class="collectionDesc span2">Name: ${req.lastname} ${req.firstname}</div>
            <div class="collectionDesc span2">Phone: ${req.phoneno}</div>
            <div class="collectionDesc span2">Date: ${formattedDate}</div>
            <div class="collectionDesc address">Address: ${req.address}</div>
            <button onclick="viewItems(${req.id})" class="viewItemBtn">View Items</button>
            <button onclick="openRescheduleModal(${req.id})" class="viewItemBtn rescheduleBtn">Reschedule</button>
        `;
        container.appendChild(requestCard);
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

// Initial load
fetchUpcomingRequests(currentPage);