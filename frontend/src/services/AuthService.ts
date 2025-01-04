// import type { User as UserLocal } from "@prisma/client";
import type { ClientOptions, User } from "better-auth/types";
import { useAuthStore } from "@/store/auth";
// import { getPostgrestURL } from "@/utils/getPostgrestURL";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/vue";

/**
 * Authentication Service class for managing authentication requests.
 */
export class AuthService {
  public client: any;

  constructor() {
    const AUTH_API = `https://auth.eduprime.chat`;
    this.client = createAuthClient<ClientOptions>({
      baseURL: AUTH_API,
      plugins: [organizationClient()],
    });
  }

  /**
   * Logs in a user with the provided credentials.
   * @param email User's email
   * @param password User's password
   * @returns A promise resolving to the user's session.
   */
  async login(email: string, password: string): Promise<User> {
    const authStore = useAuthStore();
    try {
      const { data } = await this.client.signIn.email({
        email,
        password,
      });
      if (!data) {
        throw new Error("Login failed: No data returned");
      }

      // Get autorization token for PostgREST
      // await this.postgrestToken();

      authStore.setUser(data.user);
      return data.user as User;
    } catch (error) {
      throw new Error(`Login failed: ${(error as Error).message}`);
    }
  }

  /**
   * Logs out the current user.
   * @returns A promise resolving when the user is logged out.
   */
  async logout(): Promise<void> {
    try {
      const authStore = useAuthStore();
      authStore.logout();
    } catch (error) {
      throw new Error(`Logout failed: ${(error as Error).message}`);
    }
  }

  /**
   * Registers a new user.
   * @param email User's email
   * @param password User's password
   * @param name Full name.
   * @param image Profile picture.
   * @TODO FALTA INFORMAR A ORGANIZAÇÂO DO USUÁRIO
   * @returns A promise resolving to the created user.
   */
  async register(
    email: string,
    password: string,
    name: string,
    image?: string | null
  ) {
    const response = await this.client.signUp.email({
      email,
      password,
      name,
      image: image ?? undefined,
    });
    if (response.data) {
      return response.data as User;
    } else {
      const message =
        response.error.code === "USER_ALREADY_EXISTS"
          ? "Usuário ja cadastrado"
          : response.error.message;
      throw new Error(message);
    }
  }

  /**
   * Fetches the current authenticated user's data.
   * @returns A promise resolving to the user's session.
   */
  async getCurrentUser() {
    try {
      const session = await this.client.getSession();
      return session;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${(error as Error).message}`);
    }
  }

  /**
   * Retrieves the current session.
   * @returns A promise resolving to the current session.
   */
  async getSession() {
    try {
      const session = await this.client.getSession();
      return session;
    } catch (error) {
      throw new Error(
        `Failed to retrieve session: ${(error as Error).message}`
      );
    }
  }

  /**
   * Sends a password reset email to the user.
   * @param email User's email
   * @returns A promise resolving when the email is sent.
   */
  // async postgrestToken(): Promise<string> {
  //   try {
  //     const authStore = useAuthStore();

  //     const response = await fetch(
  //       `https://auth.eduprime.chat/postgrest/token`,
  //       {
  //         method: "POST",
  //         credentials: "include",
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`Token request failed: ${response.statusText}`);
  //     }

  //     const data = await response.json();
  //     authStore.token = data.token;
  //     return data.token;
  //   } catch (error) {
  //     throw new Error(`Token request failed: ${(error as Error).message}`);
  //   }
  // }
}
