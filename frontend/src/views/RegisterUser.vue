<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-row>
          <ion-title>Cadastrar usuário</ion-title>
          <img
            width="24"
            height="24"
            src="/exit.svg"
            alt="Logo"
            class="logo"
            @click="logout"
          />
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-grid
        class="ion-justify-content-center ion-align-items-center h-full"
      >
        <ion-row class="ion-justify-content-center">
          <ion-col size="12" size-md="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title class="text-center"
                  >Informe os dados</ion-card-title
                >
              </ion-card-header>
              <ion-card-content>
                <form @submit.prevent="submit">
                  <ion-item>
                    <ion-input
                      label="Nome"
                      label-placement="floating"
                      v-bind="nameField"
                      type="text"
                    />
                  </ion-item>
                  <div v-if="errors.name" class="text-red-500 text-sm pl-4">
                    {{ errors.name }}
                  </div>

                  <ion-item class="mt-4">
                    <ion-input
                      label="Email"
                      label-placement="floating"
                      v-bind="emailField"
                      type="email"
                    />
                  </ion-item>
                  <div v-if="errors.email" class="text-red-500 text-sm pl-4">
                    {{ errors.email }}
                  </div>

                  <!-- Campo Organização -->
                  <ion-item class="mt-4">
                    <ion-input
                      label="Organização"
                      label-placement="floating"
                      v-bind="organizationField"
                      type="text"
                    />
                  </ion-item>
                  <div
                    v-if="errors.organization"
                    class="text-red-500 text-sm pl-4"
                  >
                    {{ errors.organization }}
                  </div>
                  <ion-item class="mt-4">
                    <ion-input
                      label="Senha"
                      label-placement="floating"
                      v-bind="passwordField"
                      type="password"
                    />
                  </ion-item>
                  <div v-if="errors.password" class="text-red-500 text-sm pl-4">
                    {{ errors.password }}
                  </div>
                  <ion-item class="mt-4">
                    <ion-input
                      label="Confirme a senha"
                      label-placement="floating"
                      v-bind="passwordConfirmationField"
                      type="password"
                    />
                  </ion-item>
                  <div
                    v-if="errors.password_confirmation"
                    class="text-red-500 text-sm pl-4"
                  >
                    {{ errors.password_confirmation }}
                  </div>

                  <ion-button
                    :disabled="loading"
                    expand="block"
                    type="submit"
                    class="mt-4"
                  >
                    Cadastrar
                  </ion-button>
                </form>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useAuthStore } from "../store/auth";
import { useForm } from "vee-validate";
import * as yup from "yup";
import { AuthService } from "@/services/AuthService";
import { useRouter } from "vue-router";
import { toastController } from "@ionic/vue";
import { ref } from "vue";
const authService = new AuthService();

const schema = yup.object().shape({
  name: yup.string().required("Campo obrigatório"),
  email: yup.string().required("Campo obrigatório").email("Email inválido"),
  organization: yup.string().required("Campo obrigatório"),
  password: yup
    .string()
    .required("Campo obrigatório")
    .min(8, "A senha deve ter no mínimo 8 caracteres"),
  password_confirmation: yup
    .string()
    .required("Campo obrigatório")
    .oneOf([yup.ref("password")], "A senha não coincide."),
});

const authStore = useAuthStore();

const { handleSubmit, errors, defineInputBinds, resetForm } = useForm({
  validationSchema: schema,
});

const nameField = defineInputBinds("name");
const emailField = defineInputBinds("email");
const organizationField = defineInputBinds("organization");
const passwordField = defineInputBinds("password");
const passwordConfirmationField = defineInputBinds("password_confirmation");
const currentUser = ref();
const loading = ref(false);
const onSubmit = async (values: {
  name: string;
  email: string;
  organization: string;
  password: string;
}) => {
  try {
    loading.value = true;
    const user = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    const json = await user.json();
    currentUser.value = json.id;
    const { id } = await authService.register(
      values.email,
      values.password,
      values.name
    );
    presentToast({
      message: "Cadastro realizado com sucesso!",
      color: "success",
    });
    await fetch(
      `${import.meta.env.VITE_API_URL}/usuarios/${currentUser.value}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: id }),
      }
    );
    resetForm();
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    await fetch(
      `${import.meta.env.VITE_API_URL}/usuarios/${currentUser.value}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    presentToast({
      message: `${error}`,
      color: "danger",
    });
  } finally {
    currentUser.value = null;
    loading.value = false;
  }
};
async function presentToast({
  message,
  color,
}: {
  message: string;
  color: string;
}) {
  const toast = await toastController.create({
    message: message,
    duration: 2000,
    position: "top",
    color: color,
  });

  await toast.present();
}
const router = useRouter();
const submit = handleSubmit(onSubmit as any);
function logout() {
  authStore.logout();
  router.push({ name: "Login" });
}
</script>

<style scoped>
.h-full {
  height: 100%;
}
.text-center {
  text-align: center;
}
.text-red-500 {
  color: #ef4444;
}
.mt-4 {
  margin-top: 1rem;
}
.pl-4 {
  padding-left: 1rem;
}
img {
  cursor: pointer;
  margin-right: 20px;
}
</style>
