import { db } from "@/lib/firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";

/**
 * Script d'initialisation pour la base de données Firestore
 * Ce script crée:
 * 1. Un utilisateur administrateur
 * 2. Un utilisateur standard
 */

export async function initializeUsers() {
  try {
    // Créer un utilisateur admin initial
    await setDoc(doc(db, "users", "admin-user-id"), {
      id: "admin-user-id",
      prenom: "Admin",
      pseudo: "AdminSystem",
      email: "admin@exemple.com",
      age: 30,
      ville: "Paris",
      status: "active",
      role: "admin",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log("✅ Utilisateur admin créé avec succès!");
    
    // Créer un utilisateur standard sans droits d'administration
    await setDoc(doc(db, "users", "user-standard-id"), {
      id: "user-standard-id",
      prenom: "Jean",
      pseudo: "JeanUser",
      email: "jean@exemple.com",
      age: 25,
      ville: "Lyon",
      status: "active",
      role: "user",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log("✅ Utilisateur standard créé avec succès!");
    
    // Optionnel: Créer un exemple de suggestion
    await setDoc(doc(db, "suggestions", "suggestion-exemple-id"), {
      id: "suggestion-exemple-id",
      userId: "user-standard-id",
      text: "Wesh",
      definition: "Expression de salutation populaire dans les quartiers",
      exemple: "Wesh mon frère, ça va ?",
      origine: "Dérivé de l'arabe \"wesh rak\" qui signifie \"comment vas-tu\"",
      status: "pending",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log("✅ Exemple de suggestion créé avec succès!");
    
    // Optionnel: Créer un exemple de commentaire
    await setDoc(doc(db, "comments", "comment-exemple-id"), {
      id: "comment-exemple-id",
      userId: "user-standard-id",
      wordId: "mot-exemple-id", // ID d'un mot qui pourrait ne pas exister
      text: "Super définition, merci!",
      status: "active",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log("✅ Exemple de commentaire créé avec succès!");
    
    return {
      success: true,
      message: "Base de données initialisée avec succès!"
    };
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
    return {
      success: false,
      message: "Erreur lors de l'initialisation de la base de données",
      error
    };
  }
} 