# Enterprise LightRAG - Current System Diagram

> Current-state architecture for the repository. This document separates the implemented runtime from the recommended modular-monolith target shape.
>
> The application is a TypeScript LightRAG implementation inside a Next.js App Router application. It is not a Python LightRAG service and it is not currently decomposed into independently deployed domain services.

## 1. Primary System View

```mermaid
flowchart LR
    subgraph Clients["Clients and callers"]
        Browser["Browser UI\nNext.js React pages"]
        Bot["Chat bot\nREST client"]
        Advisor["AdvisorZone\nAPI client"]
        Admin["Admin operators"]
    end

    subgraph Edge["OpenShift edge"]
        Route["TLS edge Route\nHAProxy timeout"]
        Service["Cluster Service\nport 8080"]
    end

    subgraph Runtime["Application runtime: one Next.js standalone image"]
        Web["Web Deployment\n2 replicas in production\nnode server.js"]
        Scheduler["Scheduler Deployment\n1 replica\nsame image + cron flags"]

        subgraph App["Next.js modular monolith"]
            UI["App Router UI\nchat, knowledge, admin"]
            Rest["REST API routes\nauth, chat, files, jobs, admin"]
            GraphQL["GraphQL Yoga\nqueries and mutations"]
            Auth["Authentication\nDB JWT, PingOne/OIDC, IAM-C"]
            Permission["Authorization\nroles, departments, KB access"]
            Chat["Chat orchestrator\nconversation + budget + response"]
            Ingest["Document ingestion\nparsing, chunking, embeddings"]
            Retrieval["Retrieval\npgvector optional\nor in-process batch ranking"]
            Graph["Knowledge graph\nentities and relations"]
            Jobs["Job and cron modules\nRAGAS, image, table, online docs"]
            Storage["File storage adapter\nS3 primary, local fallback"]
            Integrations["Integration clients\nAI, MCP, Confluence, email"]
            Observability["Health, logs, Prometheus\nrequest and process telemetry"]
        end
    end

    subgraph Data["Durable data services"]
        Postgres[("PostgreSQL + Prisma\nusers, departments, KBs\ndocuments, chunks, chats\nmessages, feedback, jobs\ngraph, RAGAS, settings")]
        S3[("AWS S3\nsource documents\nExcel artifacts\nnormalization output")]
        Local[("Local filesystem\n/uploads and temp files\nnot shared between replicas")]
    end

    subgraph External["External systems"]
        OpenAI["OpenAI-compatible provider\nchat + embeddings + RAGAS"]
        SGPT["SecureGPT provider\nOAuth2 + optional mTLS"]
        PingOne["PingOne\nOIDC identity"]
        IAMC["IAM-C\nJWKS token verification"]
        MCP["MCP servers\nstdio or HTTP tools"]
        Confluence["Confluence / online sources"]
        SMTP["SMTP / email provider"]
        Prometheus["Prometheus scraper"]
    end

    Browser --> Route
    Bot --> Route
    Advisor --> Route
    Admin --> Route
    Route --> Service --> Web

    Web --> UI
    Web --> Rest
    Web --> GraphQL
    Web --> Observability
    Scheduler --> Jobs

    Rest --> Auth
    GraphQL --> Auth
    Auth --> Permission
    Rest --> Chat
    Rest --> Ingest
    Rest --> Storage
    Rest --> Jobs
    GraphQL --> Graph
    Chat --> Retrieval
    Chat --> Integrations
    Ingest --> Storage
    Ingest --> Integrations
    Ingest --> Jobs
    Jobs --> Ingest
    Jobs --> Graph
    Jobs --> Integrations

    Auth --> Postgres
    Permission --> Postgres
    Chat --> Postgres
    Retrieval --> Postgres
    Ingest --> Postgres
    Graph --> Postgres
    Jobs --> Postgres
    Storage --> S3
    Storage -.-> Local
    Integrations --> OpenAI
    Integrations --> SGPT
    Integrations --> MCP
    Jobs --> Confluence
    Jobs --> SMTP
    PingOne --> Auth
    IAMC --> Auth
    Prometheus --> Observability

    classDef client fill:#e8f1f8,stroke:#35627a,color:#102a43
    classDef edge fill:#fff3cd,stroke:#8a6d1d,color:#3d2f00
    classDef runtime fill:#e8f5e9,stroke:#397044,color:#173b1c
    classDef data fill:#f3e8ff,stroke:#7048a8,color:#27133d
    classDef external fill:#fdecec,stroke:#a33a3a,color:#4a1111

    class Browser,Bot,Advisor,Admin client
    class Route,Service edge
    class Web,Scheduler,UI,Rest,GraphQL,Auth,Permission,Chat,Ingest,Retrieval,Graph,Jobs,Storage,Integrations,Observability runtime
    class Postgres,S3,Local data
    class OpenAI,SGPT,PingOne,IAMC,MCP,Confluence,SMTP,Prometheus external
```

