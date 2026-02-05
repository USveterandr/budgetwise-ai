# FocusFlow AI - Complete System Architecture

## 1. Architecture Diagram (Text-Based)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Mobile     │  │     Web      │  │   Desktop    │  │   Voice      │      │
│  │    App       │  │   Portal     │  │   Client     │  │  Assistant   │      │
│  │  (React      │  │  (Next.js)   │  │ (Electron)   │  │   (Phase 2)  │      │
│  │   Native)    │  │              │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │                 │                 │
│         └─────────────────┴─────────────────┴─────────────────┘                 │
│                           │                                                       │
│                           │ HTTPS/WebSocket                                       │
└───────────────────────────┼───────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  Kong / AWS API Gateway                                                │    │
│  │  - Rate Limiting                                                       │    │
│  │  - Authentication                                                      │    │
│  │  - Request/Response Transformation                                     │    │
│  │  - Load Balancing                                                       │    │
│  │  - Request Logging                                                      │    │
│  │  - Circuit Breakers                                                     │    │
│  └──────────────────────────────┬──────────────────────────────────────────┘    │
│                                 │                                               │
│         ┌───────────────────────┼───────────────────────┐                       │
│         │                       │                       │                       │
│         ▼                       ▼                       ▼                       │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                    │
│  │   Public     │     │   Private     │     │   Partner    │                    │
│  │   API        │     │   API         │     │   API        │                    │
│  └──────────────┘     └──────────────┘     └──────────────┘                    │
└───────────────────────────┼───────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION SERVICES LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                     Microservices Architecture                           │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │    │
│  │  │   Auth       │  │    User      │  │   Task       │                  │    │
│  │  │  Service     │  │  Service     │  │  Service     │                  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                  │    │
│  │                                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │    │
│  │  │   Goal       │  │  Calendar    │  │   AI         │                  │    │
│  │  │  Service     │  │  Service     │  │  Service     │                  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                  │    │
│  │                                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │    │
│  │  │ Notification │  │  Analytics   │  │   Partner    │                  │    │
│  │  │  Service     │  │  Service     │  │  Service     │                  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                  │    │
│  │                                                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS & CACHING LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                           Redis Cluster                                │    │
│  │  - Session Management                                                   │    │
│  │  - API Response Caching                                                  │    │
│  │  - Real-time Data Sync                                                   │    │
│  │  - Rate Limiting Storage                                                 │    │
│  │  - Pub/Sub for Real-time Updates                                         │    │
│  └──────────────────────────────┬──────────────────────────────────────────┘    │
│                                 │                                               │
└─────────────────────────────────┼───────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        DATA STORAGE LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐    │
│  │    PostgreSQL       │  │     MongoDB         │  │    Firebase         │    │
│  │  (Primary DB)       │  │   (Document Store)  │  │   (Real-time DB)    │    │
│  │                     │  │                     │  │                     │    │
│  │  - Users           │  │  - Task History     │  │  - Real-time Sync   │    │
│  │  - Auth Data       │  │  - AI Conversations │  │  - User Sessions    │    │
│  │  - Tasks           │  │  - Analytics Logs    │  │  - Push Tokens      │    │
│  │  - Goals           │  │  - Notifications    │  │  - Offline Cache    │    │
│  │  - Calendar Events │  │  - Audit Logs       │  │                     │    │
│  │  - Relations       │  │                     │  │                     │    │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐                               │
│  │   Elasticsearch    │  │    S3 / GCS         │                               │
│  │  (Search Engine)   │  │  (Object Storage)   │                               │
│  │                     │  │                     │                               │
│  │  - Task Search     │  │  - User Avatars     │                               │
│  │  - Full-text       │  │  - Attachments      │                               │
│  │  - Analytics       │  │  - Backups          │                               │
│  │  - Aggregations    │  │  - Exports          │                               │
│  └─────────────────────┘  └─────────────────────┘                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   OpenAI     │  │   Google     │  │   Microsoft  │  │    Apple     │       │
│  │    API       │  │  Calendar    │  │   Outlook    │  │  Calendar    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Stripe    │  │   RevenueCat │  │   Sentry     │  │   Datadog    │       │
│  │  (Payments)  │  │ (Subscriptions)│  │(Monitoring) │  │ (Analytics)  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                          │
│  │   SendGrid   │  │   Twilio     │  │   Segment    │                          │
│  │   (Email)    │  │  (SMS/Voice) │  │  (Analytics) │                          │
│  └──────────────┘  └──────────────┘  └──────────────┘                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE & DEVOPS LAYER                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                        Kubernetes Cluster                              │    │
│  │                                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │    │
│  │  │   Pods      │  │   Pods      │  │   Pods      │  │   Pods      │     │    │
│  │  │  (Services) │  │  (Services) │  │  (Services) │  │  (Services) │     │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │    │
│  │                                                                         │    │
│  │  - Auto-scaling                                                       │    │
│  │  - Self-healing                                                        │    │
│  │  - Rolling Updates                                                     │    │
│  │  - Resource Limits                                                      │    │
│  │                                                                         │    │
│  └──────────────────────────────┬──────────────────────────────────────────┘    │
│                                 │                                               │
│  ┌──────────────────────────────┼──────────────────────────────────────────┐    │
│  │                              │                              │           │    │
│  │  ┌────────────────────────────▼──────────────────────────────────┐    │    │
│  │  │                   Load Balancers                             │    │    │
│  │  │  (Nginx / AWS ALB)                                            │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  │                              │                              │           │    │
│  └──────────────────────────────┼──────────────────────────────────────────┘    │
│                                 │                                               │
└─────────────────────────────────┼───────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CLOUD PROVIDER (AWS / GCP)                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   VPC        │  │   Security   │  │   IAM        │  │   Cloud      │       │
│  │   Network    │  │   Groups     │  │   Roles      │  │   Watch      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   RDS        │  │   Elastic    │  │   S3         │  │   CloudFront │       │
│  │   Database   │  │  Cache       │  │  Storage     │  │    CDN       │       │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYER                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                        WAF (Web Application Firewall)                   │    │
│  │  - DDoS Protection                                                      │    │
│  │  - SQL Injection Prevention                                              │    │
│  │  - XSS Prevention                                                         │    │
│  │  - Rate Limiting                                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                        CDN (Cloudflare / AWS CloudFront)               │    │
│  │  - DDoS Protection                                                      │    │
│  │  - SSL/TLS Termination                                                   │    │
│  │  - Static Asset Caching                                                  │    │
│  │  - Global Edge Network                                                   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│                        MONITORING & LOGGING LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Prometheus │  │   Grafana    │  │   ELK Stack  │  │   Sentry     │       │
│  │   Metrics    │  │   Dashboards │  │   (Logs)     │  │  (Errors)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                          │
│  │   PagerDuty  │  │   PagerDuty  │  │   PagerDuty  │                          │
│  │  (Alerting)  │  │  (Incidents) │  │   (On-call)  │                          │
│  └──────────────┘  └──────────────┘  └──────────────┘                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CI/CD PIPELINE                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GitHub → GitHub Actions → Docker Build → Kubernetes Deploy → Monitoring         │
│                                                                                 │
│  - Automated Testing                                                           │
│  - Code Quality Checks                                                         │
│  - Security Scanning                                                           │
│  - Automated Deployments                                                       │
│  - Rollback Capability                                                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘


