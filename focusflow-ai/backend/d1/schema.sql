-- Cloudflare D1 Database Schema for FocusFlow AI
-- Run: wrangler d1 execute focusflow-db --file=./schema.sql

-- Users Table (synced with Clerk)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                          -- Clerk user ID
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    subscription_tier TEXT DEFAULT 'free',       -- free, premium, enterprise
    subscription_status TEXT DEFAULT 'active',   -- active, cancelled, expired
    revenuecat_app_user_id TEXT,
    onboarding_completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- OAuth Accounts (for tracking provider connections)
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,                      -- google, apple, microsoft
    provider_account_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, provider)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    category TEXT,
    due_date DATETIME,
    start_date DATETIME,
    estimated_minutes INTEGER,
    actual_minutes INTEGER,
    completed_at DATETIME,
    goal_id TEXT,
    recurrence_rule TEXT,                        -- iCal RRULE format
    is_recurring INTEGER DEFAULT 0,
    parent_task_id TEXT,
    ai_generated INTEGER DEFAULT 0,
    ai_priority_score REAL,
    attachments TEXT,                            -- JSON array of R2 keys
    tags TEXT,                                   -- JSON array
    deleted_at DATETIME,                         -- Soft delete
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    target_date DATETIME,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER CHECK(progress >= 0 AND progress <= 100) DEFAULT 0,
    status TEXT CHECK(status IN ('active', 'completed', 'paused', 'cancelled')) DEFAULT 'active',
    is_public INTEGER DEFAULT 0,
    color TEXT,
    icon TEXT,
    completed_at DATETIME,
    deleted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Milestones Table
CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    target_date DATETIME,
    completed_at DATETIME,
    status TEXT CHECK(status IN ('pending', 'completed', 'skipped')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    all_day INTEGER DEFAULT 0,
    recurrence_rule TEXT,
    attendees TEXT,                              -- JSON array
    event_type TEXT DEFAULT 'general',
    source TEXT CHECK(source IN ('manual', 'google', 'apple', 'outlook')) DEFAULT 'manual',
    external_event_id TEXT,
    external_calendar_id TEXT,
    task_id TEXT,
    last_synced_at DATETIME,
    deleted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

-- AI Daily Plans Table
CREATE TABLE IF NOT EXISTS ai_daily_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan_date DATE NOT NULL,
    prioritized_tasks TEXT,                      -- JSON array of task priorities
    time_blocks TEXT,                            -- JSON array of scheduled blocks
    break_suggestions TEXT,                      -- JSON array
    carry_over_tasks TEXT,                       -- JSON array of task IDs
    productivity_insights TEXT,                    -- JSON object
    motivational_message TEXT,
    ai_model TEXT DEFAULT 'gemini-1.5-flash',
    tokens_used INTEGER,
    generation_time_ms INTEGER,
    accepted_by_user INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, plan_date)
);

-- AI Conversations Table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    conversation_type TEXT CHECK(conversation_type IN ('daily_planning', 'productivity_insight', 'task_suggestion', 'general_chat')),
    title TEXT,
    context TEXT,                                -- JSON object
    metadata TEXT,                               -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI Messages Table
CREATE TABLE IF NOT EXISTS ai_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT CHECK(role IN ('user', 'assistant', 'system')) NOT NULL,
    content TEXT NOT NULL,
    tokens_used INTEGER,
    model TEXT,
    metadata TEXT,                               -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reminders/Notifications Table
CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('task_due', 'goal_deadline', 'daily_plan', 'productivity_tip', 'milestone')) NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    scheduled_at DATETIME NOT NULL,
    sent_at DATETIME,
    read_at DATETIME,
    dismissed_at DATETIME,
    status TEXT CHECK(status IN ('pending', 'sent', 'read', 'dismissed', 'failed')) DEFAULT 'pending',
    related_entity_type TEXT,                    -- task, goal, milestone
    related_entity_id TEXT,
    metadata TEXT,                               -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reminder_type TEXT NOT NULL,
    enabled INTEGER DEFAULT 1,
    channels TEXT,                               -- JSON object {push: true, email: false}
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, reminder_type)
);

-- Productivity Stats Table (Daily Aggregates)
CREATE TABLE IF NOT EXISTS productivity_stats (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    stat_date DATE NOT NULL,
    tasks_created INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    tasks_completed_on_time INTEGER DEFAULT 0,
    goals_progressed INTEGER DEFAULT 0,
    goals_completed INTEGER DEFAULT 0,
    focus_minutes INTEGER DEFAULT 0,
    pomodoro_sessions INTEGER DEFAULT 0,
    ai_plans_generated INTEGER DEFAULT 0,
    productivity_score REAL,
    metadata TEXT,                               -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, stat_date)
);

-- Push Tokens Table (for Expo Notifications)
CREATE TABLE IF NOT EXISTS push_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expo_push_token TEXT NOT NULL,
    platform TEXT CHECK(platform IN ('ios', 'android', 'web')) NOT NULL,
    device_model TEXT,
    app_version TEXT,
    is_active INTEGER DEFAULT 1,
    last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Integrations Table (Third-party connections)
CREATE TABLE IF NOT EXISTS integrations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    integration_type TEXT CHECK(integration_type IN ('google_calendar', 'outlook_calendar', 'apple_calendar', 'notion', 'todoist')) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    external_user_id TEXT,
    external_account_data TEXT,                  -- JSON object
    status TEXT CHECK(status IN ('active', 'disabled', 'error', 'revoked')) DEFAULT 'active',
    last_sync_at DATETIME,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, integration_type)
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    old_values TEXT,                             -- JSON object
    new_values TEXT,                             -- JSON object
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT,                               -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON tasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_deleted_at ON calendar_events(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_at ON reminders(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);

CREATE INDEX IF NOT EXISTS idx_productivity_stats_user_id ON productivity_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_stats_date ON productivity_stats(stat_date);

CREATE INDEX IF NOT EXISTS idx_ai_plans_user_id ON ai_daily_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_plans_date ON ai_daily_plans(plan_date);

-- Triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_tasks_timestamp 
AFTER UPDATE ON tasks
BEGIN
    UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_goals_timestamp 
AFTER UPDATE ON goals
BEGIN
    UPDATE goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_calendar_events_timestamp 
AFTER UPDATE ON calendar_events
BEGIN
    UPDATE calendar_events SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
