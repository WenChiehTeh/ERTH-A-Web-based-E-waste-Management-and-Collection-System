$(".add").addClass("current");

function toggleDriverFields() {
    const role = $('#role').val();

    if (role === 'Driver') {
        $('#driverFields').removeClass('hidden');
        $('#vehicle').prop('required', true);
        $('#numberPlate').prop('required', true);
    } else {
        $('#driverFields').addClass('hidden');
        $('#vehicle').prop('required', false);
        $('#numberPlate').prop('required', false);
    }
}