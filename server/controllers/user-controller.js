import { Op } from "sequelize";
import User from "../models/user.js";
import { ConversationUser } from "../models/index.js";
import { userSchema } from "../schemas/auth-schema.js";
import cloudinary from "../config/cloudinary.js";

export const listUsers = async (req, res) => {
  try {
    const myConversations = await ConversationUser.findAll({
      where: { userId: req.user.id },
      attributes: ["conversationId"],
    });

    const conversationIds = myConversations.map((c) => c.conversationId);

    const connectedUsers = await ConversationUser.findAll({
      where: {
        conversationId: { [Op.in]: conversationIds },
        userId: { [Op.ne]: req.user.id },
      },
      attributes: ["userId"],
    });

    const connectedUserIds = connectedUsers.map((c) => c.userId);

    const users = await User.findAll({
      where: {
        id: {
          [Op.ne]: req.user.id,
          ...(connectedUserIds.length > 0 && {
            [Op.notIn]: connectedUserIds,
          }),
        },
      },
      attributes: ["id", "name", "email", "avatar"],
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);

    return res.status(500).json({
      message: "Erro interno ao listar usuários",
    });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "ID do usuário é obrigatório",
    });
  }

  try {
    const user = await User.findByPk(id, {
      attributes: ["id", "name", "email", "avatar", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);

    return res.status(500).json({
      message: "Erro interno ao buscar usuário",
    });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "ID do usuário é obrigatório",
    });
  }

  try {
    const { name, email } = userSchema.parse(req.body);

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await user.update({ name, email });

    return res.json({
      message: "Perfil atualizado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      return res.status(409).json({
        error: "Este email já está em uso",
      });
    }

    return res.status(500).json({
      error: "Erro ao atualizar usuário",
    });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const authUserId = req.user.id;

  if (!id) {
    return res.status(400).json({
      message: "ID do usuário é obrigatório",
    });
  }

  if (id !== authUserId) {
    return res.status(403).json({
      message: "Você não pode deletar outro usuário",
    });
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    await user.destroy();

    return res.json({
      message: "Usuário deletado com sucesso",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao deletar usuário",
    });
  }
};

export const updateUserAvatar = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: "Avatar é obrigatório" });
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    user.avatar = req.file.path;
    user.avatarPublicId = req.file.filename;

    await user.save();

    return res.json({
      message: "Avatar atualizado com sucesso",
      avatar: user.avatar,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar avatar" });
  }
};
