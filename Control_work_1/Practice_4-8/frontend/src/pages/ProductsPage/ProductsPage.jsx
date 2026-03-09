import { useMemo, useState, useEffect } from "react";
import "./ProductsPage.css";
import ProductsList from "../../components/ProductsList.jsx";
import ProductModal from "../../components/ProductModal.jsx";
import LoginModal from "../../components/LoginModal.jsx";
import { api } from "../../api/index.js";

// компонент страницы с товарами
export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
    const [editingProduct, setEditingProduct] = useState(null);

    const [loginOpen, setLoginOpen] = useState(false);
    const [loginMode, setLoginMode] = useState("login"); // "login" | "register"
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    // получение списка товаров
    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getProducts();
            setProducts(data);
        } catch (err) {
            console.error(err);
            alert("Ошибка загрузки товаров");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setModalMode("create");
        setEditingProduct(null);
        setModalOpen(true);
    };

    const openEdit = (product) => {
        setModalMode("edit");
        setEditingProduct(product);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingProduct(null);
    };

    // обработка удаления товара
    const handleDelete = async (id) => {
        const ok = window.confirm("Удалить товар?");
        if (!ok) return;
        
        try {
            await api.deleteProduct(id);
            setProducts((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error(err);
            alert("Ошибка удаления товара");
        }
    };

    // обработка отправки формы создания/редактирования товара
    const handleSubmitModal = async (payload) => {
        try {
            if (modalMode === "create") {
                const newProduct = await api.createProduct(payload);
                setProducts((prev) => [ ... prev, newProduct]);
            } else {
                const updatedProduct = await api.updateProduct(payload.id, payload);
                setProducts((prev) =>
                    prev.map((u) => (u.id === payload.id ? updatedProduct : u))
                );
            }
            closeModal();
        } catch (err) {
            console.error(err);
            alert("Ошибка сохранения товара");
        }
    };

    const openLogin = () => {
        setLoginMode("login");
        setLoginOpen(true);
    };

    const openRegister = () => {
        setLoginMode("register");
        setLoginOpen(true);
    };

    const closeLoginModal = () => {
        setLoginOpen(false);
    };

    // обработка отправки формы входа/регистрации
    const handleSubmitLogin = async (payload) => {
        try {
            if (loginMode === "login") {
                const userData = await api.login(payload);
                setCurrentUser(userData);
                alert("Вход выполнен успешно!");
            } else {
                const newUser = await api.register(payload);
                setCurrentUser(newUser);
                alert("Регистрация выполнена успешно!");
            }

            closeLoginModal();
        } catch (err) {
            console.error(err);
            alert("Ошибка авторизации");
        }
    };

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">Мастерица</div>
                    <div className="header__right">
                        {!currentUser ? (
                            <button className="btn btn--primary" onClick={openLogin}>
                                Войти
                            </button>
                        ) : (
                            <button className="btn btn--primary">
                                👤 Профиль
                            </button>
                        )}
                    </div>
                    
                </div>
            </header>
            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="title">Товары для рукоделия</h1>
                        <button className="btn btn--primary" onClick={openCreate}>
                            + Создать
                        </button>
                    </div>
                    {loading ? (
                        <div className="empty">Загрузка...</div>
                    ) : (
                        <ProductsList
                        products={products}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        />
                    )}
                </div>
            </main>
            <footer className="footer">
                <div className="footer__inner">
                    © {new Date().getFullYear()} Мастерица
                </div>
            </footer>
            <ProductModal
                open={modalOpen}
                mode={modalMode}
                initialProduct={editingProduct}
                onClose={closeModal}
                onSubmit={handleSubmitModal}
            />
            <LoginModal 
                open={loginOpen}
                mode={loginMode}
                onClose={closeLoginModal}
                onSubmit={handleSubmitLogin}
                openRegister={openRegister}
            />
        </div>
    );
}