### Runtime interpretation

- The web deployment is horizontally scalable for HTTP traffic, but each replica has its own in-memory caches and rate-limit state.
- The scheduler is a separate OpenShift deployment, but it uses the same container image and relies on cron initialization from application module loading.
- Initial document ingestion and some Excel processing run from the web request process. Image and table processing use database job rows and scheduler polling.
- PostgreSQL is the system of record for authorization, metadata, vectors, chat history, jobs, graph data, and quality results.
- S3 is the intended production file store. Local storage is a fallback and is not shared across web replicas.

## 2. Application Module View

```mermaid
flowchart TB
    subgraph Boundary["Next.js application boundary"]
        Routes["App Router route handlers"]
        Pages["Server and client pages"]

        subgraph Security["Security and identity modules"]
            JWT["JWT verification\nHS256, issuer, audience"]
            OIDC["PingOne OIDC exchange"]
            IAM["IAM-C issuer + JWKS"]
            Keys["API key validation\nSHA-256 hash + expiry"]
            RBAC["Role and department permissions"]
            AdvisorIdentity["Advisor identity resolution"]
        end

        subgraph Core["Core domain modules"]
            ChatDomain["Chat and conversation domain"]
            KBDomain["Knowledge base domain"]
            FileDomain["Document and file domain"]
            FeedbackDomain["Feedback and analytics domain"]
            ConfigDomain["Settings, models, guardrails"]
        end

        subgraph Rag["RAG and AI modules"]
            LightRAG["LightRAGService\nTypeScript implementation"]
            FileProcessor["Document file processor\nPDF, DOCX, XLSX, TXT, MD"]
            Chunker["Markdown chunker\ncontextual retrieval"]
            Embeddings["Embedding generation\nretry and cache"]
            Ranker["TopK and similarity scoring"]
            GraphBuilder["Entity and relation builder"]
            Ragas["RAGAS validator\nThai and English"]
            MCPClient["MCP client and Excel tools"]
        end

        subgraph Async["Asynchronous modules"]
            Cron["node-cron registrations"]
            ImageWorker["Image processing worker"]
            TableWorker["Table description worker"]
            ExcelWorker["Excel normalization worker"]
            OnlineWorker["Online document refresh"]
        end
    end

    Routes --> JWT
    Routes --> OIDC
    Routes --> IAM
    Routes --> Keys
    Routes --> AdvisorIdentity
    JWT --> RBAC
    OIDC --> RBAC
    IAM --> RBAC
    Keys --> RBAC
    AdvisorIdentity --> RBAC

    Routes --> ChatDomain
    Routes --> KBDomain
    Routes --> FileDomain
    Routes --> FeedbackDomain
    Routes --> ConfigDomain
    Pages --> Routes

    ChatDomain --> LightRAG
    ChatDomain --> Ranker
    ChatDomain --> Ragas
    ChatDomain --> MCPClient
    KBDomain --> FileDomain
    FileDomain --> LightRAG
    LightRAG --> FileProcessor
    LightRAG --> Chunker
    LightRAG --> Embeddings
    LightRAG --> Ranker
    LightRAG --> GraphBuilder
    LightRAG --> Ragas
    LightRAG --> MCPClient

    Cron --> ImageWorker
    Cron --> TableWorker
    Cron --> ExcelWorker
    Cron --> OnlineWorker
    ImageWorker --> FileProcessor
    TableWorker --> FileProcessor
    ExcelWorker --> MCPClient
    OnlineWorker --> LightRAG
```

