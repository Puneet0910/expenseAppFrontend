const amount = document.querySelector("#amount");
const description = document.querySelector("#description");
const category = document.querySelector("#category");
const ulItems = document.querySelector("#item-list");
const form = document.querySelector("#form");
const buyButton = document.querySelector("#rzp-btn1");
const buyText = document.querySelector("#premium-p");

const pagination = document.querySelector("#pagination");

const leaderBoard = document.querySelector("#leader-board");

const api = "http://16.170.204.153:3000/expense";

// Submit Expense Form
async function onSubmit(e) {
  e.preventDefault();

  const expDets = {
    amount: amount.value,
    description: description.value,
    category: category.value,
  };
  const token = localStorage.getItem("token");
  await axios.post(`${api}/addExpense`, expDets, {
    headers: { Authorization: token },
  });
  alert('Expense Added Successfully');
  window.location.reload();
}

// Create Delete Button
function delButton(obj) {
  const delBtn = document.createElement("button");
  delBtn.className = "btn btn-danger ml-3"; // Added Bootstrap classes for button styling and margin
  delBtn.appendChild(document.createTextNode("Delete Expense"));
  delBtn.addEventListener("click", (e) => deleteBtn(e, obj));

  return delBtn;
}

// Handle Delete Button Click
async function deleteBtn(e, obj) {
  const token = localStorage.getItem("token");

  let li = e.target.parentElement;

  await axios.delete(`${api}/deleteExpense/${obj.id}`, {
    headers: { Authorization: token },
  });

  ulItems.removeChild(li);
}

// Create Expense List Item
function li(obj) {
  const li = document.createElement("li");
  li.className = "list-group-item d-flex justify-content-between align-items-center"; // Added Bootstrap classes for responsive list styling
  li.appendChild(
    document.createTextNode(`${obj.amount} - ${obj.description} - ${obj.category}`)
  );
  li.appendChild(delButton(obj)); // Delete button after expense details with spacing
  ulItems.appendChild(li);
}

// Handle Expense Form Submission
form.addEventListener("submit", onSubmit);

///// Get Expenses
async function getExpenses(pagesize = 1) {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${api}/getExpenses?page=${pagesize}`, {
    headers: { Authorization: token },
  });

  ulItems.innerHTML = "";

  if (response.data.expenses.length !== 0) {
    for (let i = 0; i < response.data.expenses.length; i++) {
      li(response.data.expenses[i]);
      showPagination(response.data);
    }
  }

  if (response.data.userDetails.ispremiumuser) {
    buyButton.style.display = "none";
    buyText.style.display = "";
    buyText.innerHTML = "You are a premium user now";

    document.getElementById("downloadexpense").style.display = "block";
    document.getElementById("leader-board").style.display = "block";
  } else {
    document.getElementById("downloadexpense").style.display = "none";
    document.getElementById("leader-board").style.display = "none";
  }
}

window.addEventListener("DOMContentLoaded", getExpenses);

document.getElementById("rzp-btn1").onclick = async function (e) {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    "http://16.170.204.153:3000/purchase/premiummembership",
    { headers: { Authorization: token } }
  );

  var options = {
    key: response.data.key_id,
    order_id: response.data.order.id,
    handler: async function (response) {
      await axios.post(
        "http://16.170.204.153:3000/purchase/updatetransactionstatus",
        {
          order_id: options.order_id,
          payment_id: response.razorpay_payment_id,
        },
        { headers: { Authorization: token } }
      );
      alert("You are a Premium User Now");
      location.reload();
    },
  };

  const rzp1 = new Razorpay(options);
  rzp1.open();
  e.preventDefault();
  rzp1.on("payment.failed", function (response) {
    alert("Something went wrong");
    alert(response.error.code);
    alert(response.error.description);
    alert(response.error.source);
    alert(response.error.step);
    alert(response.error.reason);
    alert(response.error.metadata.order_id);
    alert(response.error.metadata.payment_id);
  });
};

// Leaderboard
leaderBoard.addEventListener("click", async () => {
  const responses = await axios.get(
    "http://16.170.204.153:3000/premium/showLeaderBoard"
  );

  var div = document.getElementById("leader-board-list");

  if (responses.data.results.length > 0) {
    for (let i = 0; i < responses.data.results.length; i++) {
      const li = document.createElement("li");
      li.className = "list-group-item"; // Bootstrap class for styling leaderboard list
      document.getElementById("board-list").style.display = "block";
      li.textContent = `Name: ${responses.data.results[i].name} Total Expense: ${responses.data.results[i].totalExpense}`;

      div.appendChild(li);
    }
  }
});

// Download File
function showError(err) {
  document.body.innerHTML += `<div style="color:red;"> ${err}</div>`;
}

function download() {
  const token = localStorage.getItem("token");
  axios
    .get("http://16.170.204.153:3000/user/download", {
      headers: { Authorization: token },
    })
    .then((response) => {
      if (response.status === 200) {
        var a = document.createElement("a");
        a.href = response.data.fileUrl;
        a.download = "myexpense.csv";
        a.click();
      } else {
        throw new Error(response.data.message);
      }
    })
    .catch((err) => {
      showError(err);
    });
}

// Show Pagination
function showPagination({
  currentPage,
  hasNextPage,
  nextPage,
  hasPreviousPage,
  previosPage,
  lastPage,
}) {
  pagination.innerHTML = "";
  
  // Previous Page Button
  if (hasPreviousPage) {
    const btn2 = document.createElement("button");
    btn2.className = "btn btn-outline-secondary m-2"; // Bootstrap for button style and spacing
    btn2.innerHTML = previosPage;
    btn2.addEventListener("click", () => {
      getExpenses(previosPage);
    });
    pagination.appendChild(btn2);
  }

  // Current Page Button
  const btn1 = document.createElement("button");
  btn1.className = "btn btn-primary m-2"; // Bootstrap primary button with margin
  btn1.innerHTML = `<h3>${currentPage}</h3>`;
  btn1.addEventListener("click", () => {
    getExpenses(currentPage);
  });
  pagination.appendChild(btn1);

  // Next Page Button
  if (hasNextPage) {
    const btn3 = document.createElement("button");
    btn3.className = "btn btn-outline-secondary m-2"; // Bootstrap for button style and spacing
    btn3.innerHTML = nextPage;
    btn3.addEventListener("click", () => {
      getExpenses(nextPage);
    });
    pagination.appendChild(btn3);
  }
}
