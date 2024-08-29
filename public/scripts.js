/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */

function setTableValues(tableId, data) {
    const tableElement = document.getElementById(tableId);
    const tableBody = tableElement.querySelector('tbody');
    const tableContent = data;

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    tableContent.forEach(item => {
        const row = tableBody.insertRow();
        Object.values(item).forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

// Fetches data from all table and displays it.
async function fetchAndDisplay(tableID, endpoint) {
    const tableElement = document.getElementById(tableID);
    if (!tableElement) {
        console.error('Table with ID $[tableID} not found');
        return;
    }
    const tableBody = tableElement.querySelector('tbody');

    try {
        const response = await fetch(endpoint, {
            method: 'GET'
        });

        const responseData = await response.json();
        const tableContent = responseData.data;

        if (tableBody) {
            tableBody.innerHTML = '';
        }

        tableContent.forEach(item => {
            const row = tableBody.insertRow();
            Object.values(item).forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// async function fetchAndDisplayUsers() {
//     const tableElement = document.getElementById('users');
//     const tableBody = tableElement.querySelector('tbody');

//     const response = await fetch('/users', {
//         method: 'GET'
//     });

//     const responseData = await response.json();
//     const demotableContent = responseData.data;

//     // Always clear old, already fetched data before new fetching process.
//     if (tableBody) {
//         tableBody.innerHTML = '';
//     }

//     demotableContent.forEach(user => {
//         const row = tableBody.insertRow();
//         user.forEach((field, index) => {
//             const cell = row.insertCell(index);
//             cell.textContent = field;
//         });
//     });
// }

// This function resets or initializes the all table.
async function reset() {
    const response = await fetch("/initiate", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "All tables initiated successfully!";
        fetchTableData();
    } else {
        alert("Error initiating table!");
    }
}

// Insertion Query
// insert username, mID, rating, title, and comments into Reviews
async function insertionQuery(e) {
    e.preventDefault();
    const username = document.getElementById('insertUsername').value;
    const mID = document.getElementById('insertmID').value;
    const rating = document.getElementById('insertRating').value;
    const title = document.getElementById('insertTitle').value;
    const comments = document.getElementById('insertComments').value;

    const response = await fetch('/insertion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            mID,
            rating,
            title,
            comments
        }),
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertionResultMessage');

    if (responseData.success) {
        messageElement.textContent = `Insertion complete!`;
        fetchTableData();
    } else {
        messageElement.textContent = `Error inserting review!`;
    }
}

// Deletion Query
// deletion of community --> cascade with MemberOf relation
async function deletionQuery(e) {
    e.preventDefault();
    const name = document.getElementById('deleteCommunityName').value;

    const response = await fetch('/deletion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
        }),
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deletionResultMessage');

    if (responseData.success) {
        messageElement.textContent = `Deletion complete!`;
        fetchTableData();
    } else {
        messageElement.textContent = `Error deleting community!`;
    }
}

// Update Query
// update Users: gender, age, email (unique)
async function updateQuery(e) {
    e.preventDefault();
    const username = document.getElementById('updateUsername').value;
    const gender = document.getElementById('updateGender').value;
    const age = document.getElementById('updateAge').value;
    const email = document.getElementById('updateEmail').value;

    const response = await fetch('/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            gender,
            age,
            email,
        }),
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateResultMessage');

    if (responseData.success) {
        messageElement.textContent = `Update complete!`;
        fetchTableData();
    } else {
        messageElement.textContent = `Error Updating User!`;
    }
}

// Join Query
// join Reviews and Media and return list of reviews for a given title
async function joinQuery(e) {
    e.preventDefault();
    const title = document.getElementById('joinTitle').value;

    const response = await fetch('/join', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title,
        }),
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('joinResultMessage');

    if (responseData.success) {
        messageElement.textContent = `Join complete!`;
        setTableValues("joinTable", responseData.data);
    } else {
        messageElement.textContent = `Error retrieving join!`;
    }
}

// Group By Query
// aggregation group by -> number of reviews per user
async function groupbyQuery(e) {
    e.preventDefault();
    const response = await fetch('/groupby', {
        method: 'GET',
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('groupbyResultMessage');

    if (responseData.success) {
        messageElement.textContent = `Group by complete!`;
        setTableValues("groupbyTable", responseData.data);
    } else {
        messageElement.textContent = `Error retrieving group by!`;
    }
}

// Having Query
// aggregation having -> crew members with at least two favourites
async function havingQuery(e) {
    e.preventDefault();
    const response = await fetch('/having', {
        method: 'GET',
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('havingResultMessage');

    if (responseData.success) {
        messageElement.textContent = `Having query complete!`;
        setTableValues("havingTable", responseData.data);
    } else {
        messageElement.textContent = `Error with having query!`;
    }
}

// Nested Query
// nested group by -> highest average rated media
async function nestedQuery(e) {
    e.preventDefault();
    const response = await fetch('/nested', {
        method: 'GET',
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('nestedResultMessage');

    if (responseData.success) {
        messageElement.textContent = `Nested query complete!`;
        setTableValues("nestedTable", responseData.data);
    } else {
        messageElement.textContent = `Error with nested query!`;
    }
}

// Division Query
// get all users who reviewed all media of a genre given by user
async function divisionQuery(e) {
    e.preventDefault();
    const genre = document.getElementById("divisionGenre").value;
    const response = await fetch('/division', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            genre,
        }),
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('divisionResultMessage');

    if (responseData.success) {
        messageElement.textContent = `Division query complete!`;
        setTableValues("divisionTable", responseData.data);
    } else {
        messageElement.textContent = `Error with division query!`;
    }
}

// Selection Query
// selection on media: mID, title, genre, date released
async function selectionQuery(e) {
    e.preventDefault();
    const text = document.getElementById("selectionText").value;
    const response = await fetch('/selection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text,
        }),
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('selectionResultMessage');

    if (responseData.success) {
        messageElement.textContent = `Selection query complete!`;
        setTableValues("selectionTable", responseData.data);
    } else {
        messageElement.textContent = `Error with Selection query!`;
    }
}

// Projection Query
// Projection on User: username, email, age, gender, date joined
async function projectionQuery(e) {
    e.preventDefault()
    const username = document.getElementById('projectUsername').checked;
    const email = document.getElementById('projectEmail').checked;
    const age = document.getElementById('projectAge').checked;
    const gender = document.getElementById('projectGender').checked;
    const date_joined = document.getElementById('projectDateJoined').checked;
    console.log(
        JSON.stringify(
            {
                "username": username,
                "email": email,
                "age": age,
                "gender": gender,
                "date_joined": date_joined
            }
    ));
    const response = await fetch('/projection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                "username": username,
                "email": email,
                "age": age,
                "gender": gender,
                "date_joined": date_joined
            }
        ),
    });
    const responseData = await response.json();
    const messageElement = document.getElementById('projectionResultMessage');

    if (responseData.success) {
        messageElement.textContent = `Projection query complete!`;
        setTableValues("projectionTable", responseData.data);
    } else {
        messageElement.textContent = `Error with Projection query!`;
    }
}

// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    fetchTableData();
    document.getElementById("reset").addEventListener("click", reset);
    document.getElementById("insertion").addEventListener("submit", insertionQuery);
    document.getElementById("deletion").addEventListener("submit", deletionQuery);
    document.getElementById("update").addEventListener("submit", updateQuery);
    document.getElementById("join").addEventListener("submit", joinQuery);
    document.getElementById("groupby").addEventListener("click", groupbyQuery);
    document.getElementById("having").addEventListener("click", havingQuery);
    document.getElementById("nested").addEventListener("click", nestedQuery);
    document.getElementById("division").addEventListener("submit", divisionQuery);
    document.getElementById("selection").addEventListener("submit", selectionQuery);
    document.getElementById("projection").addEventListener("submit", projectionQuery);
};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    // fetchAndDisplayUsers();
    fetchAndDisplay('users', '/users');
    fetchAndDisplay('media', '/media');
    fetchAndDisplay('reviews', '/reviews');
    fetchAndDisplay('discussion_board', '/discussion_board');
    fetchAndDisplay('board_status', '/board_status');
    fetchAndDisplay('popularity', '/popularity');
    fetchAndDisplay('post', '/post');
    fetchAndDisplay('community', '/community');
    fetchAndDisplay('crew_member', '/crew_member');
    fetchAndDisplay('studio', '/studio');
    fetchAndDisplay('show', '/show');
    fetchAndDisplay('movie', '/movie');
    fetchAndDisplay('reliability', '/reliability');
    fetchAndDisplay('has_episode', '/has_episode');
    fetchAndDisplay('member_of', '/member_of');
    fetchAndDisplay('contain', '/contain');
    fetchAndDisplay('makes_post', '/makes_post');
    fetchAndDisplay('has_favourite', '/has_favourite');
    fetchAndDisplay('worked_on', '/worked_on');
    fetchAndDisplay('produced', '/produced');
}

// General function that shows the table being selected
function showTable(tableId) {
    // NEED TO ADD TABLES THAT ARE IN QUERIES SO THEY AREN'T HIDDEN FOREVER WHEN TABLE SELECTION GET'S RUN
    const queryTables = ["joinTable", "groupbyTable", "havingTable", "nestedTable", "divisionTable", "selectionTable", "projectionTable"];
    document.querySelectorAll('table').forEach(table => {
        if (!queryTables.includes(table.id)) {
            table.className = 'hide';
        }
    });

    document.getElementById(tableId).className = 'show';
}

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.className = 'hide';
    });

    document.getElementById(sectionId).className = 'showSection';
};