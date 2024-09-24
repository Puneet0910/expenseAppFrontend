const name = document.querySelector("#name");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const form = document.querySelector("#form");

async function onSignup(e) {
  try {
    e.preventDefault();
    const signUpDetails = {
      name: name.value,
      email: email.value,
      password: password.value,
    };
    const response = await axios.post(
      "http://localhost:3000/user/signup",
      signUpDetails
    );

    if (response.status === 201) {
      window.location.href = "./login.html";
    } else {
      throw new Error("Signup failed");
    }
  } catch (err) {
    if (err.response && err.response.status === 409) {
      // Display alert for duplicate email
      alert('Email already in use. Please use a different email');
    } else {
      // Handle other errors
      document.body.innerHTML += `<div style="color:red">${err}</div>`;
    }
  }
}

form.addEventListener("submit", onSignup);
