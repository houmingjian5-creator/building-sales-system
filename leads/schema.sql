-- Apply explicitly to an empty, dedicated MySQL 8.0 database. Never run at startup.
CREATE TABLE lead_settings (
  id INT PRIMARY KEY,
  ready TINYINT NOT NULL DEFAULT 0,
  customer_fingerprint CHAR(64) NULL,
  schema_version INT NOT NULL DEFAULT 1
) ENGINE=InnoDB;
INSERT INTO lead_settings (id) VALUES (1);

CREATE TABLE lead_resources (
  id VARCHAR(40) PRIMARY KEY,
  phone_key CHAR(64) NOT NULL UNIQUE,
  phone_cipher TEXT NOT NULL,
  phone_mask VARCHAR(40) NOT NULL,
  name VARCHAR(160) NOT NULL,
  contact VARCHAR(160) NOT NULL DEFAULT '',
  address VARCHAR(500) NOT NULL DEFAULT '',
  source VARCHAR(160) NOT NULL DEFAULT '',
  region VARCHAR(160) NOT NULL DEFAULT '',
  tags VARCHAR(500) NOT NULL DEFAULT '',
  owner_id VARCHAR(64) NULL,
  customer_id VARCHAR(64) NULL UNIQUE,
  intent VARCHAR(32) NOT NULL DEFAULT 'unknown',
  next_followup_at DATETIME NULL,
  consent_status VARCHAR(32) NOT NULL DEFAULT 'unknown',
  source_evidence VARCHAR(500) NOT NULL DEFAULT '',
  version INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX lead_owner_due (owner_id, next_followup_at, id),
  INDEX lead_owner_created (owner_id, created_at, id),
  INDEX lead_source_created (source, created_at, id),
  INDEX lead_intent (owner_id, intent, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lead_followups (
  id VARCHAR(40) PRIMARY KEY,
  lead_id VARCHAR(40) NOT NULL,
  actor_id VARCHAR(64) NOT NULL,
  actor_name VARCHAR(160) NOT NULL,
  method VARCHAR(32) NOT NULL,
  result VARCHAR(32) NOT NULL,
  content TEXT NOT NULL,
  intent VARCHAR(32) NOT NULL,
  next_followup_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  INDEX followup_lead_time (lead_id, created_at, id),
  INDEX followup_actor_time (actor_id, created_at),
  FOREIGN KEY (lead_id) REFERENCES lead_resources(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lead_assignment_history (
  id VARCHAR(40) PRIMARY KEY,
  lead_id VARCHAR(40) NOT NULL,
  actor_id VARCHAR(64) NOT NULL,
  actor_name VARCHAR(160) NOT NULL,
  action VARCHAR(40) NOT NULL,
  from_owner VARCHAR(64) NULL,
  to_owner VARCHAR(64) NULL,
  reason VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  INDEX assignment_lead (lead_id, created_at),
  INDEX assignment_actor (actor_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lead_audit (
  id VARCHAR(40) PRIMARY KEY,
  request_id VARCHAR(80) NOT NULL,
  actor_id VARCHAR(64) NOT NULL,
  action VARCHAR(40) NOT NULL,
  lead_id VARCHAR(40) NULL,
  created_at DATETIME NOT NULL,
  INDEX audit_time (created_at, id),
  INDEX audit_request (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lead_requests (
  request_key CHAR(64) PRIMARY KEY,
  payload_key CHAR(64) NOT NULL,
  result_json MEDIUMTEXT NOT NULL,
  created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Durable intent bridges MySQL and legacy JSON. Pending operations block mutations
-- until a deliberate replay completes; replay never creates a second customer.
CREATE TABLE lead_customer_operations (
  id VARCHAR(40) PRIMARY KEY,
  lead_id VARCHAR(40) NOT NULL,
  customer_id VARCHAR(64) NOT NULL,
  payload_cipher TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL,
  completed_at DATETIME NULL,
  INDEX operation_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lead_import_batches (
  id VARCHAR(40) PRIMARY KEY,
  actor_id VARCHAR(64) NOT NULL,
  filename VARCHAR(200) NOT NULL,
  status VARCHAR(32) NOT NULL,
  total INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lead_import_rows (
  batch_id VARCHAR(40) NOT NULL,
  row_no INT NOT NULL,
  payload_cipher TEXT NULL,
  status VARCHAR(32) NOT NULL,
  message VARCHAR(200) NOT NULL DEFAULT '',
  PRIMARY KEY (batch_id, row_no),
  FOREIGN KEY (batch_id) REFERENCES lead_import_batches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lead_do_not_call (
  phone_key CHAR(64) PRIMARY KEY,
  reason VARCHAR(500) NOT NULL,
  actor_id VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reserved only: no provider, recording or automatic calling is configured.
CREATE TABLE lead_call_records (
  id VARCHAR(40) PRIMARY KEY,
  lead_id VARCHAR(40) NOT NULL,
  provider_reference VARCHAR(160) NULL UNIQUE,
  duration_seconds INT NULL,
  recording_object_key VARCHAR(500) NULL,
  recording_notice_status VARCHAR(32) NOT NULL DEFAULT 'unknown',
  result VARCHAR(40) NULL,
  created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
