export default function UserModal({open, currentUser, onClose}) {
    if (!open) return null;

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
                </div>
            </div>
        </div>
    );
};