let currentPage = 1;
const limit = 5;

async function fetchUpcomingRequests(page) {
    try {
        const response = await fetch(`/api/requests?status=pending&page=${page}&limit=${limit}`);
        const data = await response.json();
        console.log(data)
        renderRequests(data.requests);
        updatePagination(data.totalPages);
    } catch (error) {
        console.error("Error fetching upcoming requests:", error);
    }
}

function renderRequests(requests) {
    const container = document.getElementById("list");
    container.innerHTML = ""; // Clear previous content

    requests.forEach(req => {
        // Convert the date to a Date object
        const dateObj = new Date(req.date);
        const formattedDate = dateObj.toISOString().split('T')[0];

        const requestCard = document.createElement("div");
        requestCard.classList.add("listItem");
        requestCard.innerHTML = `
            <div class="collectionDesc">ID: ${req.id}</div>
            <div class="collectionDesc span2">Name: ${req.lastname} ${req.firstname}</div>
            <div class="collectionDesc span2">Date: ${formattedDate}</div>
            <div class="collectionDesc span2">Phone: ${req.phoneno}</div>
            <div class="collectionDesc span2">Address: ${req.address}</div>
            <button onclick="viewItems(${req.id})" class="viewItemBtn">View Items</button>
        `;
        container.appendChild(requestCard);
    });
}

document.getElementById("next").addEventListener("click", () => {
    currentPage++;
    fetchUpcomingRequests(currentPage);
});

document.getElementById("back").addEventListener("click", () => {
    currentPage--;
    fetchUpcomingRequests(currentPage);
});

function updatePagination(totalPages) {
    const nextButton = document.getElementById("next");
    const backButton = document.getElementById("back");

    if (totalPages <= 1) { 
        nextButton.classList.add("hide")
        backButton.classList.add("hide")
    } else if (currentPage === 1) { 
        nextButton.classList.remove("hide")
        backButton.classList.add("hide")
    } else if (currentPage === totalPages) { 
        nextButton.classList.add("hide")
        backButton.classList.remove("hide")
    } else { 
        nextButton.classList.remove("hide")
        backButton.classList.remove("hide")
    }
}

// Function to open the modal and fetch items for the request
function viewItems(requestId) {
    // Fetch items related to the collection request from backend
    fetch(`/api/items/${requestId}`)
        .then(response => response.json())
        .then(items => {
            const itemList = document.getElementById("item-list");
            itemList.innerHTML = ''; // Clear any previous items

            // Populate the modal with items in a table
            items.forEach(item => {
                console.log(item); // Check the individual item object
                
                // Ensure that item and quantity exist
                if (!item.item || !item.quantity) {
                    console.error("Item data is incomplete:", item);  // Log any incomplete item data
                    return;
                }
            
                const row = document.createElement('tr'); // Create a table row
            
                // Create the Item column
                const itemCell = document.createElement('td');
                itemCell.innerText = item.item; // Access the 'item' field from the response
                row.appendChild(itemCell);
            
                // Create the Quantity column
                const quantityCell = document.createElement('td');
                quantityCell.innerText = item.quantity; // Access the 'quantity' field from the response
                row.appendChild(quantityCell);
            
                // Append the row to the table body
                itemList.appendChild(row);
            });

            // Display the modal
            const modal = document.getElementById("modal");
            modal.style.display = "flex";

            // Close the modal when clicking the close button
            document.getElementById("close-modal").addEventListener("click", () => {
                modal.style.display = "none";
            });
        })
        .catch(error => {
            console.error("Error fetching items:", error);
            alert("Failed to fetch items.");
        });
}

function renderRequests(requests) {
    const container = document.getElementById("list");
    container.innerHTML = ""; // Clear previous content

    requests.forEach(req => {
        // Convert the date to a Date object
        const dateObj = new Date(req.date);
        // Format the date as YYYY-MM-DD
        const formattedDate = dateObj.toISOString().split('T')[0]; // '2025-05-10'

        const requestCard = document.createElement("div");
        requestCard.classList.add("listItem");
        requestCard.innerHTML = `
            <div class="collectionDesc" id="id">ID: ${req.id}</div>
            <div class="collectionDesc span2">Name: ${req.lastname} ${req.firstname}</div>
            <div class="collectionDesc span2">Date: ${formattedDate}</div>
            <div class="collectionDesc span2">Phone: ${req.phoneno}</div>
            <div class="collectionDesc span2">Address: ${req.address}</div>
            <button onclick="viewItems(${req.id})" class="viewItemBtn">View Items</button>
        `;
        container.appendChild(requestCard);
    });
}

// Initial load
fetchUpcomingRequests(currentPage);