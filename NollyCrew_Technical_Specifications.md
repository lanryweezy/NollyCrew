# NollyCrew Technical Specifications

## Database Schema (PostgreSQL)

### Core Tables

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    role user_role NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    kyc_status kyc_status DEFAULT 'pending',
    ratings_avg DECIMAL(3,2) DEFAULT 0.0,
    location JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User profiles (actors/crew)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    skills TEXT[],
    portfolio JSONB, -- Array of media URLs
    rates JSONB, -- {hourly: 50, daily: 400}
    availability_calendar JSONB,
    languages TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_type project_type NOT NULL,
    budget_total DECIMAL(12,2),
    status project_status DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Scripts
CREATE TABLE scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    content_url TEXT, -- S3 URL to script file
    version INTEGER DEFAULT 1,
    breakdown JSONB, -- AI-generated breakdown
    permissions JSONB, -- Access control
    created_at TIMESTAMP DEFAULT NOW()
);

-- Jobs (casting calls & crew posts)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    role_type VARCHAR(100) NOT NULL,
    description TEXT,
    rate DECIMAL(10,2),
    applications JSONB DEFAULT '[]',
    shortlisted JSONB DEFAULT '[]',
    hired_user_id UUID REFERENCES users(id),
    status job_status DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_id UUID REFERENCES users(id),
    payee_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    status transaction_status DEFAULT 'pending',
    escrow_release_date TIMESTAMP,
    fees DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participants UUID[] NOT NULL,
    project_id UUID REFERENCES projects(id),
    last_message_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    content TEXT,
    media_urls TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(50),
    entity_id UUID,
    data JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Enums
CREATE TYPE user_role AS ENUM ('actor', 'crew', 'producer', 'investor', 'admin');
CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE project_type AS ENUM ('movie', 'short_film', 'series', 'documentary');
CREATE TYPE project_status AS ENUM ('planning', 'pre_production', 'production', 'post_production', 'completed');
CREATE TYPE job_status AS ENUM ('open', 'closed', 'filled');
CREATE TYPE transaction_status AS ENUM ('pending', 'escrow', 'completed', 'refunded');
```

## API Endpoints (GraphQL Schema)

```graphql
type User {
  id: ID!
  email: String!
  role: UserRole!
  verified: Boolean!
  profile: Profile
  projects: [Project!]!
  ratings: [Rating!]!
}

type Profile {
  id: ID!
  user: User!
  bio: String
  skills: [String!]!
  portfolio: [Media!]!
  rates: Rates
  availability: Availability
  languages: [String!]!
}

type Project {
  id: ID!
  title: String!
  description: String
  producer: User!
  budget: Float
  status: ProjectStatus!
  script: Script
  jobs: [Job!]!
  team: [User!]!
  schedule: Schedule
}

type Job {
  id: ID!
  project: Project!
  roleType: String!
  description: String
  rate: Float
  applications: [Application!]!
  hiredUser: User
  status: JobStatus!
}

type Application {
  id: ID!
  job: Job!
  applicant: User!
  message: String
  media: [Media!]!
  status: ApplicationStatus!
}

type Transaction {
  id: ID!
  payer: User!
  payee: User!
  project: Project
  amount: Float!
  currency: String!
  status: TransactionStatus!
  escrowReleaseDate: DateTime
}

# Queries
type Query {
  # User queries
  me: User
  user(id: ID!): User
  users(filters: UserFilters): [User!]!
  
  # Project queries
  projects(filters: ProjectFilters): [Project!]!
  project(id: ID!): Project
  
  # Job queries
  jobs(filters: JobFilters): [Job!]!
  job(id: ID!): Job
  
  # Search
  searchTalent(query: String!, filters: TalentFilters): [User!]!
  searchProjects(query: String!, filters: ProjectFilters): [Project!]!
}

# Mutations
type Mutation {
  # Authentication
  signUp(input: SignUpInput!): AuthPayload!
  signIn(input: SignInInput!): AuthPayload!
  verifyKYC(input: KYCInput!): Boolean!
  
  # Profile management
  updateProfile(input: ProfileInput!): Profile!
  uploadMedia(file: Upload!, type: MediaType!): Media!
  
  # Project management
  createProject(input: ProjectInput!): Project!
  updateProject(id: ID!, input: ProjectInput!): Project!
  uploadScript(projectId: ID!, file: Upload!): Script!
  
  # Job management
  createJob(input: JobInput!): Job!
  applyToJob(jobId: ID!, input: ApplicationInput!): Application!
  hireTalent(jobId: ID!, userId: ID!): Job!
  
  # Payments
  createTransaction(input: TransactionInput!): Transaction!
  releaseEscrow(transactionId: ID!): Transaction!
  
  # Messaging
  sendMessage(threadId: ID!, content: String!, media: [Upload!]): Message!
  createThread(participants: [ID!]!, projectId: ID): MessageThread!
}

