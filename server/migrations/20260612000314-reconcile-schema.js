export async function up(queryInterface, Sequelize) {
  // ========================================
  // 1. messages — tornar FKs NOT NULL e CASCADE
  // ========================================

  await queryInterface.sequelize.query(
    `ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_conversationId_fkey";`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_conversationId_conversations_fk";`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_senderId_fkey";`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_senderId_users_fk";`,
  );

  await queryInterface.sequelize.query(
    `ALTER TABLE "messages" ALTER COLUMN "conversationId" SET NOT NULL;`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "messages" ALTER COLUMN "senderId" SET NOT NULL;`,
  );

  await queryInterface.addConstraint("messages", {
    fields: ["conversationId"],
    type: "foreign key",
    references: { table: "conversations", field: "id" },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  await queryInterface.addConstraint("messages", {
    fields: ["senderId"],
    type: "foreign key",
    references: { table: "users", field: "id" },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  await queryInterface.sequelize.query(
    `CREATE INDEX IF NOT EXISTS "messages_conversation_id" ON "messages" ("conversationId");`,
  );
  await queryInterface.sequelize.query(
    `CREATE INDEX IF NOT EXISTS "messages_sender_id" ON "messages" ("senderId");`,
  );

  // ========================================
  // 2. conversation_users — adicionar coluna id
  // ========================================

  await queryInterface.sequelize.query(
    `ALTER TABLE "conversation_users" ADD COLUMN IF NOT EXISTS "id" UUID;`,
  );

  await queryInterface.sequelize.query(
    `UPDATE "conversation_users" SET "id" = gen_random_uuid() WHERE "id" IS NULL;`,
  );

  await queryInterface.sequelize.query(
    `ALTER TABLE "conversation_users" ALTER COLUMN "id" SET NOT NULL;`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "conversation_users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();`,
  );

  await queryInterface.sequelize.query(
    `ALTER TABLE "conversation_users" DROP CONSTRAINT IF EXISTS "conversation_users_pkey";`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "conversation_users" ADD PRIMARY KEY ("id");`,
  );

  await queryInterface.sequelize.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS "conversation_users_user_id_conversation_id" ON "conversation_users" ("userId", "conversationId");`,
  );

  await queryInterface.sequelize.query(
    `CREATE INDEX IF NOT EXISTS "conversation_users_user_id" ON "conversation_users" ("userId");`,
  );
  await queryInterface.sequelize.query(
    `CREATE INDEX IF NOT EXISTS "conversation_users_conversation_id" ON "conversation_users" ("conversationId");`,
  );

  await queryInterface.sequelize.query(
    `ALTER TABLE "conversation_users" DROP CONSTRAINT IF EXISTS "conversation_users_userId_fkey";`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "conversation_users" DROP CONSTRAINT IF EXISTS "conversation_users_userId_users_fk";`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "conversation_users" DROP CONSTRAINT IF EXISTS "conversation_users_conversationId_fkey";`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "conversation_users" DROP CONSTRAINT IF EXISTS "conversation_users_conversationId_conversations_fk";`,
  );

  await queryInterface.addConstraint("conversation_users", {
    fields: ["userId"],
    type: "foreign key",
    references: { table: "users", field: "id" },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  await queryInterface.addConstraint("conversation_users", {
    fields: ["conversationId"],
    type: "foreign key",
    references: { table: "conversations", field: "id" },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
}

export async function down(queryInterface, Sequelize) {
  // Reverter conversation_users
  await queryInterface.sequelize.query(
    `ALTER TABLE "conversation_users" DROP CONSTRAINT IF EXISTS "conversation_users_userId_users_fk";`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "conversation_users" DROP CONSTRAINT IF EXISTS "conversation_users_conversationId_conversations_fk";`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "conversation_users" DROP CONSTRAINT IF EXISTS "conversation_users_pkey";`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "conversation_users" DROP COLUMN IF EXISTS "id";`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "conversation_users" ADD PRIMARY KEY ("userId", "conversationId");`,
  );
  await queryInterface.sequelize.query(
    `DROP INDEX IF EXISTS "conversation_users_user_id_conversation_id";`,
  );
  await queryInterface.sequelize.query(
    `DROP INDEX IF EXISTS "conversation_users_user_id";`,
  );
  await queryInterface.sequelize.query(
    `DROP INDEX IF EXISTS "conversation_users_conversation_id";`,
  );

  await queryInterface.addConstraint("conversation_users", {
    fields: ["userId"],
    type: "foreign key",
    references: { table: "users", field: "id" },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  await queryInterface.addConstraint("conversation_users", {
    fields: ["conversationId"],
    type: "foreign key",
    references: { table: "conversations", field: "id" },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Reverter messages
  await queryInterface.sequelize.query(
    `DROP INDEX IF EXISTS "messages_conversation_id";`,
  );
  await queryInterface.sequelize.query(
    `DROP INDEX IF EXISTS "messages_sender_id";`,
  );

  await queryInterface.sequelize.query(
    `ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_conversationId_conversations_fk";`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_senderId_users_fk";`,
  );

  await queryInterface.sequelize.query(
    `ALTER TABLE "messages" ALTER COLUMN "conversationId" DROP NOT NULL;`,
  );
  await queryInterface.sequelize.query(
    `ALTER TABLE "messages" ALTER COLUMN "senderId" DROP NOT NULL;`,
  );

  await queryInterface.addConstraint("messages", {
    fields: ["conversationId"],
    type: "foreign key",
    references: { table: "conversations", field: "id" },
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  await queryInterface.addConstraint("messages", {
    fields: ["senderId"],
    type: "foreign key",
    references: { table: "users", field: "id" },
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
}
