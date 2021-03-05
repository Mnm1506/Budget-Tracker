let db;
// Creates a new db "myBudget" database :
const request = indexedDB.open("myBudget", 1);

request.onupgradeneeded = function (event) {
    // object store called "pending" set autoIncrement to true :
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
    // checks if app is online before reading from db :
    if (navigator.onLine) {
        checkDatabase()
    }
};

// Error handling :
request.onerror = function (event) {
    console.log("Error" + event.target.errorCode)
};

// Saves records into db :
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
};

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    accept: "application/json, text/plain, */*",
                    "content-type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
};
// listen for app coming back online :
window.addEventListener("online", checkDatabase);