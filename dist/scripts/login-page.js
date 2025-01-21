"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const showLoginLink = document.getElementById('showLogin');
    const showRegisterLink = document.getElementById('showRegister');
    const registerFormElement = document.getElementById('registerForm');
    const loginFormElement = document.getElementById('loginForm');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    const registerErrorText = document.getElementById('registerErrorText');
    const loginErrorText = document.getElementById('loginErrorText');
    const registerSuccessText = document.getElementById('registerSuccessText');
    // Переключение на форму входа
    showLoginLink.addEventListener('click', (event) => {
        event.preventDefault();
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        registerErrorText.style.display = 'none';
        registerSuccessText.style.display = 'none';
    });
    // Переключение на форму регистрации
    showRegisterLink.addEventListener('click', (event) => {
        event.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        registerErrorText.style.display = 'none';
        registerSuccessText.style.display = 'none';
    });
    // Отправка формы регистрации на сервер
    registerFormElement.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = registerEmail.value;
        const password = registerPassword.value;
        if (email && password) {
            try {
                const response = await fetch('http://localhost:3000/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result.status === 'success') {
                        // Показываем успешное сообщение в форме регистрации
                        registerSuccessText.textContent = 'Регистрация прошла успешно!';
                        registerSuccessText.style.color = 'green';
                        registerSuccessText.style.display = 'block';
                        registerErrorText.style.display = 'none';
                        // Переход на форму входа
                        loginForm.style.display = 'block';
                        registerForm.style.display = 'none';
                        // Добавляем сообщение об успешной регистрации в форме входа
                        const loginSuccessText = document.createElement('p');
                        loginSuccessText.textContent = 'Вы успешно зарегистрированы. Можете войти!';
                        loginSuccessText.style.color = 'green';
                        loginForm.insertBefore(loginSuccessText, loginFormElement);
                    }
                    else {
                        registerErrorText.textContent = result.message || 'Произошла ошибка при регистрации.';
                        registerErrorText.style.color = 'red';
                        registerErrorText.style.display = 'block';
                        registerSuccessText.style.display = 'none';
                    }
                }
                else {
                    const errorData = await response.json();
                    registerErrorText.textContent = errorData.message || 'Произошла ошибка при регистрации. Попробуйте снова.';
                    registerErrorText.style.color = 'red';
                    registerErrorText.style.display = 'block';
                    registerSuccessText.style.display = 'none';
                }
            }
            catch (error) {
                registerErrorText.textContent = 'Произошла ошибка при регистрации. Попробуйте снова.';
                registerErrorText.style.color = 'red';
                registerErrorText.style.display = 'block';
                registerSuccessText.style.display = 'none';
            }
        }
        else {
            registerErrorText.textContent = 'Пожалуйста, заполните все поля.';
            registerErrorText.style.color = 'red';
            registerErrorText.style.display = 'block';
            registerSuccessText.style.display = 'none';
        }
    });
    // Отправка формы логина на сервер
    loginFormElement.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = loginEmail.value;
        const password = loginPassword.value;
        if (email && password) {
            try {
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result.status === 'success') {
                        // Переход на страницу редактора
                        window.location.href = 'design-editor.html'; // Переход на другую страницу
                    }
                    else {
                        loginErrorText.textContent = result.message || 'Произошла ошибка при входе.';
                        loginErrorText.style.color = 'red';
                        loginErrorText.style.display = 'block';
                    }
                }
                else {
                    const errorData = await response.json();
                    loginErrorText.textContent = errorData.message || 'Произошла ошибка при входе. Попробуйте снова.';
                    loginErrorText.style.color = 'red';
                    loginErrorText.style.display = 'block';
                }
            }
            catch (error) {
                loginErrorText.textContent = 'Произошла ошибка при входе. Попробуйте снова.';
                loginErrorText.style.color = 'red';
                loginErrorText.style.display = 'block';
            }
        }
        else {
            loginErrorText.textContent = 'Пожалуйста, заполните все поля.';
            loginErrorText.style.color = 'red';
            loginErrorText.style.display = 'block';
        }
    });
});
//# sourceMappingURL=login-page.js.map