## 2. Database Schema

### 2.1 PostgreSQL Tables (Primary Relational Database)

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(100),
    avatar_url TEXT,
    phone_number VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    subscription_tier VARCHAR(20) DEFAULT 'free',
    subscription_id VARCHAR(255),
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_preferences JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_created_at ON users(created_at DESC);


-- OAuth Accounts Table (for Google, Apple, etc.)
CREATE TABLE oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    token_type VARCHAR(50),
    scope TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider ON oauth_accounts(provider);


-- Sessions Table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_type VARCHAR(50),
    device_name VARCHAR(100),
    device_os VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    location JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_active ON sessions(is_active) WHERE is_active = TRUE;


-- Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);


-- Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    notes TEXT,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'archived')),
    category VARCHAR(100),
    tags TEXT[],
    due_date TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE,
    estimated_minutes INTEGER,
    actual_minutes INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    calendar_event_id UUID REFERENCES calendar_events(id) ON DELETE SET NULL,
    recurrence_rule TEXT,
    attachments JSONB DEFAULT '[]',
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_priority_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_goal_id ON tasks(goal_id);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at DESC);


-- Goals Table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    target_date TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER CHECK (progress >= 0 AND progress <= 100) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    is_public BOOLEAN DEFAULT FALSE,
    color VARCHAR(7),
    icon VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_target_date ON goals(target_date);
CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_goals_created_at ON goals(created_at DESC);


-- Milestones Table
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    target_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_milestones_goal_id ON milestones(goal_id);
CREATE INDEX idx_milestones_user_id ON milestones(user_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_target_date ON milestones(target_date);


-- Calendar Events Table
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    location VARCHAR(500),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT,
    attendees JSONB DEFAULT '[]',
    event_type VARCHAR(50) DEFAULT 'general',
    source VARCHAR(50) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'google', 'apple', 'outlook')),
    external_event_id VARCHAR(255),
    external_calendar_id VARCHAR(255),
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_end_time ON calendar_events(end_time);
CREATE INDEX idx_calendar_events_source ON calendar_events(source);
CREATE INDEX idx_calendar_events_external_event_id ON calendar_events(external_event_id);
CREATE INDEX idx_calendar_events_type ON calendar_events(event_type);


-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('task_reminder', 'goal_reminder', 'daily_plan', 'productivity_tip', 'system', 'achievement')),
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    channels TEXT[] NOT NULL DEFAULT '{push,email,sms}',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'cancelled')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX idx_notifications_type ON notifications(type);


-- Notification Preferences Table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    channels JSONB DEFAULT '{"push": true, "email": true, "sms": false}',
    time_preference VARCHAR(50),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_type)
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);


-- AI Conversations Table
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_type VARCHAR(50) NOT NULL CHECK (conversation_type IN ('daily_planning', 'productivity_insight', 'task_suggestion', 'general_chat')),
    title VARCHAR(500),
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_type ON ai_conversations(conversation_type);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);


-- AI Messages Table
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER,
    model VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_user_id ON ai_messages(user_id);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at DESC);


-- Analytics Events Table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(200) NOT NULL,
    properties JSONB DEFAULT '{}',
    session_id UUID,
    device_type VARCHAR(50),
    platform VARCHAR(50),
    app_version VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE PARTITION BY RANGE (created_at);


-- Productivity Stats Table (Daily aggregates)
CREATE TABLE productivity_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    tasks_created INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    tasks_completed_on_time INTEGER DEFAULT 0,
    goals_progressed INTEGER DEFAULT 0,
    goals_completed INTEGER DEFAULT 0,
    focus_minutes INTEGER DEFAULT 0,
    pomodoro_sessions INTEGER DEFAULT 0,
    ai_plans_generated INTEGER DEFAULT 0,
    productivity_score DECIMAL(5,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, stat_date)
);

CREATE INDEX idx_productivity_stats_user_id ON productivity_stats(user_id);
CREATE INDEX idx_productivity_stats_date ON productivity_stats(stat_date DESC);


-- Settings Table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, key)
);

CREATE INDEX idx_settings_user_id ON settings(user_id);
CREATE INDEX idx_settings_category ON settings(category);


-- Integrations Table
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('google_calendar', 'outlook_calendar', 'apple_calendar', 'slack', 'notion', 'todoist')),
    access_token TEXT,
    refresh_token TEXT,
    external_user_id VARCHAR(255),
    external_account_data JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'error', 'revoked')),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, integration_type)
);

CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_type ON integrations(integration_type);
CREATE INDEX idx_integrations_status ON integrations(status);


-- Audit Log Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);


-- Team Members Table (for team collaboration)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);


-- Teams Table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(20) DEFAULT 'free',
    max_members INTEGER DEFAULT 5,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_owner_id ON teams(owner_id);


-- Subscriptions Table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_end TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);


### 2.2 MongoDB Collections (Document Store)