## 3. Document Ingestion and Enrichment

```mermaid
sequenceDiagram
    autonumber
    participant Caller as Browser or API caller
    participant Upload as POST /api/upload
    participant Auth as Auth + permission checks
    participant Store as FileStorageService
    participant DB as PostgreSQL
    participant RAG as LightRAGService
    participant Parser as File processor + chunker
    participant AI as AI provider
    participant Cron as Scheduler cron
    participant Worker as Image/table workers
    participant Object as S3 or local filesystem

    Caller->>Upload: multipart file + KB/department
    Upload->>Auth: verify JWT or role
    Auth->>DB: verify user, department, KB access
    Auth-->>Upload: authorized
    Upload->>Store: save source file
    Store->>Object: PutObject or local write
    Store->>DB: create document row
    DB-->>Store: document id
    Store-->>Upload: document id and storage reference
    Upload-)RAG: start processAndStoreDocument without waiting
    Upload-->>Caller: accepted; poll document status

    RAG->>Store: read source file
    Store->>Object: GetObject or local read
    Object-->>Store: file bytes
    Store-->>RAG: file bytes
    RAG->>Parser: extract text, images, tables
    Parser-->>RAG: normalized markdown and metadata
    RAG->>Parser: chunk markdown and apply contextual retrieval
    Parser-->>RAG: chunks
    loop Each embedding batch
        RAG->>AI: generate embeddings
        AI-->>RAG: vectors and usage
        RAG->>DB: write vector_chunks and token usage
    end
    RAG->>DB: create image/table job rows when required
    RAG->>DB: update document and KB status

    Cron->>DB: find pending image/table jobs
    Worker->>DB: atomically claim a job
    Worker->>Object: read source document
    Worker->>AI: vision or table-description calls
    AI-->>Worker: derived descriptions
    Worker->>DB: write derived chunks and progress
    Worker->>DB: mark job and document status

    Cron->>DB: find scheduled RAGAS, graph, retention, online-doc work
    Cron->>AI: RAGAS or graph model calls when enabled
    Cron->>DB: store validation, graph, schedule, and audit state
```

### Ingestion states

```mermaid
stateDiagram-v2
    [*] --> UPLOADED: source stored and document row created
    UPLOADED --> PROCESSING: ingestion starts
    PROCESSING --> PROCESSED: all required chunks stored
    PROCESSING --> FAILED: extraction, embedding, or database failure
    PROCESSED --> ENRICHING: image/table jobs pending
    ENRICHING --> PROCESSED: enrichment complete
    ENRICHING --> FAILED: enrichment failure
    FAILED --> PROCESSING: explicit reprocess
```

## 4. Chat and Retrieval Flow

```mermaid
sequenceDiagram
    autonumber
    participant User as Browser or AdvisorZone
    participant API as POST /api/chat
    participant Identity as JWT/API key/IAM-C
    participant Permission as Chat permission service
    participant DB as PostgreSQL
    participant Embed as Embedding provider
    participant Search as Retrieval engine
    participant Graph as Optional graph search
    participant MCP as MCP or Excel tools
    participant Model as Chat model
    participant Ledger as Message and cost ledger

    User->>API: message + knowledgeBaseId + optional chatId
    API->>Identity: resolve caller identity
    Identity-->>API: userId, role, API-key scope
    API->>Permission: validate user, department, KB, and chat ownership
    Permission->>DB: read access relationships
    DB-->>Permission: authorization result
    Permission-->>API: allowed or denied

    API->>DB: create or load chat and history
    API->>Embed: generate query embedding
    Embed-->>API: query vector and usage
    API->>Search: retrieve candidate chunks
    alt PGVECTOR_SEARCH_ENABLE=true
        Search->>DB: database-side vector similarity query
        DB-->>Search: nearest chunks
    else feature disabled
        Search->>DB: read vector chunks in batches
        Search-->>Search: score in application memory
    end
    Search-->>API: top chunks and sources

    opt GRAPH_SEARCH_ENABLE=true
        API->>Graph: search entities and relations
        Graph->>DB: graph query
        DB-->>Graph: graph context
        Graph-->>API: graph context
    end

    opt AI tool call requested
        API->>MCP: discover or execute KB tools
        MCP->>DB: load connection and tool metadata
        MCP-->>API: tool result
    end

    API->>Model: prompt + conversation + retrieved context
    Model-->>API: answer, citations, usage
    API->>Ledger: store assistant message, tokens, cost, budget rollup
    Ledger->>DB: write messages and accounting rows
    API-->>User: answer, sources, context, metrics, budget status
```

