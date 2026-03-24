// компонент карточки пользователя
export default function UserItem({ user, onEdit, onDelete }) {
    let roleStr = "Пользователь";
    if (user.role === "admin") roleStr = "Администратор";
    else if (user.role === "seller") roleStr = "Продавец";

    return (
        <div className="productCard">
            <div className="userMain container">
                <div className="userProperty">
                    <div className="userProperty__title">Email: </div>
                    <div className="userProperty__value">{user.email}</div>
                </div>
                <div className="userProperty">
                    <div className="userProperty__title">Имя: </div>
                    <div className="userProperty__value">{user.firstName}</div>
                </div>
                <div className="userProperty">
                    <div className="userProperty__title">Фамилия: </div>
                    <div className="userProperty__value">{user.lastName}</div>
                </div>
                <div className="userProperty">
                    <div className="userProperty__title">Роль: </div>
                    <div className="userProperty__value">{roleStr}</div>
                </div>
            </div>
            <div className="productActions">
                <button className="btn" onClick={() => onEdit(user)}>
                    Редактировать
                </button>
                <button className="btn btn--danger" onClick={() => onDelete(user.id)}>
                    Удалить
                </button>
            </div>
        </div>
    );
}