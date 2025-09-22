import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = Constants.expoConfig?.extra?.googleClientId || '352048252352-gl90lisdndu1h3abad3rcameak58gqt7.apps.googleusercontent.com';

class GoogleAuthService {
  private redirectUri: string;

  constructor() {
    this.redirectUri = AuthSession.makeRedirectUri({
      scheme: 'sahib-game-store',
      path: 'auth',
    });
    console.log('Redirect URI:', this.redirectUri);
  }

  async signIn() {
    try {
      // Create a random state parameter for security
      const state = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString(),
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      // Create the auth request
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
        redirectUri: this.redirectUri,
        state: state,
        extraParams: {
          nonce: await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            Math.random().toString(),
            { encoding: Crypto.CryptoEncoding.HEX }
          ),
        },
      });

      console.log('Starting Google auth request...');

      // Prompt for authentication
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
        showInRecents: true,
      });

      console.log('Auth result:', result);

      if (result.type === 'success') {
        const { id_token } = result.params;
        
        if (!id_token) {
          throw new Error('No ID token received from Google');
        }

        // Decode the ID token to get user info
        const userInfo = this.decodeIdToken(id_token);
        console.log('Decoded user info:', userInfo);

        return {
          idToken: id_token,
          user: userInfo,
        };
      } else if (result.type === 'cancel') {
        throw new Error('Sign in was cancelled');
      } else if (result.type === 'error') {
        console.error('Auth error:', result.error);
        throw new Error(result.error?.message || 'Authentication failed');
      } else {
        throw new Error('Unknown authentication result');
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  }

  private decodeIdToken(idToken: string) {
    try {
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      
      return {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        givenName: decoded.given_name,
        familyName: decoded.family_name,
        photo: decoded.picture,
      };
    } catch (error) {
      console.error('Failed to decode ID token:', error);
      return null;
    }
  }

  async signOut() {
    try {
      // For web-based auth, we just clear local state
      console.log('Google Sign Out completed');
    } catch (error) {
      console.error('Google Sign Out Error:', error);
    }
  }

  async getCurrentUser() {
    // For Expo auth session, we don't maintain persistent state
    // The app should handle this through its own token management
    return null;
  }

  async checkSignInStatus() {
    // For Expo auth session, we check if we have valid tokens in AsyncStorage
    // This will be handled by the auth context
    return false;
  }
}

export const googleAuthService = new GoogleAuthService();