## 5. Authentication and Trust Boundaries

```mermaid
flowchart LR
    subgraph Untrusted["Untrusted callers"]
        Browser["Browser"]
        Bot["Chat bot"]
        AdvisorZone["AdvisorZone"]
    end

    subgraph Boundary["HTTPS and API boundary"]
        Route["OpenShift Route"]
        Headers["Authorization headers\ncookies\nAPI-key headers"]
    end

    subgraph Identity["Identity verification"]
        DBJWT["Database JWT\nHS256 + issuer + audience"]
        Ping["PingOne OIDC\nidentity exchange"]
        IAMC["IAM-C token\nJWKS + issuer + audience"]
        APIKey["API key\nSHA-256 lookup\nactive + expiry checks"]
        AdvisorHeader["x-advisor-email\ncurrently trusted in every env"]
    end

    subgraph Authorization["Authorization decision"]
        User["User identity"]
        Role["ADMIN / DEPARTMENTADMIN / USER"]
        Department["Department access"]
        KBAccess["Knowledge-base access"]
        ChatOwner["Chat and message ownership"]
        Resource["Protected resource"]
    end

    Browser --> Route
    Bot --> Route
    AdvisorZone --> Route
    Route --> Headers
    Headers --> DBJWT
    Headers --> Ping
    Headers --> IAMC
    Headers --> APIKey
    APIKey --> AdvisorHeader
    DBJWT --> User
    Ping --> User
    IAMC --> User
    AdvisorHeader --> User
    APIKey --> User
    User --> Role
    User --> Department
    User --> KBAccess
    User --> ChatOwner
    Role --> Resource
    Department --> Resource
    KBAccess --> Resource
    ChatOwner --> Resource

    classDef risk fill:#ffe0e0,stroke:#ad3030,color:#4a1111
    class AdvisorHeader risk
```

**Boundary note:** The diagram shows the intended authorization decision. The repository still contains route-level gaps, including unauthenticated chat history GET access, unscoped document status access, unscoped upload GET access, and GraphQL resolvers that do not consistently enforce context authorization.

## 6. Data Domain Map

