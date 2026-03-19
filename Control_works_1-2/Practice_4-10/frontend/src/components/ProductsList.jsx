import ProductItem from "./ProductItem";

// компонент списка товаров
export default function ProductsList({ currentUser, products, onEdit, onDelete }) {
    if (!products.length) {
        return <div className="empty">Товаров пока нет</div>;
    }

    return (
        <div className="list">
            {products.map((u) => (
                <ProductItem key={u.id} currentUser={currentUser} product={u} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    );
}