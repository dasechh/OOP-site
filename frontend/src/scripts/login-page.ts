document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form") as HTMLElement;
  const registerForm = document.querySelector(".register-form") as HTMLElement;
  const showLoginLink = document.getElementById("showLogin") as HTMLElement;
  const showRegisterLink = document.getElementById(
    "showRegister"
  ) as HTMLElement;
  const registerFormElement = document.getElementById(
    "registerForm"
  ) as HTMLFormElement;
  const loginFormElement = document.getElementById(
    "loginForm"
  ) as HTMLFormElement;
  const loginEmail = document.getElementById("loginEmail") as HTMLInputElement;
  const loginPassword = document.getElementById(
    "loginPassword"
  ) as HTMLInputElement;
  const registerEmail = document.getElementById(
    "registerEmail"
  ) as HTMLInputElement;
  const registerPassword = document.getElementById(
    "registerPassword"
  ) as HTMLInputElement;
  const registerErrorText = document.getElementById(
    "registerErrorText"
  ) as HTMLElement;
  const loginErrorText = document.getElementById(
    "loginErrorText"
  ) as HTMLElement;
  const registerSuccessText = document.getElementById(
    "registerSuccessText"
  ) as HTMLElement;

  showLoginLink.addEventListener("click", (event) => {
    event.preventDefault();
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    registerErrorText.style.display = "none";
    registerSuccessText.style.display = "none";
  });

  showRegisterLink.addEventListener("click", (event) => {
    event.preventDefault();
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    registerErrorText.style.display = "none";
    registerSuccessText.style.display = "none";
  });

  registerFormElement.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = registerEmail.value;
    const password = registerPassword.value;

    if (email && password) {
      try {
        const response = await fetch("http://localhost:3000/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const result = await response.json();

          if (result.status === "success") {
            registerSuccessText.textContent = "Регистрация прошла успешно!";
            registerSuccessText.style.color = "green";
            registerSuccessText.style.display = "block";
            registerErrorText.style.display = "none";
            loginForm.style.display = "block";
            registerForm.style.display = "none";

            const loginSuccessText = document.createElement("p");
            loginSuccessText.textContent =
              "Вы успешно зарегистрированы. Можете войти!";
            loginSuccessText.style.color = "green";
            loginForm.insertBefore(loginSuccessText, loginFormElement);
          } else {
            registerErrorText.textContent =
              result.message || "Произошла ошибка при регистрации.";
            registerErrorText.style.color = "red";
            registerErrorText.style.display = "block";
            registerSuccessText.style.display = "none";
          }
        } else {
          const errorData = await response.json();
          registerErrorText.textContent =
            errorData.message ||
            "Произошла ошибка при регистрации. Попробуйте снова.";
          registerErrorText.style.color = "red";
          registerErrorText.style.display = "block";
          registerSuccessText.style.display = "none";
        }
      } catch (error) {
        registerErrorText.textContent =
          "Произошла ошибка при регистрации. Попробуйте снова.";
        registerErrorText.style.color = "red";
        registerErrorText.style.display = "block";
        registerSuccessText.style.display = "none";
      }
    } else {
      registerErrorText.textContent = "Пожалуйста, заполните все поля.";
      registerErrorText.style.color = "red";
      registerErrorText.style.display = "block";
      registerSuccessText.style.display = "none";
    }
  });

  loginFormElement.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = loginEmail.value;
    const password = loginPassword.value;

    if (email && password) {
      try {
        const response = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const result = await response.json();

          if (result.status === "success") {
            localStorage.setItem("user_email", email);

            window.location.href = "main-menu.html";
          } else {
            loginErrorText.textContent =
              result.message || "Произошла ошибка при входе.";
            loginErrorText.style.color = "red";
            loginErrorText.style.display = "block";
          }
        } else {
          const errorData = await response.json();
          loginErrorText.textContent =
            errorData.message ||
            "Произошла ошибка при входе. Попробуйте снова.";
          loginErrorText.style.color = "red";
          loginErrorText.style.display = "block";
        }
      } catch (error) {
        loginErrorText.textContent =
          "Произошла ошибка при входе. Попробуйте снова.";
        loginErrorText.style.color = "red";
        loginErrorText.style.display = "block";
      }
    } else {
      loginErrorText.textContent = "Пожалуйста, заполните все поля.";
      loginErrorText.style.color = "red";
      loginErrorText.style.display = "block";
    }
  });
});
