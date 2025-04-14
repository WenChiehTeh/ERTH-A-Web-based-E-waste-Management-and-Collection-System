var allItems = ["--ELECTRONICS--", "Desktop", "Laptop", "Mobile Phone", "Printer", "Modem/Router", "--LARGE HOUSEHOLD APPLIANCES--", "Refridgerators", "Washing Machine", "Air Conditioner", "Microwave", "--SMALL HOUSEHOLD APPLIANCES--", "Iron", "Vacuum", "Toasters", "--OTHERS--", "Televisions (LCD, LED, CRT)", "Audio systems (speakers, headphones, radios)", "Any Game Consoles", "Any Cameras"]; 
var dropdowns = ["#item1"];
var selectedValues = [];
var stockDict = {};

$(".dashboard").addClass("current");

function createDictionary(warehouse) {
    warehouse.forEach(item => {
        stockDict[item.item] = item.quantity;
    });
};

async function loadAccounts() {
try {
    const res = await fetch('/api/loadWarehouse');
    const warehouse = await res.json();
    console.log(warehouse);

    const $tbody = $('#accountsTable tbody');
    $tbody.empty(); // Clear existing rows

    warehouse.forEach(item => {
        const $row = $(`
            <tr>
                <td>${item.item}</td>
                <td>${item.quantity}</td>
            </tr>
        `);
        $tbody.append($row);
    });

    createDictionary(warehouse);
} catch (error) {
    console.error("Error loading warehouse:", error);
}
}

function showModal(type, id) {
  pendingDelete = { type, id };
  setMinSelectableDate();
  $('#modal').removeClass('hidden');
}

//populate the selection for the first item
function populateDropdowns() {
dropdowns.forEach(i => {
    //save element to variable
    var dropdownElement = $(i);

    //Add selection to dropdown menu
    allItems.forEach(j => {
        //select has no value but can be chosen (will be rejected upon form submission), categories cannot  be selected and other sections can be selected
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

dropdowns.forEach(dropdownId => {
    let $dropdown = $(dropdownId);
    let currentValue = $dropdown.val();

    // Clear options
    $dropdown.html(`<option value="">--SELECT--</option>`);

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

//Add item button
//Listen for on click event
$("#addItemBtn").on("click", function (event) {
event.preventDefault();

const dropdownId = "#item" + (dropdowns.length + 1);
dropdowns.push(dropdownId);

const newContent = $(`
    <div class="item item${dropdowns.length}">
        <button id="${dropdowns.length}" class="delete" onclick="deleteItem(event, this.id)">&#128465;</button>
        <select id="item${dropdowns.length}" onchange="updateDropdowns()" name="item" class="extra" required></select>
        <input type="number" min="1" class="qty" name="quantity" value="1" required>
    </div>
`);

$("#addItem").append(newContent);
updateDropdowns();
});

//delete item function
function deleteItem(event, deleteID) {
//prevents the form from submitting
event.preventDefault();

//save the element object in memmory
const elementToDelete = $(".item" + deleteID);
dropdowns.splice(deleteID - 1, 1);

//delete element
elementToDelete.remove();
}

$('#cancelBtn').on('click', function () {
pendingDelete = { id: null, type: null };
$('#modal').addClass('hidden');
});

function showMessageModal(message) {
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

$('#confirmBtn').on('click', async () => {
const process = $('#process')[0];
const date = $('#date')[0];
const items = $('#addItem select[name="item"]');
const quantities = $('#addItem input[name="quantity"]');

let isValid = true;

// Clear previous validity messages
[process, date, ...items, ...quantities].forEach(el => {
    el.setCustomValidity("");
});

// Validate process
if (!process.value) {
    process.setCustomValidity("Please select a process type.");
    process.reportValidity();
    process.focus();
    isValid = false;
    return;
}

// Validate date
if (!date.value) {
    date.setCustomValidity("Please select a date.");
    date.reportValidity();
    isValid = false;
    return;
} 

// Validate items and quantities
for (let i = 0; i < items.length; i++) {
    if (!items[i].value) {
        items[i].setCustomValidity("Please select an item.");
        items[i].reportValidity();
        items[i].focus();
        isValid = false;
        return;
    }
    const qty = parseInt(quantities[i].value);
    if (!qty || qty < 1) {
        quantities[i].setCustomValidity("Quantity must be at least 1.");
        quantities[i].reportValidity();
        quantities[i].focus();
        isValid = false;
        return;
    }
}

if (!isValid) return;

const itemData = Array.from(items).map((item, index) => ({
    item: item.value,
    quantity: parseInt(quantities[index].value),
}));

try {
    const res = await fetch('/api/processWarehouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            process: process.value,
            date: date.value,
            items: itemData
        })
    });

    if (res.ok) {
        $('#modal').addClass('hidden');
        loadAccounts();
        showMessageModal('Warehouse has been processed successfully.');
    } else {
        const error = await res.json();
        console.log(error.message)
        showMessageModalFail(error.message);
    }
} catch (error) {
  showMessageModalFail('Unable to connect to the server.');
}
});

function setMinSelectableDate() {
const dateInput = $('#date');
const currentDate = new Date();

// Calculate 7 days ahead
currentDate.setDate(currentDate.getDate() + 7);

// Format date as YYYY-MM-DD
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const day = String(currentDate.getDate()).padStart(2, '0');

const minDate = `${year}-${month}-${day}`;
dateInput.attr('min', minDate);
}

loadAccounts();
populateDropdowns();