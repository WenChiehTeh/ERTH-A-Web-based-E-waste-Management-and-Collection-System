var allItems = ["--ELECTRONICS--", "Desktop", "Laptop", "Mobile Phone", "Printer", "Modem/Router", "--LARGE HOUSEHOLD APPLIANCES--", "Refridgerators", "Washing Machine", "Air Conditioner", "Microwave", "--SMALL HOUSEHOLD APPLIANCES--", "Iron", "Vacuum", "Toasters", "--OTHERS--", "Televisions (LCD, LED, CRT)", "Audio systems (speakers, headphones, radios)", "Any Game Consoles", "Any Cameras"]; 
var dropdowns = ["#item1"]; // Dropdown selectors
var selectedValues = [];

function populateDropdowns() {
    dropdowns.forEach(i => {
        var dropdownElement = $(i);

        allItems.forEach(j => {
            if (j == "--SELECT--") {
                dropdownElement.append(`<option value="">${j}</option>`);
            } else if (j[0] == "-") {
                dropdownElement.append(`<option value="" disabled="true">${j}</option>`);
            }else {
                dropdownElement.append(`<option value="${j}">${j}</option>`);
            }
        })
    })
}

// Function to update dropdowns and remove selected items
function updateDropdowns() {
    let selectedValues = dropdowns.map(id => $(id).val());
    console.log(selectedValues);

    dropdowns.forEach(dropdownId => {
        let $dropdown = $(dropdownId);
        let currentValue = $dropdown.val();
        console.log(currentValue);

        $dropdown.html(`<option value="">--SELECT--</option>`); // Clear options

        // Loop through e-waste items and add options if not already selected
        allItems.forEach(item => {
            if (!selectedValues.includes(item) || item === currentValue) {
                if (item[0] == "-") {
                    $dropdown.append(
                        `<option value="" disabled="true" ${item === currentValue ? "selected" : ""}>${item}</option>`
                    );
                } else {
                    $dropdown.append(
                        `<option value="${item}" ${item === currentValue ? "selected" : ""}>${item}</option>`
                    );
                }
            }
        });
    });
}

$("#addItemBtn").on("click", function (event) {
    event.preventDefault();
    dropdowns.push("#item" + (dropdowns.length + 1));
    const newContent = document.createElement('div');
    const contentContainer = document.getElementById("testContainer");
    newContent.classList.add('item');
    newContent.innerHTML = 
    `
        <select id="item${dropdowns.length}" onchange="updateDropdowns()" name="item" required>
        </select>
        <input type="number" min="1" class="qty" name="fname" placeholder="1" required>
    `
    contentContainer.appendChild(newContent);
    updateDropdowns();
});

// Initialize dropdowns on page load
populateDropdowns();