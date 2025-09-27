import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Embed translations directly to avoid import issues on Vercel
const enTranslation = {
  "app": {
    "name": "ZAPP",
    "tagline": "Caribbean & African Grocery Online"
  },
  "nav": {
    "home": "Home",
    "products": "Products",
    "categories": "Categories",
    "cart": "Cart",
    "account": "Account",
    "login": "Login",
    "signup": "Sign Up",
    "logout": "Logout"
  },
  "common": {
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "save": "Save",
    "edit": "Edit",
    "delete": "Delete",
    "add": "Add",
    "remove": "Remove",
    "view": "View",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "previous": "Previous",
    "submit": "Submit",
    "reset": "Reset",
    "clear": "Clear",
    "select": "Select",
    "all": "All",
    "none": "None",
    "yes": "Yes",
    "no": "No",
    "ok": "OK",
    "apply": "Apply",
    "update": "Update",
    "refresh": "Refresh",
    "retry": "Retry",
    "continue": "Continue",
    "finish": "Finish",
    "done": "Done",
    "skip": "Skip",
    "help": "Help"
  },
  "footer": {
    "about": "About Us",
    "contact": "Contact",
    "support": "Customer Support",
    "shipping": "Shipping Policy",
    "returns": "Returns & Refunds",
    "privacy": "Privacy Policy",
    "terms": "Terms of Service",
    "copyright": "© 2025 ZAPP. All rights reserved."
  }
};

const esTranslation = {
  "app": {
    "name": "ZAPP",
    "tagline": "Tienda de Comestibles Caribeños y Africanos en Línea"
  },
  "nav": {
    "home": "Inicio",
    "products": "Productos",
    "categories": "Categorías",
    "cart": "Carrito",
    "account": "Cuenta",
    "login": "Iniciar Sesión",
    "signup": "Registrarse",
    "logout": "Cerrar Sesión"
  },
  "common": {
    "search": "Buscar",
    "filter": "Filtrar",
    "sort": "Ordenar",
    "loading": "Cargando...",
    "error": "Error",
    "success": "Éxito",
    "cancel": "Cancelar",
    "confirm": "Confirmar",
    "save": "Guardar",
    "edit": "Editar",
    "delete": "Eliminar",
    "add": "Agregar",
    "remove": "Quitar",
    "view": "Ver",
    "close": "Cerrar",
    "back": "Atrás",
    "next": "Siguiente",
    "previous": "Anterior",
    "submit": "Enviar",
    "reset": "Restablecer",
    "clear": "Limpiar",
    "select": "Seleccionar",
    "all": "Todo",
    "none": "Ninguno",
    "yes": "Sí",
    "no": "No",
    "ok": "OK",
    "apply": "Aplicar",
    "update": "Actualizar",
    "refresh": "Actualizar",
    "retry": "Reintentar",
    "continue": "Continuar",
    "finish": "Terminar",
    "done": "Hecho",
    "skip": "Omitir",
    "help": "Ayuda"
  },
  "footer": {
    "about": "Acerca de Nosotros",
    "contact": "Contacto",
    "support": "Atención al Cliente",
    "shipping": "Política de Envío",
    "returns": "Devoluciones y Reembolsos",
    "privacy": "Política de Privacidad",
    "terms": "Términos de Servicio",
    "copyright": "© 2025 ZAPP. Todos los derechos reservados."
  }
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      es: {
        translation: esTranslation
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export type Language = 'en' | 'es';

interface LanguageContextProps {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Initialize language from localStorage if available
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'en';
  });
  
  // Update language in i18n and localStorage when language changes
  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    
    // Update HTML lang attribute
    document.documentElement.lang = language;
  }, [language]);
  
  function setLanguage(newLanguage: Language) {
    setLanguageState(newLanguage);
  }
  
  // Simple translation function
  function t(key: string): string {
    return i18n.t(key);
  }
  
  const value = {
    language,
    setLanguage,
    t
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}