```javascript
// Task History Collection
{
  _id: ObjectId,
  taskId: UUID,
  userId: UUID,
  action: String, // "created", "updated", "completed", "deleted", "restored"
  changes: {
    before: Object,
    after: Object
  },
  timestamp: Date,
  actor: {
    userId: UUID,
    type: String, // "user", "system", "ai"
  },
  metadata: Object
}

Indexes:
- taskId: 1, timestamp: -1
- userId: 1, timestamp: -1


// AI Conversations History Collection (Full chat history)
{
  _id: ObjectId,
  conversationId: UUID,
  userId: UUID,
  type: String, // "daily_planning", "productivity_insight", "task_suggestion"
  messages: [{
    role: String, // "user", "assistant", "system"
    content: String,
    timestamp: Date,
    tokens: Number,
    model: String
  }],
  context: {
    tasks: Array,
    goals: Array,
    calendarEvents: Array,
    preferences: Object
  },
  summary: String, // AI-generated conversation summary
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- userId: 1, createdAt: -1
- conversationId: 1


// Analytics Logs Collection (High-volume analytics data)
{
  _id: ObjectId,
  userId: UUID,
  sessionId: String,
  eventType: String,
  eventName: String,
  properties: Object,
  platform: String, // "ios", "android", "web", "desktop"
  appVersion: String,
  osVersion: String,
  deviceModel: String,
  location: {
    country: String,
    city: String,
    coordinates: [Number, Number]
  },
  network: {
    type: String, // "wifi", "cellular", "unknown"
    quality: String
  },
  timestamp: Date
}

Indexes:
- userId: 1, timestamp: -1
- eventType: 1, timestamp: -1
- sessionId: 1, timestamp: 1
- timestamp: -1 (TTL: 90 days)


// Notification History Collection
{
  _id: ObjectId,
  notificationId: UUID,
  userId: UUID,
  type: String,
  title: String,
  body: String,
  channels: Array, // ["push", "email", "sms"]
  deliveryStatus: {
    push: {
      sent: Boolean,
      delivered: Boolean,
      opened: Boolean,
      timestamp: Date
    },
    email: {
      sent: Boolean,
      delivered: Boolean,
      opened: Boolean,
      clicked: Boolean,
      timestamp: Date
    },
    sms: {
      sent: Boolean,
      delivered: Boolean,
      timestamp: Date
    }
  },
  metadata: Object,
  createdAt: Date
}

Indexes:
- userId: 1, createdAt: -1
- type: 1, createdAt: -1


// Cache Collection (Application-level cache)
{
  _id: ObjectId,
  key: String, // Unique cache key
  value: Object,
  ttl: Number, // Time-to-live in seconds
  tags: Array, // For cache invalidation
  metadata: Object,
  createdAt: Date,
  expiresAt: Date
}

Indexes:
- key: 1 (unique)
- expiresAt: 1 (TTL index)


// Session Activity Logs Collection
{
  _id: ObjectId,
  sessionId: UUID,
  userId: UUID,
  action: String, // "login", "logout", "page_view", "api_call", etc.
  page: String,
  apiEndpoint: String,
  method: String,
  statusCode: Number,
  responseTime: Number, // ms
  userAgent: String,
  ipAddress: String,
  timestamp: Date
}

Indexes:
- sessionId: 1, timestamp: -1
- userId: 1, timestamp: -1
- timestamp: -1 (TTL: 30 days)
```


### 2.3 Firebase Collections (Real-time Database)

```javascript
// Users Collection
/users/{userId}
{
  profile: {
    displayName: String,
    email: String,
    avatarUrl: String,
    lastActive: Timestamp
  },
  settings: {
    theme: String,
    language: String,
    timezone: String
  },
  pushTokens: {
    [deviceToken]: {
      platform: String,
      deviceModel: String,
      lastUsed: Timestamp
    }
  },
  onlineStatus: {
    isOnline: Boolean,
    lastSeen: Timestamp,
    currentDevice: String
  }
}


// Real-time Tasks Collection
/tasks/{taskId}
{
  title: String,
  status: String,
  priority: String,
  dueDate: Timestamp,
  assignedTo: String, // userId
  collaborators: [String],
  lastModified: Timestamp,
  lastModifiedBy: String,
  isSynced: Boolean
}


// Real-time Activity Feed
/activity/{userId}/{activityId}
{
  type: String, // "task_completed", "goal_achieved", "milestone_reached"
  title: String,
  description: String,
  icon: String,
  timestamp: Timestamp,
  data: Object
}


// Offline Sync Queue
/offlineQueue/{userId}/{itemId}
{
  action: String, // "create", "update", "delete"
  entityType: String, // "task", "goal", "event"
  entityData: Object,
  entityId: String,
  timestamp: Timestamp,
  retryCount: Number
}


// Real-time Presence
/presence/{userId}
{
  isOnline: Boolean,
  lastSeen: Timestamp,
  currentSession: String,
  deviceInfo: {
    platform: String,
    model: String
  }
}


// Collaborative Sessions (for real-time collaboration)
/collaborativeSessions/{sessionId}
{
  type: String, // "task_editing", "goal_planning"
  participants: [String],
  currentEditor: String,
  lockedEntity: {
    type: String,
    id: String
  },
  lastActivity: Timestamp
}
```


### 2.4 Elasticsearch Indices (Search Engine)

```json
// Tasks Index
{
  "mappings": {
    "properties": {
      "userId": { "type": "keyword" },
      "title": { 
        "type": "text",
        "analyzer": "standard"
      },
      "description": { 
        "type": "text",
        "analyzer": "standard"
      },
      "status": { "type": "keyword" },
      "priority": { "type": "keyword" },
      "category": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "dueDate": { "type": "date" },
      "createdAt": { "type": "date" },
      "completedAt": { "type": "date" },
      "aiPriorityScore": { "type": "float" },
      "suggest": {
        "type": "completion",
        "analyzer": "simple"
      }
    }
  }
}


// Goals Index
{
  "mappings": {
    "properties": {
      "userId": { "type": "keyword" },
      "title": { 
        "type": "text",
        "analyzer": "standard"
      },
      "description": { 
        "type": "text",
        "analyzer": "standard"
      },
      "category": { "type": "keyword" },
      "status": { "type": "keyword" },
      "progress": { "type": "integer" },
      "targetDate": { "type": "date" },
      "createdAt": { "type": "date" }
    }
  }
}


// Analytics Aggregations Index
{
  "mappings": {
    "properties": {
      "userId": { "type": "keyword" },
      "eventType": { "type": "keyword" },
      "eventName": { "type": "keyword" },
      "timestamp": { "type": "date" },
      "platform": { "type": "keyword" },
      "properties": { "type": "object" },
      "location": {
        "type": "geo_point"
      }
    }
  }
}
```


