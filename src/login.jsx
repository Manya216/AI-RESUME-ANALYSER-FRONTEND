async function login() {

  const response = await fetch(

    `http://127.0.0.1:8000/login?email=${email}&password=${password}`,

    {
      method: "POST"
    }
  )

  const data = await response.json()


  if (data.access_token) {

    setToken(data.access_token)

    localStorage.setItem(

      "token",

      data.access_token
    )

    alert("Login successful")
  }

  else {

    alert(data.message)
  }
}