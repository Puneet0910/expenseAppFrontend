const email = document.querySelector("#email");
const password = document.querySelector("#password");
const form = document.querySelector("#form");

async function onLogin(e) {
  e.preventDefault();

  const loginDetails = {
    email: email.value,
    password: password.value,
  };

  try {
    const response = await axios.post("http://localhost:3000/user/login", loginDetails);

    if (response.status === 200) {
      alert(response.data.message);
      localStorage.setItem("token", response.data.token);
      window.location.href = "./expense.html";
    }
  } catch (err) {
    // Handle different error status codes
    if (err.response) {
      const status = err.response.status;
      let errorMessage;

      if (status === 400) {
        errorMessage = "Bad request: Email or password is missing.";
      } else if (status === 404) {
        errorMessage = "User not found. Please sign up.";
      } else if (status === 401) {
        errorMessage = "Incorrect password. Please try again.";
      } else if (status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage = "Login failed. Please try again.";
      }

      // Show error alert
      alert(errorMessage);
    } else {
      // Handle other errors (e.g., network issues)
      alert("An error occurred. Please try again.");
    }
  }
}

form.addEventListener("submit", onLogin);

// Function for Forgot Password
function forgotPassword(e) {
  window.location.href = './forgot.html';
}
