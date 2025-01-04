<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
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
                  >Acesse sua conta</ion-card-title
                >
              </ion-card-header>
              <ion-card-content>
                <form @submit.prevent="submit">
                  <ion-item>
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

                  <ion-button
                    :disabled="loading"
                    expand="block"
                    type="submit"
                    class="mt-4"
                  >
                    Entrar
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
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import { useForm } from "vee-validate";
import * as yup from "yup";
import { AuthService } from "@/services/AuthService";
import { toastController } from "@ionic/vue";
import { onMounted } from "vue";
import { ref } from "vue";

const authService = new AuthService();
const loading = ref(false);
// Schema de validação
const schema = yup.object().shape({
  email: yup.string().required("Campo obrigatório").email("Email inválido"),
  password: yup
    .string()
    .required("Campo obrigatório")
    .min(3, "A senha deve ter no mínimo 3 caracteres"),
});
const router = useRouter();
const authStore = useAuthStore();

const { handleSubmit, errors, defineInputBinds } = useForm({
  validationSchema: schema,
});

// const [emailField] = defineField("email");
// const [passwordField] = defineField("password");
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
const emailField = defineInputBinds("email");
const passwordField = defineInputBinds("password");
const onSubmit = async (values: { email: string; password: string }) => {
  try {
    loading.value = true;
    const response = await authService.login(values.email, values.password);
    authStore.setUser(response);
    presentToast({
      message: "Login realizado com sucesso!",
      color: "success",
    });
    router.push({ name: "Register" });
  } catch (error) {
    console.error("Erro ao fazer login:", error);

    presentToast({
      message: "Credenciais inválidas. Tente novamente.",
      color: "danger",
    });
  } finally {
    loading.value = false;
  }
};
const submit = handleSubmit(onSubmit as any);
onMounted(() => {
  const user = authStore.user;
  if (user) {
    router.push({ name: "Register" });
  }
});
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
</style>
