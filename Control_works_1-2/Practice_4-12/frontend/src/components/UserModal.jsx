export default function UserModal({open, currentUser, onClose, onExit}) {

    if (!open) return null;

    let roleStr = "Пользователь";
    if (currentUser.role === "admin") roleStr = "Администратор";
    else if (currentUser.role === "seller") roleStr = "Продавец";

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
                <div className="userMain container">
                    <div className="userProperty">
                        <div className="userProperty__title">Email: </div>
                        <div className="userProperty__value">{currentUser.email}</div>
                    </div>
                    <div className="userProperty">
                        <div className="userProperty__title">Имя: </div>
                        <div className="userProperty__value">{currentUser.firstName}</div>
                    </div>
                    <div className="userProperty">
                        <div className="userProperty__title">Фамилия: </div>
                        <div className="userProperty__value">{currentUser.lastName}</div>
                    </div>
                    <div className="userProperty">
                        <div className="userProperty__title">Роль: </div>
                        <div className="userProperty__value">{roleStr}</div>
                    </div>
                    <div className="modal__footer">
                        <button className="btn btn--danger" onClick={() => onExit()}>
                            Выйти
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};