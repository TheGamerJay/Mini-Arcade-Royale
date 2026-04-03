# Chunking Strategy for RAG

How to split context_docs into semantically meaningful chunks for AI retrieval.

---

## Chunking Philosophy

**Goal**: Create chunks that are:
1. **Self-contained** — Readable without external context
2. **Semantic units** — Centered on one concept or procedure
3. **AI-digestible** — 500–1500 tokens (can parse in one prompt)
4. **Identifiable** — Include heading, section number, document source
5. **Linkable** — Reference other chunks and documents

---

## Chunk Boundaries

### Source of Chunks
- **Primary**: Markdown heading levels (H2, H3)
- **Secondary**: Logical sections (tables, code blocks, workflows)
- **Tertiary**: Subsections within complex topics

### Chunk Sizing

| Type | Example | Target Tokens | Notes |
|------|---------|---|---|
| Overview | "PRODUCT_OVERVIEW.md" (full) | 800–1200 | Core context |
| Section | "Auth Flows" (H2) | 600–1000 | Procedure description |
| Subsection | "Signup Flow" (H3) | 400–800 | Single workflow |
| Decision | "Why Server-Authoritative" | 200–500 | Rationale snippet |

### When to Split

Split a section if:
- **Over 1500 tokens**: Break at logical subsection
- **Multiple workflows**: Each workflow is separate chunk
- **Mixed topics**: Group by concept, not document order
- **Code examples**: Live with explanatory text, not separate

### When to Merge

Merge sections if:
- **Under 300 tokens**: Combine with related section
- **Dependent concepts**: Related procedures bundled
- **Table + explanation**: Tables stay with surrounding prose

---

## Chunk Format

### Chunk Header (YAML Frontmatter)

```markdown
---
doc_id: "PRODUCT_OVERVIEW-chunk-1"
document: "context_docs/product/PRODUCT_OVERVIEW.md"
heading: "## What is Mini Arcade Royale?"
chunk_number: 1
total_chunks: 8
priority: 3  # 1=critical, 2=important, 3=reference
tokens: 1050
tags: ["product", "business-model", "overview"]
relatedChunks: 
  - "SYSTEM_ARCHITECTURE-chunk-1"
  - "BRAND_GUIDE-chunk-2"
---
```

### Chunk Content

```markdown
# What is Mini Arcade Royale?

Mini Arcade Royale is a **premium digital arcade entertainment platform**...

[Full chunk content]

---

**Previous:** [Link to previous chunk]  
**Next:** [Link to next chunk]  
**Document:** [Link to full document]
```

---

## Specific Chunking Rules

### API Contracts Document

```
CHUNK 1: Overview section + API versioning
CHUNK 2: Each endpoint group (Auth, User, Store, Games, etc.)
CHUNK 3: Per-endpoint detail (request/response/errors)
         (One endpoint per chunk only if > 800 tokens)
CHUNK 4: Error codes reference table
CHUNK 5: Rate limiting & quotas
```

### Architecture Document

```
CHUNK 1: Architecture overview + diagram
CHUNK 2: Authentication layer
CHUNK 3: Credit system layer
CHUNK 4: Game engine layer
CHUNK 5: Payment/Stripe layer
CHUNK 6: Database schema
CHUNK 7: Security layers
CHUNK 8: Scalability & performance
CHUNK 9: Deployment & environments
```

### Runbooks & SOPs

```
CHUNK 1: Purpose + prerequisites
CHUNK 2: Step-by-step procedure (logical groups, 1-3 steps per chunk if long)
CHUNK 3: Error handling / troubleshooting
CHUNK 4: Rollback / recovery
CHUNK 5: Notifications / post-action
```

### Legal Documents

```
CHUNK 1: Section title + key provisions (grouped by topic)
         Don't split mid-clause
CHUNK 2: Related section (linked conceptually)
CHUNK 3: Edge cases / special scenarios
CHUNK 4: Definitions / references to other policies
```

