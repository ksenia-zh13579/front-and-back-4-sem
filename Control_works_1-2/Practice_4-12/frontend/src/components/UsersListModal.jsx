import UserItem from "./UserItem";

export default function UsersListModal({ open, onClose, users, onEdit, onDelete }) {

    if (!open) return null;

    return (
        <div className="backdrop">
            <div 
                className="modal" 
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog" 
                aria-modal="true"
            >
                <div className="modal__header">
                    <div className="modal__title">Пользователи</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </button>
                </div>
                <div className="userMain container">
                    {!users.length ? (
                        <div className="empty">Пользователей пока нет</div>
                    ) : (
                        <div className="list">
                            {users.map((u) => (
                                <UserItem key={u.id} user={u} onEdit={onEdit} onDelete={onDelete} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};