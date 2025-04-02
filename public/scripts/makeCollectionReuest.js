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

//function to check if selected date is more than 7 days later or not
function isDate7DaysOrMoreAfterToday(dateInput) {
    const selectedDate = new Date(dateInput.value);
    const currentDate = new Date();
  
    // Set time to midnight for accurate comparison
    currentDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
  
    // Calculate the date 7 days from today
    const sevenDaysFromToday = new Date(currentDate);
    sevenDaysFromToday.setDate(currentDate.getDate() + 7);
  
    // Ensure selected date is strictly 7 days ahead or more
    return selectedDate.getTime() >= sevenDaysFromToday.getTime();
}

//button to go from items page to date page
$("#itemNext").on("click", function (event) {
    event.preventDefault();
  
    var isPageValid = true;
  
    dropdowns.forEach(i => {
      const element = $(i);
      const domElement = element[0];
  
      if (!domElement.checkValidity()) {
        isPageValid = false;
        domElement.reportValidity();
      }
    });
  
    if (isPageValid) {
        $("#itemForm").slideUp(500, function() {
            $("#dateForm").slideDown(750);
        });
    }
});

//button to go from date page to details page
$("#dateNext").on("click", function (event) {
    event.preventDefault();

    var isPageValid = true;
  
    const element = $("#date");
    const domElement = element[0];
  
    if (!isDate7DaysOrMoreAfterToday(domElement)) {
        isPageValid = false
        domElement.setCustomValidity("Please select a date 7 days or more from today.");
        domElement.reportValidity();
    }

    if (isPageValid) {
        domElement.setCustomValidity("");
        $("#dateForm").slideUp(500, function() {
            $("#detailsForm").slideDown(750);
        });
    }
});

//button to go from details page to payment page
$("#detailsNext").on("click", function (event) {
    event.preventDefault();

    var isPageValid = true;
    var elements = ["#firstName", "#lastName", "#phoneNo", "#addressLine1", "#addressLine2", "#postcode", "#area", "#state"]
  
    elements.forEach(i => {
      const element = $(i);
      const domElement = element[0];
  
      if (!domElement.checkValidity()) {
        isPageValid = false;
        domElement.reportValidity();
      }
    });

    if (isPageValid) {
        $("#detailsForm").slideUp(500, function() {
            $("#paymentForm").slideDown(750);
        });
    }
});

//checks if user has chosen a payment method
$(".submit").on("click", function (event) {
    event.preventDefault();

    var isPageValid = true;
  
    const element = $("#Credit\\/Debit\\ Card")
    const domElement = element[0];
  
    if (!domElement.checkValidity()) {
        console.log(!domElement.checkValidity());
        isPageValid = false;
        $("#errorPayment").html("Please choose a payment method!");
      } else {
        $("form").submit();
      }
});

//button to go from payment page back to details page
$("#paymentBack").on("click", function (event) {
    event.preventDefault();

    $("#paymentForm").slideUp(500, function() {
        $("#detailsForm").slideDown(750);
    });
});

//button to go from details page back to date page
$("#detailsBack").on("click", function (event) {
    event.preventDefault();

    $("#detailsForm").slideUp(500, function() {
        $("#dateForm").slideDown(750);
    });
});

//button to go from date page back to items page
$("#dateBack").on("click", function (event) {
    event.preventDefault();

    $("#dateForm").slideUp(500, function() {
        $("#itemForm").slideDown(750);
    });
});

//function to set route base on payment options
function setRoute(route) {
    $("#recycleForm").attr("action", route);
}

// Initialize dropdowns on page load
populateDropdowns();

//hide all pages except items page
$("#detailsForm").hide();
$("#dateForm").hide();
$("#paymentForm").hide();