## 3. API Routes

### 3.1 Authentication Service API

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/resend-verification
POST   /api/v1/auth/change-password
GET    /api/v1/auth/me
PUT    /api/v1/auth/me
DELETE /api/v1/auth/me

// OAuth
GET    /api/v1/auth/oauth/google
GET    /api/v1/auth/oauth/google/callback
GET    /api/v1/auth/oauth/apple
GET    /api/v1/auth/oauth/apple/callback
GET    /api/v1/auth/oauth/microsoft
GET    /api/v1/auth/oauth/microsoft/callback
```


### 3.2 Users Service API

```
GET    /api/v1/users/{userId}
PUT    /api/v1/users/{userId}
PATCH   /api/v1/users/{userId}
DELETE /api/v1/users/{userId}

GET    /api/v1/users/{userId}/profile
PUT    /api/v1/users/{userId}/profile
GET    /api/v1/users/{userId}/settings
PUT    /api/v1/users/{userId}/settings
DELETE /api/v1/users/{userId}/settings/{key}

GET    /api/v1/users/{userId}/avatar
POST   /api/v1/users/{userId}/avatar
DELETE /api/v1/users/{userId}/avatar

GET    /api/v1/users/{userId}/sessions
DELETE /api/v1/users/{userId}/sessions/{sessionId}
DELETE /api/v1/users/{userId}/sessions/all
```


### 3.3 Tasks Service API

```
GET    /api/v1/tasks
POST   /api/v1/tasks
GET    /api/v1/tasks/{taskId}
PUT    /api/v1/tasks/{taskId}
PATCH   /api/v1/tasks/{taskId}
DELETE /api/v1/tasks/{taskId}

// Task Operations
POST   /api/v1/tasks/{taskId}/complete
POST   /api/v1/tasks/{taskId}/uncomplete
POST   /api/v1/tasks/{taskId}/archive
POST   /api/v1/tasks/{taskId}/restore
POST   /api/v1/tasks/{taskId}/duplicate

// Subtasks
GET    /api/v1/tasks/{taskId}/subtasks
POST   /api/v1/tasks/{taskId}/subtasks

// Task Attachments
GET    /api/v1/tasks/{taskId}/attachments
POST   /api/v1/tasks/{taskId}/attachments
DELETE /api/v1/tasks/{taskId}/attachments/{attachmentId}

// Task Search & Filter
GET    /api/v1/tasks/search?q={query}
GET    /api/v1/tasks/filter?status={status}&priority={priority}&dueDate={date}
GET    /api/v1/tasks/suggest?q={query}

// Task Bulk Operations
POST   /api/v1/tasks/bulk-complete
POST   /api/v1/tasks/bulk-delete
POST   /api/v1/tasks/bulk-update

// Task Analytics
GET    /api/v1/tasks/analytics
GET    /api/v1/tasks/analytics/completion-rate
GET    /api/v1/tasks/analytics/time-spent
GET    /api/v1/tasks/analytics/priority-distribution
```


### 3.4 Goals Service API

```
GET    /api/v1/goals
POST   /api/v1/goals
GET    /api/v1/goals/{goalId}
PUT    /api/v1/goals/{goalId}
PATCH   /api/v1/goals/{goalId}
DELETE /api/v1/goals/{goalId}

// Goal Progress
POST   /api/v1/goals/{goalId}/progress
PATCH   /api/v1/goals/{goalId}/progress
GET    /api/v1/goals/{goalId}/progress

// Milestones
GET    /api/v1/goals/{goalId}/milestones
POST   /api/v1/goals/{goalId}/milestones
PUT    /api/v1/goals/{goalId}/milestones/{milestoneId}
DELETE /api/v1/goals/{goalId}/milestones/{milestoneId}
POST   /api/v1/goals/{goalId}/milestones/{milestoneId}/complete

// Goal Analytics
GET    /api/v1/goals/analytics
GET    /api/v1/goals/analytics/completion-rate
GET    /api/v1/goals/analytics/time-to-complete
```


### 3.5 Calendar Service API

```
GET    /api/v1/calendar/events
POST   /api/v1/calendar/events
GET    /api/v1/calendar/events/{eventId}
PUT    /api/v1/calendar/events/{eventId}
DELETE /api/v1/calendar/events/{eventId}

// Calendar Sync
POST   /api/v1/calendar/sync/google
POST   /api/v1/calendar/sync/apple
POST   /api/v1/calendar/sync/outlook
GET    /api/v1/calendar/sync/status
POST   /api/v1/calendar/sync/now

// Calendar Integrations
GET    /api/v1/calendar/integrations
POST   /api/v1/calendar/integrations/google
POST   /api/v1/calendar/integrations/apple
POST   /api/v1/calendar/integrations/outlook
PUT    /api/v1/calendar/integrations/{integrationId}
DELETE /api/v1/calendar/integrations/{integrationId}

// Calendar Analytics
GET    /api/v1/calendar/analytics/busy-times
GET    /api/v1/calendar/analytics/event-distribution
```


### 3.6 AI Service API

```
// AI Conversations
GET    /api/v1/ai/conversations
POST   /api/v1/ai/conversations
GET    /api/v1/ai/conversations/{conversationId}
DELETE /api/v1/ai/conversations/{conversationId}

// AI Messages
POST   /api/v1/ai/conversations/{conversationId}/messages
GET    /api/v1/ai/conversations/{conversationId}/messages

// AI Features
POST   /api/v1/ai/daily-plan
POST   /api/v1/ai/productivity-insights
POST   /api/v1/ai/task-suggestions
POST   /api/v1/ai/smart-suggestion
POST   /api/v1/ai/analyze-performance

// AI Context Management
GET    /api/v1/ai/context
PUT    /api/v1/ai/context
DELETE /api/v1/ai/context

// AI Settings
GET    /api/v1/ai/settings
PUT    /api/v1/ai/settings
GET    /api/v1/ai/usage
```


### 3.7 Notification Service API

```
// Notifications
GET    /api/v1/notifications
POST   /api/v1/notifications
GET    /api/v1/notifications/{notificationId}
PATCH   /api/v1/notifications/{notificationId}/read
PATCH   /api/v1/notifications/read-all
DELETE /api/v1/notifications/{notificationId}

