var express = require("express");
var router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
router.post("/usuarios", async (req, res) => {
  const { email, organization } = req.body;
  try {
    const usuario = await prisma.user.create({
      data: { email, organization, user_id: null },
    });
    res.status(201).json(usuario);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao criar usuário.", details: error.message });
  }
});

router.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany();
    res.status(200).json(usuarios);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao buscar usuários.", details: error.message });
  }
});

router.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    const usuario = await prisma.user.update({
      where: { id },
      data: { user_id },
    });

    res.status(200).json(usuario);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao atualizar usuário.", details: error.message });
  }
});

router.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "Usuário deletado com sucesso." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao deletar usuário.", details: error.message });
  }
});

module.exports = router;
