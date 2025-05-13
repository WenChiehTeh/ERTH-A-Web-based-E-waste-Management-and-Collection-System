$(".add").addClass("current");

async function fetchUpcomingRequests() {
    try {
        const response = await fetch(`/api/refurbish/requestsDriver`);
        const data = await response.json();
        console.log(data)
        renderRequests(data.requests);
    } catch (error) {
        console.error("Error fetching upcoming requests:", error);
    }
};

function viewItems(requestId) {
    fetch(`/api/ewaste/items/${requestId}`)
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
};

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
            <div class="collectionDesc spanID">ID: ${req.id}</div>
            <div class="collectionDesc span2">Date: ${formattedDate}</div>
            <div class="collectionDesc span2">Time: ${req.time}</div>
            <button onclick="viewItems(${req.id})" class="viewItemBtn">View Items</button>
        `;
        container.appendChild(requestCard);
        console.log("sadjhfds")
    });
};

// Initial load
fetchUpcomingRequests();