```mermaid
erDiagram
    USER ||--o{ DEPARTMENT_ACCESS : receives
    DEPARTMENT ||--o{ DEPARTMENT_ACCESS : grants
    DEPARTMENT ||--o{ KNOWLEDGE_BASE : owns
    USER ||--o{ KNOWLEDGE_BASE : creates
    KNOWLEDGE_BASE ||--o{ KNOWLEDGE_BASE_ACCESS : grants
    USER ||--o{ KNOWLEDGE_BASE_ACCESS : receives
    KNOWLEDGE_BASE ||--o{ DOCUMENT : contains
    USER ||--o{ DOCUMENT : uploads
    DOCUMENT ||--o{ VECTOR_CHUNK : produces
    DOCUMENT ||--o| IMAGE_JOB : has
    DOCUMENT ||--o| TABLE_JOB : has
    KNOWLEDGE_BASE ||--o{ CHAT : scopes
    USER ||--o{ CHAT : owns
    CHAT ||--o{ MESSAGE : contains
    USER ||--o{ FEEDBACK : submits
    MESSAGE ||--o{ FEEDBACK : receives
    CHAT ||--o{ FEEDBACK : groups
    KNOWLEDGE_BASE ||--o{ GRAPH_ENTITY : contains
    GRAPH_ENTITY ||--o{ GRAPH_RELATION : source
    GRAPH_ENTITY ||--o{ GRAPH_RELATION : target
    KNOWLEDGE_BASE ||--o{ RAGAS_VALIDATION : evaluates
    USER ||--o{ API_KEY : creates
    API_KEY ||--o{ API_KEY_ACCESS : receives
    KNOWLEDGE_BASE ||--o{ API_KEY_ACCESS : grants
    USER ||--o{ USER_CHAT_BUDGET : spends
    DOCUMENT ||--o{ DOCUMENT_TOKEN_USAGE : costs

    USER {
        string id PK
        string username UK
        enum role
        boolean isActive
        string adminDepartmentId FK
        int tokenBudget
    }
    DEPARTMENT {
        string id PK
        string name
        string adminId FK
        boolean isActive
    }
    KNOWLEDGE_BASE {
        string id PK
        string departmentId FK
        enum status
        boolean isPublic
        string embeddingModel
        datetime nextGraphAt
        datetime nextRagasAt
    }
    DOCUMENT {
        string id PK
        string knowledgeBaseId FK
        string s3Key
        string localPath
        enum status
        int processedChunks
        int totalChunks
    }
    VECTOR_CHUNK {
        string id PK
        string documentId FK
        string knowledgeBaseId FK
        json metadata
        float_array embedding
    }
    CHAT {
        string id PK
        string userId FK
        string knowledgeBaseId FK
        string apiKeyId FK
        datetime pinnedAt
    }
    MESSAGE {
        string id PK
        string chatId FK
        enum role
        int inputTokens
        int outputTokens
    }
    IMAGE_JOB {
        string id PK
        string documentId FK
        enum status
        int processedImages
        int totalImages
    }
    TABLE_JOB {
        string id PK
        string documentId FK
        enum status
        int processedTables
        int totalTables
    }
```

## 7. OpenShift Runtime Topology

```mermaid
flowchart TB
    subgraph Namespace["OpenShift production namespace"]
        Config["Secret + ConfigMap\nDATABASE_URL, JWT, AI, S3, IAM-C"]
        Image["Container image\nNode 25 Alpine\nNext standalone server"]

        subgraph WebDeploy["enterprise-rag Deployment"]
            Web1["Web pod 1\ncron flags false"]
            Web2["Web pod 2\ncron flags false"]
            WebSvc["Service :8080"]
        end

        subgraph SchedulerDeploy["enterprise-rag-scheduler Deployment"]
            SchedulerPod["Scheduler pod\ncron flags true\nreplicas=1"]
        end

        Route["TLS Route\nstartup + readiness TCP probes"]
        Temp["emptyDir\nper-pod temporary files"]
        AwsSecret["AWS token Secret\nmounted in pods"]
    end

    Image --> Web1
    Image --> Web2
    Image --> SchedulerPod
    Config --> Web1
    Config --> Web2
    Config --> SchedulerPod
    Web1 --> WebSvc
    Web2 --> WebSvc
    Route --> WebSvc
    Temp --> Web1
    Temp --> Web2
    Temp --> SchedulerPod
    AwsSecret --> Web1
    AwsSecret --> Web2
    AwsSecret --> SchedulerPod
    Web1 --> DB[(PostgreSQL)]
    Web2 --> DB
    SchedulerPod --> DB
    Web1 --> S3[(AWS S3)]
    Web2 --> S3
    SchedulerPod --> S3

    classDef pod fill:#e8f5e9,stroke:#397044,color:#173b1c
    classDef infra fill:#fff3cd,stroke:#8a6d1d,color:#3d2f00
    class Web1,Web2,SchedulerPod pod
    class Config,Image,WebSvc,Route,Temp,AwsSecret infra
```

### Current deployment properties