---

## Metadata for Each Chunk

### Required Fields

| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| `doc_id` | string | "API_CONTRACTS-chunk-5" | Unique identifier |
| `document` | string | "context_docs/backend/API_CONTRACTS.md" | Source document path |
| `heading` | string | "## POST /api/auth/login" | Actual markdown heading |
| `chunk_number` | int | 5 | Position in document |
| `total_chunks` | int | 12 | Total chunks in document |
| `priority` | int (1-5) | 1 | Importance: 1=critical, 5=nice-to-know |
| `tokens` | int | 850 | Approximate token count |
| `tags` | array | `["auth", "endpoint", "security"]` | Search keywords |
| `relatedChunks` | array | `["AUTH_RULES-chunk-2"]` | Cross-references |

### Optional Fields

| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| `keywords` | array | `["login", "session", "password"]` | Extra search terms |
| `category` | string | "backend" | High-level category |
| `domain` | string | "authentication" | Functional domain |
| `updatedAt` | ISO 8601 | "2026-04-03T15:30:00Z" | Last update |
| `author` | string | "DevTeam" | Responsibility |

---

## Example: Chunked "AUTH_RULES.md"

### Chunk 1
```yaml
---
doc_id: "AUTH_RULES-chunk-1"
document: "context_docs/auth/AUTH_RULES.md"
heading: "# Auth Rules"
chunk_number: 1
total_chunks: 5
priority: 1
tokens: 300
tags: ["auth", "overview", "rules"]
---

# Auth Rules

**Document Purpose**: Define authentication flows, security policies, and session management for Mini Arcade Royale.

## Authentication Flows

### Signup Flow (Server-Side Validation)

[Overview and definition]
```

### Chunk 2
```yaml
---
doc_id: "AUTH_RULES-chunk-2"
document: "context_docs/auth/AUTH_RULES.md"
heading: "### Signup Flow"
chunk_number: 2
total_chunks: 5
priority: 1
tokens: 950
tags: ["auth", "signup", "validation", "security"]
relatedChunks: ["AUTH_RULES-chunk-3", "SYSTEM_ARCHITECTURE-chunk-1"]
---

[Full signup flow with validation, actions, error handling]
```

### Chunk 3—5: Similar pattern for Login, Forgot Password, etc.

---

## Indexing Strategy

See **[indexing_strategy.md](indexing_strategy.md)** for:
- How to index chunks for semantic search
- Embedding models to use
- Search ranking methodology
- Deduplication & caching

---

## Tools & Implementation

### Python Implementation
```python
import json
from markdown import frontmatter

def chunk_markdown(file_path, target_tokens=1000, overlap=100):
    """
    Split markdown file into RAG-ready chunks.
    """
    with open(file_path) as f:
        post = frontmatter.load(f)
    
    text = post.content
    headings = extract_headings(text)  # level 2 or 3
    
    chunks = []
    for heading in headings:
        chunk_text = extract_section(text, heading)
        tokens = count_tokens(chunk_text)
        
        if tokens <= target_tokens:
            chunks.append({
                "heading": heading,
                "content": chunk_text,
                "tokens": tokens
            })
        else:
            # Split further by sub-headings
            sub_chunks = split_large_section(chunk_text, target_tokens)
            chunks.extend(sub_chunks)
    
    return chunks
```

---

## Validation

Before indexing, verify:
- [ ] All chunks have required metadata
- [ ] Token counts are accurate
- [ ] Related chunks actually exist
- [ ] No chunk exceeds 1500 tokens
- [ ] No chunk under 200 tokens (merge if so)
- [ ] Chunk IDs are unique globally
- [ ] All tags are from approved vocabulary

---

## Success Criteria

- [x] Chunking strategy defined
- [x] Format specified
- [x] Metadata schema documented
- [x] Example chunking provided
- [ ] Automated chunking implementation (Phase 2)
- [ ] Index built and tested (Phase 2)
