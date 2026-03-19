import { useState } from "react";

// компонент модального окна для создания/редактирования продукта
export default function LoginModal({ open, mode, onClose, onSubmit, openRegister }) 
{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isSeller, setIsSeller] = useState(false);

    if (!open) return null;

    const title = mode === "login" ? "Вход" : "Регистрация";

    // обработка отправки формы
    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedEmail = email.trim();
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!trimmedEmail || !emailRegex.test(trimmedEmail))
        {
            alert("Введите корректный email");
            return;
        }

        if (mode === "login")
        {
            const trimmedPassword = password.trim();

            if (!trimmedPassword) {
                alert("Введите пароль");
                return;
            }

            setEmail("");
            setPassword("");

            onSubmit({
                email: trimmedEmail,
                password: trimmedPassword
            });
        }
        else {
            const trimmedFirstName = firstName.trim();
            const trimmedLastName = lastName.trim();
            const trimmedPassword = password.trim();
            const trimmedRepeatPassword = repeatPassword.trim();
            const roleStr = (isSeller ? "seller" : "user");

            if (!trimmedFirstName) {
                alert("Введите имя");
                return;
            }

            if (!trimmedLastName) {
                alert("Введите фамилию");
                return;
            }

            if (!trimmedPassword || /[А-Яа-я]/.test(trimmedPassword) || !/\w/.test(trimmedPassword) || !/\d/.test(trimmedPassword)) {
                alert("Введите корректный пароль (должен содержать только латинские буквы (не меньше 1й) и хотя бы 1 цифру)");
                return;
            }

            if (!trimmedRepeatPassword) {
                alert("Повторите пароль");
                return;
            }

            if (trimmedPassword !== trimmedRepeatPassword) {
                alert("Введенные пароли должны совпадать");
                return;
            }

            setEmail("");
            setPassword("");
            setRepeatPassword("");
            setFirstName("");
            setLastName("");
            setIsSeller(false);

            onSubmit({
                email: trimmedEmail,
                firstName: trimmedFirstName,
                lastName: trimmedLastName,
                password: trimmedPassword,
                role: roleStr
            });
        }
    }

    return (
        <div className="backdrop">
            <div 
                className="modal" 
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog" 
                aria-modal="true"
            >
                <div className="modal__header">
                    <div className="modal__title">{title}</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </button>
                </div>
                <form className="form" onSubmit={handleSubmit}>
                    {mode === "login" ? (
                        <>
                            <label className="label">
                                email
                                <input
                                    className="input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Например, example@gmail.com"
                                    inputMode="email"
                                    autoFocus
                                />
                            </label>
                            <label className="label">
                                Пароль
                                <input
                                    className="input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Например, qwerty123"
                                />
                            </label>
                        </>
                    ) : (
                        <>
                            <label className="label">
                                email
                                <input
                                    className="input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Например, example@gmail.com"
                                    inputMode="email"
                                    autoFocus
                                />
                            </label>
                            <label className="label">
                                Имя
                                <input
                                    className="input"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Например, Анна"
                                />
                            </label>
                            <label className="label">
                                Фамилия
                                <input
                                    className="input"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Например, Кузнецова"
                                />
                            </label>
                            <label className="label">
                                Пароль
                                <input
                                    className="input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Например, qwerty123"
                                />
                            </label>
                            <label className="label">
                                Повторите пароль
                                <input
                                    className="input"
                                    value={repeatPassword}
                                    onChange={(e) => setRepeatPassword(e.target.value)}
                                />
                            </label>
                            <label className="label__checkbox">
                                <input 
                                    className="input__checkbox" 
                                    type="checkbox" 
                                    name="role" 
                                    onChange={(e) => setIsSeller(e.target.checked)}
                                />
                                Я продавец
                            </label>
                        </>
                    )}
                    
                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--primary">
                            {mode === "login" ? "Войти" : "Зарегистрироваться"}
                        </button>
                    </div>
                    {mode === "login" ? (
                        <div className="modal__link">
                            Ещё нет аккаунта? 
                            <span onClick={openRegister}> 
                                Зарегистрироваться
                            </span>
                        </div>
                    ) : (
                        <></>
                    )}
                </form>
            </div>
        </div>
    );
}