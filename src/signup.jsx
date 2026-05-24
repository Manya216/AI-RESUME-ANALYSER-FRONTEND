async function signup() {
  const response = await fetch(
    "https://ai-resume-analyser-backend-3.onrender.com/signup",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password
      })
    }
  );

  const data = await response.json();

  console.log("SIGNUP RESPONSE:", data);

  alert(data.message || "Signup completed");
}