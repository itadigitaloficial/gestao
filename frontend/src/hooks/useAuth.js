import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, senha) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      return userCredential.user;
    } catch (error) {
      throw new Error('Erro ao fazer login: ' + error.message);
    }
  };

  const cadastrar = async (nome, email, senha, cargo) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      
      // Criar documento do usuário no Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        nome,
        email,
        cargo,
        permissoes: ['visualizador'],
        ativo: true,
        createdAt: new Date().toISOString()
      });

      return userCredential.user;
    } catch (error) {
      throw new Error('Erro ao cadastrar: ' + error.message);
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  return {
    user,
    loading,
    login,
    cadastrar,
    logout
  };
}; 