// Notification Preferences
GET    /api/v1/notifications/preferences
PUT    /api/v1/notifications/preferences
PATCH   /api/v1/notifications/preferences/{type}

// Notification Channels
POST   /api/v1/notifications/register-push-token
DELETE /api/v1/notifications/unregister-push-token
GET    /api/v1/notifications/channels
PUT    /api/v1/notifications/channels

// Notification Templates
GET    /api/v1/notifications/templates (Admin)
POST   /api/v1/notifications/templates (Admin)
PUT    /api/v1/notifications/templates/{templateId} (Admin)
DELETE /api/v1/notifications/templates/{templateId} (Admin)
```


### 3.8 Analytics Service API

```
// Event Tracking
POST   /api/v1/analytics/events
GET    /api/v1/analytics/events/{eventId}

// User Analytics
GET    /api/v1/analytics/users/{userId}
GET    /api/v1/analytics/users/{userId}/productivity
GET    /api/v1/analytics/users/{userId}/goals
GET    /api/v1/analytics/users/{userId}/tasks
GET    /api/v1/analytics/users/{userId}/calendar

// App Analytics
GET    /api/v1/analytics/app/dau (Daily Active Users)
GET    /api/v1/analytics/app/mau (Monthly Active Users)
GET    /api/v1/analytics/app/retention
GET    /api/v1/analytics/app/conversion-funnel
GET    /api/v1/analytics/app/feature-usage

// Reports
GET    /api/v1/analytics/reports/weekly
GET    /api/v1/analytics/reports/monthly
POST   /api/v1/analytics/reports/custom
```


### 3.9 Integration Service API

```
// Available Integrations
GET    /api/v1/integrations/available

// User Integrations
GET    /api/v1/integrations
POST   /api/v1/integrations/google-calendar
POST   /api/v1/integrations/outlook-calendar
POST   /api/v1/integrations/apple-calendar
POST   /api/v1/integrations/notion
POST   /api/v1/integrations/slack
POST   /api/v1/integrations/todoist

// Integration Management
GET    /api/v1/integrations/{integrationId}
PUT    /api/v1/integrations/{integrationId}
DELETE /api/v1/integrations/{integrationId}
POST   /api/v1/integrations/{integrationId}/sync
GET    /api/v1/integrations/{integrationId}/sync-status
```


### 3.10 Subscription & Billing API

```
// Plans
GET    /api/v1/subscriptions/plans
GET    /api/v1/subscriptions/plans/{planId}

// User Subscription
GET    /api/v1/subscriptions
POST   /api/v1/subscriptions/checkout
POST   /api/v1/subscriptions/upgrade
POST   /api/v1/subscriptions/downgrade
POST   /api/v1/subscriptions/cancel
POST   /api/v1/subscriptions/reactivate

// Payment Methods
GET    /api/v1/subscriptions/payment-methods
POST   /api/v1/subscriptions/payment-methods
DELETE /api/v1/subscriptions/payment-methods/{paymentMethodId}
PUT    /api/v1/subscriptions/payment-methods/{paymentMethodId}/default

