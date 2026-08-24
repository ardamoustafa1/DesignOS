import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  authMode: text("auth_mode").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  brief: text("brief").notNull(),
  systemId: text("system_id").notNull(),
  selectedVariation: integer("selected_variation").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [index("idx_projects_user_updated").on(table.userId, table.updatedAt)]);

export const generationRuns = sqliteTable("generation_runs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  status: text("status").notNull(),
  brief: text("brief").notNull(),
  systemId: text("system_id").notNull(),
  variation: integer("variation").notNull(),
  providerId: text("provider_id"),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  costMicros: integer("cost_micros").notNull().default(0),
  resultJson: text("result_json"),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  uniqueIndex("idx_runs_user_idempotency").on(table.userId, table.idempotencyKey),
  index("idx_runs_project_created").on(table.projectId, table.createdAt),
]);

export const usageWindows = sqliteTable("usage_windows", {
  userId: text("user_id").notNull(),
  windowStart: integer("window_start").notNull(),
  runCount: integer("run_count").notNull().default(0),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  costMicros: integer("cost_micros").notNull().default(0),
}, (table) => [uniqueIndex("idx_usage_user_window").on(table.userId, table.windowStart)]);

export const generationAttempts = sqliteTable("generation_attempts", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  result: text("result").notNull(),
  fingerprint: text("fingerprint").notNull(),
  repair: text("repair").notNull(),
  checksJson: text("checks_json").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [uniqueIndex("idx_attempt_run_number").on(table.runId, table.attemptNumber)]);

export const gateEvidence = sqliteTable("gate_evidence", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  mode: text("mode").notNull(),
  schema: text("schema").notNull(),
  artifactDigest: text("artifact_digest"),
  reportJson: text("report_json").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("idx_evidence_run_created").on(table.runId, table.createdAt)]);