| Boundary | Current behavior | Architectural consequence |
|---|---|---|
| Web replicas | Two pods share PostgreSQL and S3 | HTTP scaling is possible, but local caches and rate limits diverge |
| Scheduler | One pod, same image, environment-gated cron | Duplicate work is avoided by topology, not a general leader-election mechanism |
| Initial ingestion | Started from the upload request process | A web pod restart can interrupt processing |
| Image/table jobs | Database rows plus polling workers | More durable; workers can claim jobs atomically |
| Local files | Per-pod filesystem and `emptyDir` | Not a production source of truth in a multi-replica deployment |
| Vector search | Application-side fallback when pgvector flag is false | Retrieval cost grows with corpus size and pod memory |
| Readiness | TCP probe only | Pod can accept traffic while dependencies or application features are unhealthy |
| Metrics | Public Prometheus route with default process metrics | Requires network policy and domain-specific metrics for operations |

## 8. Recommended Modular-Monolith Target

This is the recommended evolution without splitting business domains into microservices.

```mermaid
flowchart LR
    Clients["Browser, bots, AdvisorZone"] --> Web["Web runtime\nNext.js UI + API\nstateless request handling"]
    Scheduler["Explicit scheduler process\ncron or platform scheduler"] --> Queue["Durable job queue\nPostgreSQL jobs, SQS, or Redis"]
    Web --> Queue
    Queue --> Worker["Explicit worker runtime\ningestion, Excel, image, table\nRAGAS and graph jobs"]

    Web --> Domain["Shared domain modules\nauth, permission, chat, KB\nfeedback, configuration"]
    Worker --> Domain
    Domain --> DB[("PostgreSQL\ntransactional system of record")]
    Web --> S3[("S3\ndurable document storage")]
    Worker --> S3
    Domain --> AI["AI provider adapter\nOpenAI or SGPT"]
    Worker --> AI
    Web --> Metrics["Central metrics and logs"]
    Worker --> Metrics
    Scheduler --> Metrics

    classDef runtime fill:#e8f5e9,stroke:#397044,color:#173b1c
    classDef data fill:#f3e8ff,stroke:#7048a8,color:#27133d
    classDef external fill:#fdecec,stroke:#a33a3a,color:#4a1111
    class Web,Scheduler,Queue,Worker,Domain runtime
    class DB,S3 data
    class AI,Metrics external
```

The first operational split should be the worker boundary, not separate services for chat, users, knowledge bases, or authorization. Those domains currently share transaction boundaries and should remain in one application until scale or ownership requires otherwise.

## 9. Source Map

The diagram is based on these implementation surfaces:

- [Next.js route handlers](../src/app/api/)
- [Chat API and RAG orchestration](../src/app/api/chat/route.ts)
- [TypeScript LightRAG service](../src/lib/lightrag.ts)
- [File storage adapter](../src/lib/fileStorage.ts)
- [AI provider configuration](../src/lib/aiProviderConfig.ts)
- [OpenAI-compatible client](../src/lib/aiClient.ts)
- [SecureGPT client](../src/lib/sgptClient.ts)
- [MCP client](../src/lib/mcpClient.ts)
- [Image processing worker](../src/lib/imageProcessingWorker.ts)
- [Table description worker](../src/lib/tableDescriptionWorker.ts)
- [Cron modules](../src/app/cron/)
- [Prisma data model](../prisma/schema.prisma)
- [OpenShift runtime template](../infrastructure-oc4/run-time/openshift-template.yml)
- [Production parameters](../infrastructure-oc4/prod.params)
- [Container build](../Dockerfile)
- [Health endpoint](../src/app/api/health/route.ts)
- [Prometheus endpoint](../src/app/api/prometheus/metrics/route.ts)

## 10. Architecture Status

The repository has the foundations of a modular monolith: a shared domain model, a common authorization layer, durable PostgreSQL metadata, S3 integration, and separable worker logic. The current implementation still needs explicit worker startup, durable initial ingestion, consistent authorization enforcement, deterministic database migrations, and production-grade shared rate limiting before the topology can be treated as a reliable production architecture.
