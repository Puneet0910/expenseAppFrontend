const email = document.querySelector("#email");

function forgotPassword(e) {
  e.preventDefault();

  const form = new FormData(e.target);

  const userDetails = {
    email: form.get("email"),
  };
  // console.log(userDetails);

  axios.post("http://16.171.28.90:3000/password/forgotPassword", userDetails, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then((response) => {
    console.log(response);
    if (response.status === 200) {
      document.body.innerHTML +=
        '<div style="color:red;">Mail Successfully sent <div>';
    } else {
      throw new Error("Something went wrong!!!");
    }
  })
  .catch((err) => {
    console.log("**********************");
    document.body.innerHTML += `<div style="color:red;">${err.message} <div>`;
  });
  
}
