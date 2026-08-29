# TestPilot AI — Database Entity & Schema Plan (Phase 1)

## 1. Relational Database: PostgreSQL

### Entity-Relationship Architecture

```text
 Users (1) ────< (N) Projects (1) ────< (N) Repositories
                        │
                        ├────< (N) AnalysisRuns ────< (N) CodeFindings
                        │                             └──< (1) CoverageReport
                        ├────< (N) CodeClasses ────< (N) CodeMethods
                        ├────< (N) ApiEndpoints
                        ├────< (N) TestCases ────< (N) TestResults
                        ├────< (N) TestRuns ─────< (N) TestResults
                        ├────< (N) QualityReports
                        └────< (N) AiRequests ────< (1) AiResponse
```

---

## 2. Core Table Schemas & DDL

```sql
-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'DEVELOPER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    repository_url VARCHAR(500) NOT NULL,
    default_branch VARCHAR(100) NOT NULL DEFAULT 'main',
    current_branch VARCHAR(100) NOT NULL DEFAULT 'main',
    language VARCHAR(50) NOT NULL DEFAULT 'JAVA',
    build_system VARCHAR(50) NOT NULL DEFAULT 'MAVEN',
    framework VARCHAR(50) NOT NULL DEFAULT 'SPRING_BOOT',
    quality_score NUMERIC(5,2),
    coverage_percentage NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Code Classes Table
CREATE TABLE code_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    class_type VARCHAR(50) NOT NULL,
    spring_role VARCHAR(50) DEFAULT 'NONE',
    lines_of_code INT DEFAULT 0,
    complexity INT DEFAULT 1,
    coverage_percentage NUMERIC(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Code Methods Table
CREATE TABLE code_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES code_classes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    signature TEXT NOT NULL,
    return_type VARCHAR(255) NOT NULL,
    visibility VARCHAR(50) NOT NULL DEFAULT 'PUBLIC',
    start_line INT NOT NULL,
    end_line INT NOT NULL,
    cyclomatic_complexity INT NOT NULL DEFAULT 1,
    is_covered BOOLEAN DEFAULT FALSE,
    has_existing_test BOOLEAN DEFAULT FALSE,
    priority_score NUMERIC(5,2) DEFAULT 0.0,
    priority_level VARCHAR(20) DEFAULT 'MEDIUM',
    code_snippet TEXT
);

-- 5. API Endpoints Table
CREATE TABLE api_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    http_method VARCHAR(10) NOT NULL,
    path VARCHAR(500) NOT NULL,
    controller_class VARCHAR(255) NOT NULL,
    handler_method VARCHAR(255) NOT NULL,
    request_dto VARCHAR(255),
    response_dto VARCHAR(255),
    requires_auth BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Test Cases Table
CREATE TABLE test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    target_class VARCHAR(255) NOT NULL,
    target_method VARCHAR(255) NOT NULL,
    test_class_name VARCHAR(255) NOT NULL,
    test_method_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    scenario_description TEXT,
    source_code TEXT NOT NULL,
    validation_status VARCHAR(50) DEFAULT 'VALID',
    execution_status VARCHAR(50) DEFAULT 'NOT_RUN',
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Code Findings Table (Static Analysis)
CREATE TABLE code_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    tool VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    rule VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    file VARCHAR(500) NOT NULL,
    line INT NOT NULL,
    remediation_suggestion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Quality Reports Table
CREATE TABLE quality_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    overall_score NUMERIC(5,2) NOT NULL,
    grade VARCHAR(5) NOT NULL,
    metrics JSONB NOT NULL,
    coverage_summary JSONB NOT NULL,
    findings_summary JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
