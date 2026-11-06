
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ArticlesContext = createContext(null);

export function ArticlesProvider({ children }) {
  const { user, isAdmin } = useAuth();

  const [savedArticlesByUser, setSavedArticlesByUser] = useState(() => {
    try {
      const stored = localStorage.getItem('newsreader_articles');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(
      'newsreader_articles',
      JSON.stringify(savedArticlesByUser)
    );
  }, [savedArticlesByUser]);

  const username = user?.username;

  const getUserSavedArticles = () => {
    if (!username) return [];
    return savedArticlesByUser[username] || [];
  };

  const savedArticles = getUserSavedArticles();

  const saveArticle = (article) => {
    if (!username) return;

    setSavedArticlesByUser(prev => {
      const userArticles = prev[username] || [];

      if (userArticles.some(a => a.url === article.url)) {
        return prev;
      }

      return {
        ...prev,
        [username]: [...userArticles, article]
      };
    });
  };

  const removeArticle = (url) => {
    if (!username) return;

    setSavedArticlesByUser(prev => ({
      ...prev,
      [username]: (prev[username] || []).filter(
        article => article.url !== url
      )
    }));
  };

  const isArticleSaved = (url) => {
    return getUserSavedArticles().some(
      article => article.url === url
    );
  };

  const getAllUserArticles = () => {
    if (!isAdmin()) {
      return {};
    }

    return savedArticlesByUser;
  };

  return (
    <ArticlesContext.Provider
      value={{
        savedArticles,
        savedArticlesByUser,
        saveArticle,
        removeArticle,
        isArticleSaved,
        getUserSavedArticles,
        getAllUserArticles
      }}
    >
      {children}
    </ArticlesContext.Provider>
  );
}

export function useArticles() {
  const context = useContext(ArticlesContext);

  if (!context) {
    throw new Error(
      'useArticles must be used within ArticlesProvider'
    );
  }

  return context;
}
