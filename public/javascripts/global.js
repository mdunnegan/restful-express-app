
/* GET, POST, and DELETE are from
 * http://garrilla.logdown.com/posts/192327-rest-follow-up-excercise
 *
 * POST implemented by Michael Dunnegan
 *
*/

// Userlist data array for filling in info box
var userListData = [];
var positionOfUserToUpdate;

// DOM Ready =============================================================

/*
 * Nifty section. Calls actions from their click location. Down below are the details
 * of the actions. Well organized! Bravo, node!
 *
*/
$(document).ready(function() {

    // Populate the user table on initial page load
    populateTable();

    // show
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

    // delete
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

    // By Michael Dunnegan

    // prepares form for updating a user
    $('#userList table tbody').on('click', 'td a.linkupdateuser', populateFieldset);

    // Adapted from a dude on stack overflow, JLRishe
    // http://stackoverflow.com/questions/27641018/id-of-button-changes-but-document-ready-function-calls-previous-values-method
    // POST and PUT handles the switch between add and update
    $('#btnUserAction').on('click', function (e) {
        var action = ($(this).attr("data-action") === "add") ? addUser : updateUser;
        action.call(this, e);
    });

    // cancels update
    $('#addUser fieldset #btnCancelUpdate').on('click', cancelUpdate);

});

// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/userlist', function( data ) {

        userListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '" title="Show Details">' + this.username + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '<td><a href="#" class="linkupdateuser" rel="' + this._id + '">update</a></td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
};

// Michael Dunnegan
function cancelUpdate(event){

    // change data-attribute of update button
    $('#btnUserAction').attr('data-action', "add");

    // update header
    $('#addUserHeader').text("Add User");

    // update button text
    $('#btnUserAction').text('Add User');

    // remove cancel button
    document.getElementById("btnCancelUpdate").className = "hidden";

    // clear fields
    $('#addUser fieldset input#inputUserName').val("");
    $('#addUser fieldset input#inputUserEmail').val("");
    $('#addUser fieldset input#inputUserFullname').val("");
    $('#addUser fieldset input#inputUserAge').val("");
    $('#addUser fieldset input#inputUserLocation').val("");
    $('#addUser fieldset input#inputUserGender').val("");
}

// Michael Dunnegan
// for use in PUT
function populateFieldset(event){

    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserId = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem._id; }).indexOf(thisUserId);

    // Get User Object
    var thisUserObject = userListData[arrayPosition];

    // store this in a global >:(
    positionOfUserToUpdate = arrayPosition;

    // Update info box header
    $('#wrapper #addUser #addUserHeader').text("Update "+thisUserObject.username);

    // change btnUserAction to have data-action 'update', so it'll function differently
    $('#btnUserAction').text('Update');
    $('#btnUserAction').attr('data-action', 'update');
    
    //Populate Info Box
    $('#addUser fieldset input#inputUserName').val(thisUserObject.username);
    $('#addUser fieldset input#inputUserEmail').val(thisUserObject.email);
    $('#addUser fieldset input#inputUserFullname').val(thisUserObject.fullname);
    $('#addUser fieldset input#inputUserAge').val(thisUserObject.age);
    $('#addUser fieldset input#inputUserLocation').val(thisUserObject.location);
    $('#addUser fieldset input#inputUserGender').val(thisUserObject.gender);

    // we're just going to unhide the hidden cancel button
    document.getElementById("btnCancelUpdate").className = "";

};

// Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

    // Get our User Object
    var thisUserObject = userListData[arrayPosition];

    // change name of header
    $('#userInfoHeader').text(thisUserObject.username);

    //Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfoGender').text(thisUserObject.gender);
    $('#userInfoLocation').text(thisUserObject.location);
};

// Add User
function addUser(event) {

    console.log("addUser called");
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'fullname': $('#addUser fieldset input#inputUserFullname').val(),
            'age': $('#addUser fieldset input#inputUserAge').val(),
            'location': $('#addUser fieldset input#inputUserLocation').val(),
            'gender': $('#addUser fieldset input#inputUserGender').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addUser fieldset input').val('');

                // Update the table
                populateTable();
            }
            else {
                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);
            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Michael Dunnegan, adapted from addUser
function updateUser(event, id){

    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        userToUpdate = userListData[positionOfUserToUpdate];

        var updatedUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'fullname': $('#addUser fieldset input#inputUserFullname').val(),
            'age': $('#addUser fieldset input#inputUserAge').val(),
            'location': $('#addUser fieldset input#inputUserLocation').val(),
            'gender': $('#addUser fieldset input#inputUserGender').val()
        };

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'PUT',
            data: updatedUser, 
            url: '/users/updateuser/' + userToUpdate._id,
            dataType: 'JSON'
        }).done(function(response) {

            console.log('done');

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addUser fieldset input').val('');

                // Update the table
                populateTable();

                // set data action to add
                cancelUpdate();
            }
            else {
                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);
            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
}

// Delete User
function deleteUser(event) {

    event.preventDefault();
    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {
        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function( response ) {
            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();
        });
    }
    else {
        // If they said no to the confirm, do nothing
        return false;
    }
};

