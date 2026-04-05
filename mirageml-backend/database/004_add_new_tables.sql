CREATE TABLE IF NOT EXISTS templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    preview_image TEXT,
    elements JSONB NOT NULL DEFAULT '{}',
    canvas_size JSONB DEFAULT '{"width": 800, "height": 600}',
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at);

CREATE TABLE IF NOT EXISTS user_settings (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    editor_grid_visible BOOLEAN DEFAULT FALSE,
    editor_grid_size INTEGER DEFAULT 10,
    auto_save BOOLEAN DEFAULT TRUE,
    auto_save_interval INTEGER DEFAULT 60,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    default_canvas_size JSONB DEFAULT '{"width": 800, "height": 600}',
    language VARCHAR(10) DEFAULT 'ru',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

CREATE TABLE IF NOT EXISTS project_versions (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    elements JSONB NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_version ON project_versions(project_id, version);
CREATE INDEX IF NOT EXISTS idx_project_versions_created_at ON project_versions(created_at);

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
