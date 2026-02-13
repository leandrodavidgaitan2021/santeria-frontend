import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./router/AppRouter";
import { AuthProvider } from "./context/AuthProvider"; // <--- Importación clave
import { CategoryProvider } from "./context/CategoryProvider";
import { ProvidersProvider } from "./context/ProvidersProvider";
import { ArticleProvider } from "./context/ArticleProvider";
import { NotificationProvider } from "./context/NotificationProvider"; // El Provider
import { NotificationBanner } from "./components/NotificationBanner"; // La UI
import { ConfirmProvider } from "./context/ConfirmProvider";

function App() {
  return (
    <NotificationProvider>
      {/* 1. El motor de mensajes envuelve todo */}
      <NotificationBanner /> {/* 2. El banner escucha al motor */}
      <ConfirmProvider>
        <ProvidersProvider>
          <CategoryProvider>
            <ArticleProvider>
              <AuthProvider>
                <BrowserRouter>
                  <AppRouter />
                </BrowserRouter>
              </AuthProvider>
            </ArticleProvider>
          </CategoryProvider>
        </ProvidersProvider>
      </ConfirmProvider>
    </NotificationProvider>
  );
}

export default App;
