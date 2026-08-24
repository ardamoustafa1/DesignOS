CREATE TABLE `gate_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`mode` text NOT NULL,
	`schema` text NOT NULL,
	`artifact_digest` text,
	`report_json` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_evidence_run_created` ON `gate_evidence` (`run_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `generation_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`attempt_number` integer NOT NULL,
	`result` text NOT NULL,
	`fingerprint` text NOT NULL,
	`repair` text NOT NULL,
	`checks_json` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_attempt_run_number` ON `generation_attempts` (`run_id`,`attempt_number`);