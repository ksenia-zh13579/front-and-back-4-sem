import { useEffect, useState } from "react";

// компонент модального окна для создания/редактирования продукта
export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    // установка значений в поля ввода
    useEffect(() => {
        if (!open) return;
        setName(initialProduct?.name ?? "");
        setCategory(initialProduct?.category ?? "");
        setDescription(initialProduct?.description ?? "");
        setPrice(initialProduct?.price != null ? String(initialProduct.price) : "");
        setQuantity(initialProduct?.quantity != null ? String(initialProduct.quantity) : "");
        setImageUrl(initialProduct?.imageUrl != null ? String(initialProduct.imageUrl) : "" );
    }, [open, initialProduct]);

    if (!open) return null;

    const title = mode === "edit" ? "Редактирование товара" : "Создание товара";

    // обработка отправки формы
    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedName = name.trim();
        const trimmedCategory = category.trim();
        const trimmedDescription = description.trim();
        const parsedPrice = Number(price);
        const parsedQuantity = Number(quantity);
        const trimmedImageUrl = imageUrl.trim();

        if (!trimmedName) {
            alert("Введите имя");
            return;
        }

        if (!trimmedCategory) {
            alert("Введите категорию");
            return;
        }

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            alert("Введите корректную цену (>= 0)");
            return;
        }

        if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
            alert("Введите корректное количество (>= 0)");
            return;
        }

        if (!trimmedImageUrl.startsWith("https://") 
            && !trimmedImageUrl.startsWith("/images/") 
            || (!trimmedImageUrl.endsWith(".jpg") 
            && !trimmedImageUrl.endsWith(".jpeg") 
            && !trimmedImageUrl.endsWith(".png")))
        {
            alert("Введите корректную ссылку на изображение!");
            return;
        }

        onSubmit({
            id: initialProduct?.id,
            name: trimmedName,
            category: trimmedCategory,
            description: trimmedDescription,
            price: parsedPrice,
            quantity: parsedQuantity,
            imageUrl: trimmedImageUrl
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
                    <div className="modal__title">{title}</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </button>
                </div>
                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        Название
                        <input
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Например, нитки мулине"
                            autoFocus
                        />
                    </label>
                    <label className="label">
                        Категория
                        <input
                            className="input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Например, вязание"
                        />
                    </label>
                    <label className="label">
                        Описание
                        <input
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </label>
                    <label className="label">
                        Цена (руб.)
                        <input
                            className="input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Например, 100"
                            inputMode="numeric"
                        />
                    </label>
                    <label className="label">
                        Количество (шт.)
                        <input
                            className="input"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Например, 10"
                            inputMode="numeric"
                        />
                    </label>
                    <label className="label">
                        Ссылка на изображение
                        <input
                            className="input"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Например, https://example.com/blog/hero.png"
                        />
                    </label>
                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--primary">
                            {mode === "edit" ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
