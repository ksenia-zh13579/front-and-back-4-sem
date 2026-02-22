

export default function ProductItem({ product, onEdit, onDelete }) {
    return (
        <div className="productCard">
            <div className="productMain">
                <div className="productId">#{product.id}</div>
                <div className="productName">{product.name}</div>
                <div className="productCategory">Категория: {product.category}</div>
                <div className="productDescription">{product.description}</div>
                <div className="productPrice">Цена: {product.price} руб.</div>
                <div className="productQuantity">В наличии: {product.quantity} шт.</div>
            </div>
            <div className="productActions">
                <button className="btn" onClick={() => onEdit(product)}>
                    Редактировать
                </button>
                <button className="btn btn--danger" onClick={() => onDelete(product.id)}>
                    Удалить
                </button>
            </div>
        </div>
    );
}