# Subscriptions
type Subscription {
  messageReceived(threadId: ID!): Message!
  projectUpdated(projectId: ID!): Project!
  jobStatusChanged(jobId: ID!): Job!
}
```

## AI/ML Components Specification

### 1. Script Analysis Engine

```python
class ScriptAnalyzer:
    def __init__(self):
        self.nlp_model = load_pretrained_model("script_analysis")
        self.character_extractor = CharacterExtractor()
        self.scene_analyzer = SceneAnalyzer()
    
    def analyze_script(self, script_text: str) -> ScriptBreakdown:
        """Extract characters, scenes, props, locations from script"""
        characters = self.character_extractor.extract(script_text)
        scenes = self.scene_analyzer.analyze(script_text)
        props = self.extract_props(script_text)
        locations = self.extract_locations(script_text)
        
        return ScriptBreakdown(
            characters=characters,
            scenes=scenes,
            props=props,
            locations=locations,
            estimated_crew_needs=self.estimate_crew_needs(scenes)
        )
    
    def estimate_crew_needs(self, scenes: List[Scene]) -> Dict[str, int]:
        """Estimate crew requirements based on scenes"""
        crew_needs = {
            'gaffer': 0,
            'sound_engineer': 0,
            'makeup_artist': 0,
            'editor': 1,  # Always need at least one
            'camera_operator': 0
        }
        
        for scene in scenes:
            if scene.has_night_shooting:
                crew_needs['gaffer'] += 1
            if scene.has_dialogue:
                crew_needs['sound_engineer'] += 1
            if scene.has_actors:
                crew_needs['makeup_artist'] += 1
            if scene.is_action_sequence:
                crew_needs['camera_operator'] += 2
        
        return crew_needs
```

### 2. Casting Recommendation Engine

```python
class CastingRecommender:
    def __init__(self):
        self.embedding_model = load_embedding_model()
        self.actor_database = ActorDatabase()
    
    def recommend_actors(self, role_description: str, project_context: Dict) -> List[ActorRecommendation]:
        """Recommend actors based on role and project context"""
        role_embedding = self.embedding_model.encode(role_description)
        
        # Get all available actors
        available_actors = self.actor_database.get_available_actors(
            location=project_context.get('location'),
            budget_range=project_context.get('budget_range')
        )
        
        recommendations = []
        for actor in available_actors:
            similarity = cosine_similarity(role_embedding, actor.profile_embedding)
            match_score = self.calculate_match_score(actor, role_description, project_context)
            
            recommendations.append(ActorRecommendation(
                actor=actor,
                similarity_score=similarity,
                match_score=match_score,
                reasons=self.get_match_reasons(actor, role_description)
            ))
        
        return sorted(recommendations, key=lambda x: x.match_score, reverse=True)[:10]
    
    def calculate_match_score(self, actor: Actor, role: str, context: Dict) -> float:
        """Calculate overall match score considering multiple factors"""
        base_score = 0.0
        
        # Experience match
        if actor.has_similar_roles(role):
            base_score += 0.3
        
        # Rating
        base_score += actor.rating * 0.2
        
        # Availability
        if actor.is_available(context['shooting_dates']):
            base_score += 0.2
        
        # Budget fit
        if actor.rate <= context['budget']:
            base_score += 0.2
        
        # Location proximity
        if actor.location.distance(context['location']) < 50:  # km
            base_score += 0.1
        
        return min(base_score, 1.0)
```

### 3. Scheduling Optimizer

```python
class ScheduleOptimizer:
    def __init__(self):
        self.constraint_solver = ConstraintSolver()
    
    def optimize_schedule(self, project: Project, constraints: ScheduleConstraints) -> Schedule:
        """Optimize shooting schedule considering all constraints"""
        variables = self.create_schedule_variables(project)
        constraints_list = self.build_constraints(project, constraints)
        
        solution = self.constraint_solver.solve(variables, constraints_list)
        
        return self.build_schedule(solution, project)
    
    def build_constraints(self, project: Project, constraints: ScheduleConstraints) -> List[Constraint]:
        """Build constraint list for optimization"""
        constraint_list = []
        
        # Actor availability constraints
        for actor in project.cast:
            constraint_list.append(
                AvailabilityConstraint(actor, actor.availability)
            )
        
        # Location availability constraints
        for location in project.locations:
            constraint_list.append(
                LocationConstraint(location, location.availability)
            )
        
        # Budget constraints
        constraint_list.append(
            BudgetConstraint(project.budget, constraints.max_daily_cost)
        )
        
        # Weather constraints (for outdoor scenes)
        for scene in project.scenes:
            if scene.is_outdoor:
                constraint_list.append(
                    WeatherConstraint(scene, constraints.weather_window)
                )
        
        return constraint_list
```

## Infrastructure Configuration

### Docker Compose (Development)

```yaml
version: '3.8'

services:
  # API Server
  api:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@db:5432/nollycrew
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./server:/app
      - /app/node_modules

  # Database
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=nollycrew
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # AI Service
  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/models
    volumes:
      - ./ai-service/models:/models

  # Media Processing
  media-processor:
    build: ./media-processor
    environment:
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - S3_BUCKET=${S3_BUCKET}
    volumes:
      - ./media-processor:/app

volumes:
  postgres_data:
```

### Kubernetes Deployment

```yaml
# api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nollycrew-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nollycrew-api
  template:
    metadata:
      labels:
        app: nollycrew-api
    spec:
      containers:
      - name: api
        image: nollycrew/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: nollycrew-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: nollycrew-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: nollycrew-api-service
spec:
  selector:
    app: nollycrew-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Security Implementation

### JWT Authentication

```typescript
// auth.service.ts
export class AuthService {
  private jwtSecret = process.env.JWT_SECRET;
  
  async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      verified: user.verified
    };
    
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: '15m',
      issuer: 'nollycrew'
    });
    
    const refreshToken = jwt.sign(
      { sub: user.id, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
  }
  
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

### Rate Limiting

```typescript
// rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';

export const createRateLimit = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Apply different limits for different endpoints
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const uploadRateLimit = createRateLimit(60 * 60 * 1000, 10); // 10 uploads per hour
```

This technical specification provides the foundation for building NollyCrew with all the necessary database schemas, API definitions, AI components, and infrastructure configurations.
