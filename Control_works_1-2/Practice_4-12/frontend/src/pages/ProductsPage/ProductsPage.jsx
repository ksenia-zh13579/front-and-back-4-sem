import { useMemo, useState, useEffect } from "react";
import "./ProductsPage.css";
import ProductsList from "../../components/ProductsList.jsx";
import ProductModal from "../../components/ProductModal.jsx";
import LoginModal from "../../components/LoginModal.jsx";
import UserModal from "../../components/UserModal.jsx";
import UsersListModal from "../../components/UsersListModal.jsx";
import UserChange from "../../components/UserChange.jsx";
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
    const [profileOpen, setProfileOpen] = useState(false);

    const [users, setUsers] = useState([]);
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [isUserChangeOpen, setIsUserChangeOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        loadProducts();
    }, [currentUser]);

    // получение списка товаров
    const loadProducts = async () => {
        try {
            if (currentUser)
            {
                setLoading(true);
                const data = await api.getProducts();
                setProducts(data);
            }
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
                await api.login(payload);
                const userData = await api.getCurrentUser();
                setCurrentUser(userData);
                alert("Вход выполнен успешно!");
                closeLoginModal();
            } else {
                const newUser = await api.register(payload);
                alert("Регистрация выполнена успешно! Теперь вы можете войти в аккаунт со своими логином и паролем!");
                setLoginMode("login");
            }

            
        } catch (err) {
            console.error(err);
            alert("Ошибка авторизации");
        }
    };

    const openProfile = () => {
        setProfileOpen(true);
    };

    const closeProfile = () => {
        setProfileOpen(false);
    };


    useEffect(() => {
        loadUsers();
    }, [currentUser]);

    // получение списка пользователей
    const loadUsers = async () => {
        try {
            if (currentUser && currentUser.role === "admin")
            {
                setLoading(true);
                const data = await api.getUsers();
                setUsers(data);
            }
        } catch (err) {
            console.error(err);
            alert("Ошибка загрузки пользователей");
        } finally {
            setLoading(false);
        }
    }; 
    
    const openUsersList = () => {
        setIsUserListOpen(true);
    }

    const closeUsersList = () => {
        setIsUserListOpen(false);
    }

    const openUserChange = (user) => {
        setEditingUser(user);
        setIsUserChangeOpen(true);
    }

    const closeUserChange = () => {
        setEditingUser(null);
        setIsUserChangeOpen(false);
    }

    // обработка удаления пользователя
    const handleDeleteUser = async (id) => {
        if (id === currentUser.id)
        {
            alert("Нельзя удалить свой собственный профиль!");
            return;
        }

        const ok = window.confirm("Удалить пользователя?");
        if (!ok) return;
        
        try {
            await api.deleteUser(id);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error(err);
            alert("Ошибка удаления пользователя");
        }
    };

    // обработка отправки формы редактирования пользователя
    const handleUserChange = async (payload) => {
        try {
            const updatedUser = await api.updateUser(payload.id, payload);
            setUsers((prev) =>
                prev.map((u) => (u.id === payload.id ? updatedUser : u))
            );

            if (payload.id === currentUser.id)
            {
                setCurrentUser(updatedUser);
            }

            closeUserChange();
        } catch (err) {
            console.error(err);
            alert("Ошибка сохранения пользователя");
        }
    };

    const handleExit = () => {
        setCurrentUser(null);
        closeProfile();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert("Вы вышли из системы!");
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
                            <button className="btn btn--primary" onClick={openProfile}>
                                👤 Профиль
                            </button>
                        )}
                        {currentUser?.role === "admin" ? (
                            <button className="btn btn--danger" onClick={openUsersList}>
                                Пользователи
                            </button>
                        ) : (null)}
                    </div>
                    
                </div>
            </header>
            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="title">Товары для рукоделия</h1>
                        {currentUser?.role === "seller" ? (
                            <button className="btn btn--primary" onClick={openCreate}>
                                + Создать
                            </button>
                        ) : (null)}
                    </div>
                    {currentUser ? (
                        loading ? (
                            <div className="empty">Загрузка...</div>
                        ) : (
                            <ProductsList
                                currentUser={currentUser}
                                products={products}
                                onEdit={openEdit}
                                onDelete={handleDelete}
                            />
                        )) : (
                            <div className="empty">
                                Войдите или зарегистрируйтесь, 
                                чтобы получить доступ к товарам
                            </div>
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
            <UserModal
                open={profileOpen}
                currentUser={currentUser}
                onClose={closeProfile}
                onExit={handleExit}
            />

            <UsersListModal 
                open={isUserListOpen}
                onClose={closeUsersList}
                users={users}
                onEdit={openUserChange}
                onDelete={handleDeleteUser}
            />
            <UserChange 
                open={isUserChangeOpen}
                onClose={closeUserChange}
                initialUser={editingUser}
                onSubmit={handleUserChange}
            />
        </div>
    );
}