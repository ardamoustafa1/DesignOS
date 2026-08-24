CREATE TABLE `generation_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`project_id` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`status` text NOT NULL,
	`brief` text NOT NULL,
	`system_id` text NOT NULL,
	`variation` integer NOT NULL,
	`provider_id` text,
	`input_tokens` integer DEFAULT 0 NOT NULL,
	`output_tokens` integer DEFAULT 0 NOT NULL,
	`cost_micros` integer DEFAULT 0 NOT NULL,
	`result_json` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_runs_user_idempotency` ON `generation_runs` (`user_id`,`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_runs_project_created` ON `generation_runs` (`project_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`brief` text NOT NULL,
	`system_id` text NOT NULL,
	`selected_variation` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_projects_user_updated` ON `projects` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `usage_windows` (
	`user_id` text NOT NULL,
	`window_start` integer NOT NULL,
	`run_count` integer DEFAULT 0 NOT NULL,
	`input_tokens` integer DEFAULT 0 NOT NULL,
	`output_tokens` integer DEFAULT 0 NOT NULL,
	`cost_micros` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_usage_user_window` ON `usage_windows` (`user_id`,`window_start`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_mode` text NOT NULL,
	`created_at` integer NOT NULL
);
