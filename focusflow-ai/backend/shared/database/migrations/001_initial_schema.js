/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Users table
  await knex.schema.createTable('users', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).unique().notNullable();
    table.string('password_hash', 255);
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.string('display_name', 100);
    table.text('avatar_url');
    table.string('phone_number', 20);
    table.string('timezone', 50).defaultTo('UTC');
    table.string('language', 10).defaultTo('en');
    table.string('subscription_tier', 20).defaultTo('free');
    table.string('subscription_id', 255);
    table.boolean('is_email_verified').defaultTo(false);
    table.boolean('is_phone_verified').defaultTo(false);
    table.timestamp('last_login_at');
    table.jsonb('email_preferences').defaultTo('{}');
    table.jsonb('notification_preferences').defaultTo('{}');
    table.boolean('onboarding_completed').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at');
    
    table.index('email');
    table.index('subscription_tier');
    table.index('created_at');
  });

  // OAuth Accounts table
  await knex.schema.createTable('oauth_accounts', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('provider', 50).notNullable();
    table.string('provider_account_id', 255).notNullable();
    table.text('access_token');
    table.text('refresh_token');
    table.timestamp('expires_at');
    table.string('token_type', 50);
    table.text('scope');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.unique(['provider', 'provider_account_id']);
    table.index('user_id');
    table.index('provider');
  });

  // Sessions table
  await knex.schema.createTable('sessions', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('session_token', 255).unique().notNullable();
    table.string('device_type', 50);
    table.string('device_name', 100);
    table.string('device_os', 50);
    table.specificType('ip_address', 'inet');
    table.text('user_agent');
    table.jsonb('location');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_activity_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('user_id');
    table.index('session_token');
    table.index(['is_active'], 'idx_sessions_active', { predicate: knex.where('is_active', true) });
  });

  // Tasks table
  await knex.schema.createTable('tasks', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 500).notNullable();
    table.text('description');
    table.text('notes');
    table.enum('priority', ['low', 'medium', 'high', 'urgent']).notNullable();
    table.enum('status', ['pending', 'in_progress', 'completed', 'cancelled', 'archived']).defaultTo('pending');
    table.string('category', 100);
    table.specificType('tags', 'text[]');
    table.timestamp('due_date');
    table.timestamp('start_date');
    table.integer('estimated_minutes');
    table.integer('actual_minutes');
    table.timestamp('completed_at');
    table.uuid('parent_task_id').references('id').inTable('tasks').onDelete('CASCADE');
    table.uuid('goal_id');
    table.uuid('calendar_event_id');
    table.text('recurrence_rule');
    table.jsonb('attachments').defaultTo('[]');
    table.boolean('ai_generated').defaultTo(false);
    table.decimal('ai_priority_score', 5, 2);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at');
    
    table.index('user_id');
    table.index('status');
    table.index('priority');
    table.index('due_date');
    table.index('category');
    table.index('goal_id');
    table.index('parent_task_id');
    table.index('created_at');
    table.index('completed_at');
  });

  // Goals table
  await knex.schema.createTable('goals', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 500).notNullable();
    table.text('description');
    table.string('category', 100);
    table.timestamp('target_date');
    table.timestamp('start_date').defaultTo(knex.fn.now());
    table.integer('progress').defaultTo(0).checkBetween([0, 100]);
    table.enum('status', ['active', 'completed', 'paused', 'cancelled']).defaultTo('active');
    table.boolean('is_public').defaultTo(false);
    table.string('color', 7);
    table.string('icon', 50);
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('completed_at');
    table.timestamp('deleted_at');
    
    table.index('user_id');
    table.index('status');
    table.index('target_date');
    table.index('category');
    table.index('created_at');
  });

  // Milestones table
  await knex.schema.createTable('milestones', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('goal_id').references('id').inTable('goals').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 500).notNullable();
    table.text('description');
    table.integer('order_index').defaultTo(0);
    table.timestamp('target_date');
    table.timestamp('completed_at');
    table.enum('status', ['pending', 'completed', 'skipped']).defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('goal_id');
    table.index('user_id');
    table.index('status');
    table.index('target_date');
  });

  // Calendar Events table
  await knex.schema.createTable('calendar_events', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 500).notNullable();
    table.text('description');
    table.string('location', 500);
    table.timestamp('start_time').notNullable();
    table.timestamp('end_time').notNullable();
    table.boolean('all_day').defaultTo(false);
    table.text('recurrence_rule');
    table.jsonb('attendees').defaultTo('[]');
    table.string('event_type', 50).defaultTo('general');
    table.enum('source', ['manual', 'google', 'apple', 'outlook']).defaultTo('manual');
    table.string('external_event_id', 255);
    table.string('external_calendar_id', 255);
    table.timestamp('last_synced_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at');
    
    table.index('user_id');
    table.index('start_time');
    table.index('end_time');
    table.index('source');
    table.index('external_event_id');
    table.index('event_type');
  });

  // Notifications table
  await knex.schema.createTable('notifications', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.enum('type', ['task_reminder', 'goal_reminder', 'daily_plan', 'productivity_tip', 'system', 'achievement']).notNullable();
    table.string('title', 500).notNullable();
    table.text('body').notNullable();
    table.jsonb('data').defaultTo('{}');
    table.specificType('channels', 'text[]').defaultTo('{push,email,sms}');
    table.timestamp('scheduled_at').notNullable();
    table.timestamp('sent_at');
    table.timestamp('delivered_at');
    table.timestamp('read_at');
    table.enum('status', ['pending', 'sent', 'delivered', 'read', 'failed', 'cancelled']).defaultTo('pending');
    table.text('error_message');
    table.integer('retry_count').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('user_id');
    table.index('status');
    table.index('scheduled_at');
    table.index('type');
  });

  // Notification Preferences table
  await knex.schema.createTable('notification_preferences', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('notification_type', 50).notNullable();
    table.boolean('enabled').defaultTo(true);
    table.jsonb('channels').defaultTo('{"push": true, "email": true, "sms": false}');
    table.string('time_preference', 50);
    table.time('quiet_hours_start');
    table.time('quiet_hours_end');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.unique(['user_id', 'notification_type']);
    table.index('user_id');
  });

  // AI Conversations table
  await knex.schema.createTable('ai_conversations', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.enum('conversation_type', ['daily_planning', 'productivity_insight', 'task_suggestion', 'general_chat']).notNullable();
    table.string('title', 500);
    table.jsonb('context').defaultTo('{}');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('user_id');
    table.index('conversation_type');
    table.index('created_at');
  });

  // AI Messages table
  await knex.schema.createTable('ai_messages', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('conversation_id').references('id').inTable('ai_conversations').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.enum('role', ['user', 'assistant', 'system']).notNullable();
    table.text('content').notNullable();
    table.integer('tokens_used');
    table.string('model', 50);
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('conversation_id');
    table.index('user_id');
    table.index('created_at');
  });

  // Analytics Events table
  await knex.schema.createTable('analytics_events', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('event_type', 100).notNullable();
    table.string('event_name', 200).notNullable();
    table.jsonb('properties').defaultTo('{}');
    table.uuid('session_id');
    table.string('device_type', 50);
    table.string('platform', 50);
    table.string('app_version', 50);
    table.specificType('ip_address', 'inet');
    table.text('user_agent');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('user_id');
    table.index('event_type');
    table.index('event_name');
    table.index('created_at');
    table.index('session_id');
  });

  // Productivity Stats table
  await knex.schema.createTable('productivity_stats', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.date('stat_date').notNullable();
    table.integer('tasks_created').defaultTo(0);
    table.integer('tasks_completed').defaultTo(0);
    table.integer('tasks_completed_on_time').defaultTo(0);
    table.integer('goals_progressed').defaultTo(0);
    table.integer('goals_completed').defaultTo(0);
    table.integer('focus_minutes').defaultTo(0);
    table.integer('pomodoro_sessions').defaultTo(0);
    table.integer('ai_plans_generated').defaultTo(0);
    table.decimal('productivity_score', 5, 2);
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.unique(['user_id', 'stat_date']);
    table.index('user_id');
    table.index('stat_date');
  });

  // Settings table
  await knex.schema.createTable('settings', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('key', 100).notNullable();
    table.jsonb('value').notNullable();
    table.string('category', 50);
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.unique(['user_id', 'key']);
    table.index('user_id');
    table.index('category');
  });

  // Integrations table
  await knex.schema.createTable('integrations', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.enum('integration_type', ['google_calendar', 'outlook_calendar', 'apple_calendar', 'slack', 'notion', 'todoist']).notNullable();
    table.text('access_token');
    table.text('refresh_token');
    table.string('external_user_id', 255);
    table.jsonb('external_account_data').defaultTo('{}');
    table.enum('status', ['active', 'disabled', 'error', 'revoked']).defaultTo('active');
    table.timestamp('last_sync_at');
    table.text('error_message');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.unique(['user_id', 'integration_type']);
    table.index('user_id');
    table.index('integration_type');
    table.index('status');
  });

  // Audit Logs table
  await knex.schema.createTable('audit_logs', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('action', 100).notNullable();
    table.string('entity_type', 100);
    table.uuid('entity_id');
    table.jsonb('old_values');
    table.jsonb('new_values');
    table.specificType('ip_address', 'inet');
    table.text('user_agent');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('user_id');
    table.index('action');
    table.index(['entity_type', 'entity_id']);
    table.index('created_at');
  });

  // Teams table
  await knex.schema.createTable('teams', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.text('description');
    table.uuid('owner_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('plan', 20).defaultTo('free');
    table.integer('max_members').defaultTo(5);
    table.jsonb('settings').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('owner_id');
  });

  // Team Members table
  await knex.schema.createTable('team_members', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('team_id').references('id').inTable('teams').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.enum('role', ['owner', 'admin', 'member', 'viewer']).defaultTo('member');
    table.jsonb('permissions').defaultTo('{}');
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    
    table.unique(['team_id', 'user_id']);
    table.index('team_id');
    table.index('user_id');
  });

  // Subscriptions table
  await knex.schema.createTable('subscriptions', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('stripe_subscription_id', 255).unique();
    table.string('stripe_customer_id', 255);
    table.string('plan_type', 50).notNullable();
    table.enum('status', ['active', 'trialing', 'past_due', 'cancelled', 'unpaid']).notNullable();
    table.timestamp('current_period_start');
    table.timestamp('current_period_end');
    table.boolean('cancel_at_period_end').defaultTo(false);
    table.timestamp('trial_end');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('user_id');
    table.index('status');
  });

  // Update timestamp trigger function
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Create triggers for auto-updating updated_at
  const tablesWithTimestamps = [
    'users', 'oauth_accounts', 'sessions', 'tasks', 'goals', 
    'milestones', 'calendar_events', 'notification_preferences',
    'ai_conversations', 'ai_messages', 'productivity_stats',
    'settings', 'integrations', 'teams', 'team_members', 'subscriptions'
  ];

  for (const tableName of tablesWithTimestamps) {
    await knex.raw(`
      CREATE TRIGGER update_${tableName}_updated_at
      BEFORE UPDATE ON ${tableName}
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Drop tables in reverse order to handle foreign keys
  await knex.schema.dropTableIfExists('subscriptions');
  await knex.schema.dropTableIfExists('team_members');
  await knex.schema.dropTableIfExists('teams');
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('integrations');
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('productivity_stats');
  await knex.schema.dropTableIfExists('analytics_events');
  await knex.schema.dropTableIfExists('ai_messages');
  await knex.schema.dropTableIfExists('ai_conversations');
  await knex.schema.dropTableIfExists('notification_preferences');
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('calendar_events');
  await knex.schema.dropTableIfExists('milestones');
  await knex.schema.dropTableIfExists('goals');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('oauth_accounts');
  await knex.schema.dropTableIfExists('users');
  
  // Drop trigger function
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');
};
