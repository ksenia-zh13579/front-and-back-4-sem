import { useEffect, useState } from "react";

// компонент модального окна для редактирования товара
export default function UserChange({ open, onClose, initialUser, onSubmit }) {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("");

    // установка значений в поля ввода
    useEffect(() => {
        if (!open) return;
        setEmail(initialUser.email);
        setFirstName(initialUser.firstName);
        setLastName(initialUser.lastName);
        setRole(initialUser.role);
    }, [open, initialUser]);

    if (!open) return null;

    // обработка отправки формы
    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedEmail = email.trim();
        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!trimmedEmail || !emailRegex.test(trimmedEmail))
        {
            alert("Введите корректный email");
            return;
        }

        if (!trimmedFirstName) {
                alert("Введите имя");
                return;
        }

        if (!trimmedLastName) {
            alert("Введите фамилию");
            return;
        }

        if (!role) {
            alert("Выберете роль");
            return;
        }

        onSubmit({
            id: initialUser.id,
            email: trimmedEmail,
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            role: role,
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div 
                className="modal" 
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog" 
                aria-modal="true"
            >
                <div className="modal__header">
                    <div className="modal__title">Данные пользователя</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </button>
                </div>
                <form className="form" onSubmit={handleSubmit}>
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
                        Роль в системе
                        <select
                            className="input"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="user">Пользователь</option>
                            <option value="seller">Продавец</option>
                            <option value="admin">Администратор</option>
                        </select>
                    </label>
                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--primary">
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}