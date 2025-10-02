import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js';

export class AuthService {
  constructor(authInstance) {
    this.auth = authInstance;
  }

  async registerUser(email, password) {
    try {
      const registerData = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = registerData.user;

      return user;
    } catch (error) {
      console.error('REGISTER ERROR:', error.code, error.message);
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      const logindData = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = logindData.user;

      return user;
    } catch (error) {
      console.error('REGISTER ERROR:', error.code, error.message);
      throw error;
    }
  }

  async resetPassword(email) {
    try {
      const resetPswrd = await sendPasswordResetEmail(this.auth, email);

      return;
    } catch (error) {
      console.error('QUERRY FAILED:', error.code, error.message);
      throw error;
    }
  }
  async logOut() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('LOGOUT ERROR:', error.code, error.message);
      throw error;
    }
  }
}