// Invoices
GET    /api/v1/subscriptions/invoices
GET    /api/v1/subscriptions/invoices/{invoiceId}
```


### 3.11 Webhooks (External)

```
POST   /webhooks/stripe
POST   /webhooks/openai (if needed)
POST   /webhooks/google-calendar
POST   /webhooks/outlook-calendar
POST   /webhooks/apple-calendar
```


## 4. Services & Modules

### 4.1 Microservices Architecture

#### 4.1.1 Auth Service
**Responsibilities:**
- User registration and authentication
- JWT token generation and validation
- OAuth integration (Google, Apple, Microsoft)
- Password reset and email verification
- Session management
- Permission verification

**Dependencies:**
- PostgreSQL (user data)
- Redis (sessions, rate limiting)
- SendGrid (email notifications)

**API Endpoints:** All `/api/v1/auth/*` routes


#### 4.1.2 User Service
**Responsibilities:**
- User profile management
- User settings and preferences
- Avatar upload and management
- Account deletion and GDPR compliance
- User search and discovery

**Dependencies:**
- PostgreSQL (user data)
- S3 (avatar storage)
- Redis (caching)

**API Endpoints:** All `/api/v1/users/*` routes


#### 4.1.3 Task Service
**Responsibilities:**
- Task CRUD operations
- Task priority management
- Task categorization and tagging
- Task search and filtering
- Task analytics and insights
- Subtask management
- Task attachments

**Dependencies:**
- PostgreSQL (task data)
- Redis (caching, real-time updates)
- Elasticsearch (full-text search)
- MongoDB (task history)
- S3 (attachments)

**API Endpoints:** All `/api/v1/tasks/*` routes


#### 4.1.4 Goal Service
**Responsibilities:**
- Goal CRUD operations
- Goal progress tracking
- Milestone management
- Goal analytics and insights
- Goal templates

**Dependencies:**
- PostgreSQL (goal data)
- Redis (caching, real-time updates)
- MongoDB (goal history)

**API Endpoints:** All `/api/v1/goals/*` routes


#### 4.1.5 Calendar Service
**Responsibilities:**
- Calendar event management
- Google Calendar sync
- Apple Calendar sync
- Outlook Calendar sync
- Calendar analytics
- Event conflict detection
- Recurring events handling

**Dependencies:**
- PostgreSQL (event data)
- Redis (caching, sync state)
- Google Calendar API
- Outlook Graph API
- Apple Calendar (via native SDKs)

**API Endpoints:** All `/api/v1/calendar/*` routes


#### 4.1.6 AI Service
**Responsibilities:**
- Daily plan generation
- Productivity insights
- Task prioritization (AI-based)
- Smart suggestions
- Conversational AI assistant
- Performance analysis

**Dependencies:**
- OpenAI API (GPT-4)
- MongoDB (conversation history)
- PostgreSQL (AI preferences)
- Redis (caching AI responses)

**API Endpoints:** All `/api/v1/ai/*` routes


#### 4.1.7 Notification Service
**Responsibilities:**
- Push notifications (FCM, APNs)
- Email notifications (SendGrid)
- SMS notifications (Twilio)
- In-app notifications
- Notification scheduling
- Notification preferences management
- Quiet hours handling

**Dependencies:**
- PostgreSQL (notification data)
- Redis (queue, scheduling)
- Firebase Cloud Messaging
- Apple Push Notification Service
- SendGrid (email)
- Twilio (SMS)

**API Endpoints:** All `/api/v1/notifications/*` routes


#### 4.1.8 Analytics Service
**Responsibilities:**
- Event tracking and logging
- User behavior analytics
- Productivity analytics
- App performance monitoring
- Custom reports generation
- Real-time dashboards

**Dependencies:**
- MongoDB (analytics events)
- PostgreSQL (aggregated stats)
- Elasticsearch (search, aggregations)
- Kafka (event streaming)

**API Endpoints:** All `/api/v1/analytics/*` routes


#### 4.1.9 Integration Service
**Responsibilities:**
- Third-party integrations management
- OAuth token management
- Webhook handling
- Data synchronization
- Integration status monitoring

**Dependencies:**
- PostgreSQL (integration data)
- Redis (sync state, rate limiting)
- Google APIs
- Microsoft Graph API
- Apple APIs
- Notion API
- Slack API
- Todoist API

**API Endpoints:** All `/api/v1/integrations/*` routes


#### 4.1.10 Subscription Service
**Responsibilities:**
- Subscription management
- Billing and invoicing
- Payment processing (via Stripe)
- Plan upgrades/downgrades
- Trial management
- Subscription analytics

**Dependencies:**
- PostgreSQL (subscription data)
- Stripe API
- RevenueCat (mobile subscriptions)
- Redis (caching)

**API Endpoints:** All `/api/v1/subscriptions/*` routes


### 4.2 Shared Modules

#### 4.2.1 Database Module
- Connection pooling
- Query builders
- Migration management
- Transaction handling
- Query logging

#### 4.2.2 Cache Module
- Redis client wrapper
- Cache key generation
- Cache invalidation
- Distributed locking
- Pub/Sub

#### 4.2.3 Logging Module
- Structured logging
- Log levels
- Log aggregation
- Error tracking

#### 4.2.4 Validation Module
- Request validation
- Schema validation
- Sanitization

#### 4.2.5 Event Bus Module
- Message publishing
- Message subscribing
- Event sourcing

#### 4.2.6 Metrics Module
- Metrics collection
- Performance monitoring
- Custom metrics

#### 4.2.7 Security Module
- Encryption/decryption
- Hashing
- Token generation
- Rate limiting

#### 4.2.8 File Storage Module
- S3 client wrapper
- File upload
- File download
- File deletion
- CDN integration


## 5. Deployment Plan

### 5.1 Infrastructure Overview

**Cloud Provider:** AWS (Primary) with GCP as backup/disaster recovery

**Regions:**
- Primary: us-east-1 (N. Virginia)
- Secondary: us-west-2 (Oregon) for HA
- Disaster Recovery: eu-west-1 (Ireland)


### 5.2 Environment Strategy

**Environments:**
1. **Development (dev)**
   - Single region (us-east-1)
   - Minimal replicas
   - Development database
   - Test AI models (GPT-3.5)
   - No CDN
   - Internal monitoring only

2. **Staging (staging)**
   - Multi-region (us-east-1, us-west-2)
   - Production-like configuration
   - Production database replica
   - Production AI models (GPT-4)
   - Full monitoring stack
   - Integration testing

3. **Production (prod)**
   - Multi-region with global load balancing
   - Auto-scaling with optimal replicas
   - Production database with read replicas
   - Production AI models
   - CDN enabled globally
   - Full observability stack
   - 99.99% SLA target


### 5.3 Kubernetes Deployment Architecture

#### 5.3.1 Cluster Configuration

**Production Cluster (Multi-AZ):**
- EKS Cluster: 3 nodes per AZ (total 9 nodes)
- Node Type: t3.xlarge (4 vCPU, 16 GB RAM)
- Total capacity: 36 vCPU, 144 GB RAM
- Auto-scaling: 3-15 nodes per AZ
- Maximum capacity: 180 vCPU, 720 GB RAM

**Staging Cluster:**
- EKS Cluster: 2 nodes (single AZ)
- Node Type: t3.medium (2 vCPU, 4 GB RAM)
- Total capacity: 4 vCPU, 8 GB RAM
- Auto-scaling: 2-5 nodes
- Maximum capacity: 20 vCPU, 40 GB RAM

**Development Cluster:**
- EKS Cluster: 1 node
- Node Type: t3.small (1 vCPU, 2 GB RAM)
- Total capacity: 1 vCPU, 2 GB RAM
- No auto-scaling

#### 5.3.2 Service Replication Strategy

```
Critical Services (High Availability):
- Auth Service: 3 replicas per AZ (9 total)
- User Service: 3 replicas per AZ (9 total)
- Task Service: 3 replicas per AZ (9 total)
- AI Service: 2 replicas per AZ (6 total)

Standard Services:
- Goal Service: 2 replicas per AZ (6 total)
- Calendar Service: 2 replicas per AZ (6 total)
- Notification Service: 2 replicas per AZ (6 total)
- Analytics Service: 2 replicas per AZ (6 total)

Support Services:
- Integration Service: 1 replica per AZ (3 total)
- Subscription Service: 1 replica per AZ (3 total)
```


### 5.4 Database Deployment

#### 5.4.1 PostgreSQL (RDS)

**Production:**
- Instance Type: db.r6g.2xlarge (8 vCPU, 64 GB RAM)
- Engine: PostgreSQL 15
- Multi-AZ Deployment: Yes
- Read Replicas: 2 (us-east-1a, us-east-1b)
- Storage: 1 TB Provisioned IOPS (10,000 IOPS)
- Backup Retention: 35 days
- Point-in-time Recovery: Enabled
- Performance Insights: Enabled
- Encryption at Rest: Enabled

**Staging:**
- Instance Type: db.t3.large (2 vCPU, 8 GB RAM)
- Multi-AZ Deployment: No
- Read Replicas: 1
- Storage: 100 GB
- Backup Retention: 7 days

**Development:**
- Instance Type: db.t3.micro (2 vCPU, 1 GB RAM)
- Storage: 20 GB

#### 5.4.2 MongoDB (DocumentDB)

**Production:**
- Instance Type: db.r6g.large (2 vCPU, 16 GB RAM)
- Cluster: 3-node cluster
- Replication Factor: 3
- Storage: 500 GB
- Backup Retention: 30 days

**Staging:**
- Instance Type: db.t3.medium (2 vCPU, 4 GB RAM)
- Cluster: 2-node cluster
- Storage: 100 GB

**Development:**
- Instance Type: db.t3.small (1 vCPU, 2 GB RAM)
- Single node

#### 5.4.3 Redis (ElastiCache)

**Production:**
- Node Type: cache.r6g.xlarge (4 vCPU, 32 GB RAM)
- Cluster Mode: Enabled
- Shards: 3
- Replicas per Shard: 2
- Total Memory: 384 GB
- Multi-AZ: Yes

**Staging:**
- Node Type: cache.t3.medium (1 vCPU, 3 GB RAM)
- Cluster Mode: Disabled
- Total Memory: 3 GB

**Development:**
- Node Type: cache.t3.micro (1 vCPU, 1 GB RAM)
- Single node

#### 5.4.4 Elasticsearch (Amazon OpenSearch)

**Production:**
- Instance Type: r6g.large.search (2 vCPU, 16 GB RAM)
- Nodes: 6 (3 master, 3 data)
- Storage: 500 GB
- Multi-AZ: Yes
- Automated snapshots: Daily

**Staging:**
- Instance Type: t3.medium.search (2 vCPU, 4 GB RAM)
- Nodes: 3
- Storage: 100 GB

**Development:**
- Instance Type: t3.small.search (1 vCPU, 2 GB RAM)
- Nodes: 1


### 5.5 Storage Deployment

#### 5.5.1 S3 Buckets

**Production Buckets:**
```
focusflow-prod-assets/
  - User avatars
  - Task attachments
  - Documents
  - CDN: CloudFront

focusflow-prod-backups/
  - Database backups
  - Retention: 90 days
  - Versioning: Enabled

focusflow-prod-logs/
  - Application logs
  - Access logs
  - Retention: 30 days
```

**Staging Buckets:**
```
focusflow-staging-assets/
focusflow-staging-backups/
focusflow-staging-logs/
```

**Development Buckets:**
```
focusflow-dev-assets/
focusflow-dev-logs/
```

#### 5.5.2 CloudFront Distribution

**Production:**
- Origin: S3 + ALB
- Caching: Optimized
- Price Class: Use Only US, Canada, Europe
- SSL/TLS: Full
- IPv6: Enabled
- WAF: Enabled

**Staging:**
- Origin: S3 + ALB
- Caching: Disabled
- SSL/TLS: Full
- IPv6: Disabled


### 5.6 CI/CD Pipeline

#### 5.6.1 GitHub Actions Workflow

```
1. Trigger:
   - Push to main branch
   - Pull request
   - Manual trigger

2. Steps:
   a. Checkout Code
      - Uses: actions/checkout@v3
   
   b. Setup Environment
      - Install Node.js 18
      - Install dependencies
      - Load environment variables
   
   c. Code Quality Checks
      - ESLint
      - Prettier check
      - TypeScript check
   
   d. Security Scanning
      - npm audit
      - Snyk security scan
      - OWASP dependency check
   
   e. Run Tests
      - Unit tests (Jest)
      - Integration tests
      - E2E tests (Cypress/Detox)
      - Coverage threshold: 80%
   
   f. Build Docker Images
      - Build multi-arch images (amd64, arm64)
      - Tag with commit SHA and branch
      - Push to ECR
   
   g. Deploy to Development
      - Update Kubernetes manifests
      - Apply to dev cluster
      - Wait for health checks
   
   h. Manual Approval (for staging/production)
      - Slack notification
      - Require 2 approvals
   
   i. Deploy to Staging
      - Blue-green deployment
      - Run smoke tests
      - Promote canary (10% traffic)
      - Monitor metrics (15 minutes)
      - Full traffic switch
   
   j. Deploy to Production
      - Blue-green deployment
      - Run smoke tests
      - Promote canary (5% traffic)
      - Monitor metrics (30 minutes)
      - Gradual traffic increase (25%, 50%, 100%)
      - Rollback if error rate > 1%
```

#### 5.6.2 Deployment Strategies

**Blue-Green Deployment:**
- Zero downtime
- Instant rollback
- Used for: All services

**Canary Deployment:**
- Gradual traffic increase
- Real user testing
- Used for: Critical services (Auth, Task)

**Rolling Update:**
- Gradual pod replacement
- Used for: Non-critical services


### 5.7 Monitoring & Observability

#### 5.7.1 Metrics Collection

**Prometheus:**
- Scrape interval: 15 seconds
- Retention: 30 days
- Storage: 500 GB

**Key Metrics:**
- Request rate (per service)
- Error rate (4xx, 5xx)
- Latency (p50, p95, p99)
- CPU/Memory usage
- Database connection pool
- Redis hit ratio
- API response times
- AI API costs

#### 5.7.2 Logging

**ELK Stack (Elasticsearch, Logstash, Kibana):**
- Log retention: 30 days
- Daily indices
- Automatic cleanup

**Log Levels:**
- ERROR: Immediate alert
- WARN: Daily digest
- INFO: Stored for analysis
- DEBUG: Not stored in production

#### 5.7.3 Tracing

**Jaeger / AWS X-Ray:**
- Distributed tracing
- Request latency analysis
- Service dependency map

#### 5.7.4 Alerting

**Alert Channels:**
- PagerDuty (Critical)
- Slack (Warning, Info)
- Email (Daily digest)

**Alert Rules:**
```
Critical (P0):
- Error rate > 5% for 5 minutes
- API latency > 2s for 10 minutes
- Database connection pool > 90%
- Redis down
- Service down (0 replicas)

Warning (P1):
- Error rate > 1% for 10 minutes
- API latency > 1s for 15 minutes
- CPU > 80% for 20 minutes
- Memory > 85% for 20 minutes

Info (P2):
- High traffic (2x normal)
- AI API quota approaching limit
- Storage usage > 80%
```

#### 5.7.5 Dashboards

**Grafana Dashboards:**
- Service health overview
- API performance
- Database performance
- Redis performance
- AI usage and costs
- User activity
- Error rates
- SLA tracking


### 5.8 Disaster Recovery

#### 5.8.1 Backup Strategy

**Automated Backups:**
- PostgreSQL: Daily full + hourly WAL
- MongoDB: Daily snapshots
- S3: Versioning enabled
- EBS: Daily snapshots

**Backup Locations:**
- Primary: us-east-1
- Secondary: us-west-2
- Cold storage: Glacier (30-day retention)

#### 5.8.2 Recovery Procedures

**RTO (Recovery Time Objective):**
- Critical services: 1 hour
- Non-critical services: 4 hours

**RPO (Recovery Point Objective):**
- Critical data: 15 minutes
- Non-critical data: 1 hour

**Failover Process:**
1. Detect failure (auto-monitoring)
2. Alert on-call team
3. Activate secondary region
4. Update DNS records
5. Verify services
6. Switch traffic
7. Monitor for 1 hour


### 5.9 Security Measures

#### 5.9.1 Network Security

**VPC Configuration:**
- Private subnets for services
- Public subnets for load balancers
- Database in private subnets
- NAT gateways for outbound traffic

**Security Groups:**
- Least privilege
- Specific IP ranges
- No inbound from internet to private subnets

#### 5.9.2 Application Security

**WAF (Web Application Firewall):**
- AWS WAF rules
- Rate limiting (1000 req/min per IP)
- SQL injection prevention
- XSS prevention
- Bot protection

**API Security:**
- API Gateway authentication
- JWT token validation
- Rate limiting per user
- Request signing for sensitive operations

**Secrets Management:**
- AWS Secrets Manager
- Automatic rotation (90 days)
- Encrypted at rest
- No secrets in code

#### 5.9.3 Data Security

**Encryption:**
- At rest: AES-256
- In transit: TLS 1.3
- Database encryption enabled
- S3 bucket encryption enabled

**Compliance:**
- GDPR compliant
- SOC 2 Type II
- HIPAA (if needed)
- CCPA compliant


### 5.10 Scaling Strategy

#### 5.10.1 Auto-scaling

**Horizontal Pod Autoscaler (HPA):**
- Metrics: CPU, Memory, Custom Metrics
- Scale up: CPU > 70% for 5 minutes
- Scale down: CPU < 30% for 10 minutes
- Maximum replicas per service: 10
- Minimum replicas per service: 2

**Cluster Autoscaler:**
- Scale up: Pending pods > 5 minutes
- Scale down: Node utilization < 20% for 30 minutes
- Maximum nodes: 50
- Minimum nodes: 3

#### 5.10.2 Database Scaling

**Read Replicas:**
- Auto-scaling based on read traffic
- Connection pooling (PgBouncer)
- Query optimization
- Regular maintenance windows

**MongoDB Scaling:**
- Automatic sharding
- Read preference optimization
- Index optimization


### 5.11 Cost Optimization

#### 5.11.1 Cost Monitoring

**AWS Cost Explorer:**
- Daily cost alerts
- Monthly budget: $10,000
- Cost allocation tags

**Optimization Measures:**
- Reserved instances for steady state (30% savings)
- Spot instances for non-critical workloads (70% savings)
- S3 lifecycle policies (move to Glacier after 90 days)
- Right-sizing instances based on usage

#### 5.11.2 AI Cost Management

**OpenAI API:**
- Token usage monitoring
- Cost per user tracking
- Rate limiting
- Caching responses
- Model selection based on complexity


### 5.12 Performance Targets

**SLA (Service Level Agreement):**
- Availability: 99.99% (52.56 minutes downtime/year)
- Uptime: 99.95% (4.38 hours downtime/year)
- API Response Time: < 200ms (p95)
- Database Query Time: < 100ms (p95)
- CDN Cache Hit Rate: > 95%

**Performance Benchmarks:**
- Login: < 500ms
- Load tasks: < 1s (100 tasks)
- Create task: < 300ms
- AI daily plan: < 5s
- Calendar sync: < 10s


### 5.13 Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing
- [ ] Code review approved
- [ ] Security scan clean
- [ ] Performance tests passing
- [ ] Database migrations prepared
- [ ] Rollback plan ready
- [ ] On-call team notified
- [ ] Stakeholders notified

**Post-Deployment:**
- [ ] Health checks passing
- [ ] Smoke tests passing
- [ ] Monitoring dashboards green
- [ ] Error rates within threshold
- [ ] Performance benchmarks met
- [ ] User acceptance testing
- [ ] Documentation updated
- [ ] Post-deployment review


### 5.14 Rollback Procedure

**Automatic Rollback Triggers:**
- Error rate > 5% for 2 minutes
- API latency > 5s for 5 minutes
- Service unavailable > 1 minute
- Database connection failures

**Manual Rollback Steps:**
1. Identify last stable deployment
2. Execute rollback command
3. Verify service health
4. Monitor metrics for 15 minutes
5. Notify team and stakeholders
6. Create incident report


### 5.15 Maintenance Windows

**Scheduled Maintenance:**
- Frequency: Monthly
- Duration: 2 hours max
- Time: 2:00 AM - 4:00 AM UTC
- Advance Notice: 7 days
- Zero downtime goal

**Emergency Maintenance:**
- Critical security patches
- Immediate bug fixes
- Service degradation
- No advance notice required


---

## Summary

This architecture provides a **highly scalable**, **resilient**, and **secure** foundation for the FocusFlow AI productivity virtual assistant application. Key highlights:

✅ **Microservices Architecture**: Independent, scalable services
✅ **Multi-Database Strategy**: PostgreSQL, MongoDB, Firebase, Elasticsearch
✅ **High Availability**: Multi-region, multi-AZ deployment
✅ **Zero Downtime**: Blue-green and canary deployments
✅ **Comprehensive Monitoring**: Metrics, logging, tracing, alerting
✅ **Security First**: WAF, encryption, secrets management, compliance
✅ **Cost Optimized**: Auto-scaling, reserved instances, spot instances
✅ **Disaster Recovery**: Backup strategy, failover procedures
✅ **99.99% SLA**: High availability targets with clear RTO/RPO
✅ **Production Ready**: Complete CI/CD pipeline with automated testing

The architecture is designed to handle **millions of users** and **billions of API requests** while maintaining excellent performance, reliability, and cost efficiency.

---

**Document Version:** 1.0  
**Last Updated:** February 2, 2026  
**Maintained By:** FocusFlow AI Engineering Team


```