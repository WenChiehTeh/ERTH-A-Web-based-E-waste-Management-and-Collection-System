var allItems = ["--ELECTRONICS--", "Desktop", "Laptop", "Mobile Phone", "Printer", "Modem/Router", "--LARGE HOUSEHOLD APPLIANCES--", "Refridgerators", "Washing Machine", "Air Conditioner", "Microwave", "--SMALL HOUSEHOLD APPLIANCES--", "Iron", "Vacuum", "Toasters", "--OTHERS--", "Televisions (LCD, LED, CRT)", "Audio systems (speakers, headphones, radios)", "Any Game Consoles", "Any Cameras"]; 
var dropdowns = ["#item1"];
var selectedValues = [];

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
    //prevents from submitting the form
    event.preventDefault();
    //add element to array
    dropdowns.push("#item" + (dropdowns.length + 1));
    //append new html below the previous item
    const newContent = document.createElement('div');
    const contentContainer = document.getElementById("testContainer");
    newContent.classList.add('item' + dropdowns.length);
    newContent.classList.add('item');
    newContent.innerHTML = 
    `   
        <button id="${dropdowns.length}" class="delete" onclick="deleteItem(event, this.id)">&#128465;</button>
        <select id="item${dropdowns.length}" onchange="updateDropdowns()" name="item" class="extra" required>
        </select>
        <input type="number" min="1" class="qty" name="quantity" value="1" required>
    `
    contentContainer.appendChild(newContent);
    //Update the selection options
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

const itemValues = {
    "Desktop": 10,
    "Laptop": 20,
    "Mobile Phone": 15,
    "Printer": 12,
    "Modem/Router": 8,
    "Refridgerators": 25,
    "Washing Machine": 22,
    "Air Conditioner": 30,
    "Microwave": 10,
    "Iron": 5,
    "Vacuum": 7,
    "Toasters": 4,
    "Televisions (LCD, LED, CRT)": 18,
    "Audio systems (speakers, headphones, radios)": 6,
    "Any Game Consoles": 12,
    "Any Cameras": 10
}

document.getElementById("itemNext").addEventListener("click", function () {
    let totalValue = 0;
    let itemsValid = true;

    dropdowns.forEach(i => {
      const element = $(i);
      const domElement = element[0];
  
      if (!domElement.checkValidity()) {
        isPageValid = false;
        console.log("asfd")
        domElement.reportValidity();
      } else {
        dropdowns.forEach(id => {
            const itemName = $(id).val();
            const qty = $(id).siblings("input.qty").val();

            if (!itemName || !itemValues[itemName]) {
                itemsValid = false;
                return;
            }

            totalValue += itemValues[itemName] * parseInt(qty);
        });

        document.getElementById("result").textContent = `Estimated E-waste value: RM ${totalValue.toFixed(2)}`;
      }
    });
});

populateDropdowns();