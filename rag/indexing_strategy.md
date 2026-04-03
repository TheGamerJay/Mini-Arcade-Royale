# Indexing Strategy for RAG

How to index and search chunked context_docs for optimal AI retrieval.

---

## Indexing Approach

### Two-Tier System

**Tier 1: Semantic Search (Primary)**
- Use embedding model to create vector representations
- Find most semantically similar chunks to query
- Fast: ~10ms per search, all chunks indexed

**Tier 2: Keyword Search (Fallback)**
- Traditional full-text search
- Handles exact term matches
- Combines with semantic results for comprehensive coverage

### When to Use Each

| Query Type | Use | Example |
|---|---|---|
| "How do I structure API responses?" | Semantic | Find STRUCTURE-related chunks |
| "GraphQL vs REST advantages" | Semantic | Find ARCHITECTURE-related chunks |
| "error code 401" | Keyword + Semantic | Find ERROR_CODES, then rank by topic |
| "Stripe webhook retry logic" | Semantic + Keyword | Find WEBHOOK-related + STRIPE keyword matches |

---

## Embedding Model Selection

### Recommended Model

**OpenAI text-embedding-3-small**
- Dimension: 1536
- Cost: $0.02 per 1M tokens
- Quality: Industry standard
- Speed: ~1ms per 100 tokens

**Alternative: Open-Source**
- **sentence-transformers/all-MiniLM-L6-v2** (384-dim, free)
- **intfloat/multilingual-e5-large** (1024-dim, free)
- Slower but no API costs

---

## Vector Database

### Schema

```python
class DocumentChunk:
    chunk_id: str                    # "API_CONTRACTS-chunk-5"
    embedding: list[float]           # 1536 floats
    content: str                     # Full text
    doc_id: str                      # Source document
    heading: str                     # Markdown heading
    priority: int                    # 1=critical, 5=nice-to-know
    tags: list[str]                 # ["auth", "endpoint", "security"]
    tokens: int                      # Token count
    related_chunks: list[str]        # Cross-references
    updated_at: datetime
```

### Storage Options

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **Pinecone** | Managed, serverless, fast | Proprietary | $0.10/month base + usage |
| **Weaviate** | Open-source, flexible | Requires hosting | Free (self-hosted) |
| **Milvus** | Open-source, high-perf | Steep learning curve | Free (self-hosted) |
| **PgVector** (PostgreSQL) | Already using PG, integrated | Limited scale | Part of DB cost |
| **LanceDB** | Embedded, no server | Early stage | Free |

**Recommendation**: Use PostgreSQL + `pgvector` extension for Phase 1 (simple, integrated); scale to Pinecone in Phase 2 if needed.

---

## Indexing Pipeline

### Build Index (One-Time Setup)

```python
def build_index():
    """Index all chunks from context_docs."""
    chunks = read_all_chunks()  # From markdown files
    
    for chunk in chunks:
        # 1. Generate embedding
        embedding = openai.Embedding.create(
            model="text-embedding-3-small",
            input=chunk.content
        )
        
        # 2. Store in vector DB
        db.insert_chunk({
            "chunk_id": chunk.doc_id,
            "embedding": embedding.vector,
            "content": chunk.content,
            "priority": chunk.priority,
            "tags": chunk.tags,
            # ... other fields
        })
        
        # 3. Index keywords (full-text search)
        full_text_index.add(chunk.doc_id, chunk.content)
    
    print(f"Indexed {len(chunks)} chunks")
```

### Incremental Update (Add/Modify Chunks)

When document changes:

```python
def update_chunk(chunk_id: str, content: str):
    """Update single chunk and re-index."""
    # 1. Delete old chunk
    db.delete(chunk_id)
    
    # 2. Re-embed
    embedding = openai.Embedding.create(
        model="text-embedding-3-small",
        input=content
    )
    
    # 3. Re-insert
    db.insert_chunk({
        "chunk_id": chunk_id,
        "embedding": embedding.vector,
        "content": content,
        # ... other fields
    })
```

---

## Search Implementation

### Semantic Search Query

```python
def semantic_search(query: str, top_k=5, min_priority=2):
    """
    Find most similar chunks to query.
    
    Args:
        query: User question (e.g., "How does Stripe webhook work?")
        top_k: Return top 5 most relevant
        min_priority: Filter out low-priority chunks (nice-to-know)
    
    Returns:
        list[ChunkResult] ordered by relevance
    """
    # 1. Embed user query
    query_embedding = openai.Embedding.create(
        model="text-embedding-3-small",
        input=query
    ).embedding
    
    # 2. Search vector DB (cosine similarity)
    results = db.search(
        vector=query_embedding,
        top_k=top_k * 2,  # Over-fetch, then filter
        filters={"priority": {"$gte": min_priority}}
    )
    
    # 3. Rank by relevance + priority boost
    ranked = [
        {
            "chunk_id": r.chunk_id,
            "similarity": r.similarity * (6 - r.priority),  # Boost critical
            "content": r.content,
            "heading": r.heading,
            "tags": r.tags
        }
        for r in results
    ]
    
    return sorted(ranked, key=lambda x: x["similarity"], reverse=True)[:top_k]
```

### Hybrid Search (Semantic + Keyword)

```python
def hybrid_search(query: str, top_k=5):
    """
    Combine semantic and keyword results.
    """
    # 1. Semantic search
    semantic_results = semantic_search(query, top_k=top_k)
    semantic_ids = {r["chunk_id"] for r in semantic_results}
    
    # 2. Keyword search
    keyword_results = keyword_search(query, top_k=top_k)
    keyword_ids = {r["chunk_id"] for r in keyword_results}
    
    # 3. Combine and deduplicate
    all_results = semantic_results + [
        r for r in keyword_results 
        if r["chunk_id"] not in semantic_ids
    ]
    
    return all_results[:top_k]
```

### Keyword Full-Text Search

```python
def keyword_search(query: str, top_k=5):
    """
    Find chunks with exact keyword matches.
    """
    # Use PostgreSQL ILIKE or Elasticsearch
    results = db.search_keywords(
        query=query,
        limit=top_k,
        fields=["heading", "tags", "content"]
    )
    
    return results
```

---

## Ranking & Relevance

### Relevance Score Components

```
score = (semantic_similarity * 0.6) + 
        (keyword_match_score * 0.2) + 
        (priority_boost * 0.1) +
        (recency_boost * 0.1)
```

| Component | Weight | Formula | Example |
|-----------|--------|---------|---------|
| Semantic | 60% | Cosine similarity 0–1 | 0.87 |
| Keyword | 20% | BM25 score | 2.5 / max_possible |
| Priority | 10% | (6 - priority) / 5 | Critical (1) → 1.0 boost |
| Recency | 10% | Days since update / 365 | Recent → 1.0 boost |

---

## Caching & Performance

### Query Cache

```python
@cache.memoize(timeout=3600)  # 1 hour
def semantic_search_cached(query: str, top_k=5):
    """Cache frequent queries."""
    return semantic_search(query, top_k)
```

### Common Query Patterns

Pre-compute indexes for frequent topics:

```python
FREQUENT_TOPICS = [
    "authentication flow",
    "credit economy",
    "game logic",
    "stripe payment",
    "error codes",
    "rate limiting",
    "database schema"
]

for topic in FREQUENT_TOPICS:
    precompute_index(topic)
```

---

## Monitoring

### Metrics to Track

```
Retrieval Quality:
├─ Average semantic similarity score
├─ % of queries returning relevant results
├─ User satisfaction (thumbs up/down on results)
└─ Click-through rate on returned chunks

Performance:
├─ Query latency (target: <100ms)
├─ Embedding generation time
├─ Ranking time
└─ Cache hit rate
```

### Alerts

- If retrieval quality drops below 60% → review index
- If query latency > 500ms → optimize or add caching
- If cache hit rate < 30% → consider larger cache

---

## Query Examples

### Example 1: Developer Asks

**Query**: "How do I handle Stripe webhook retries?"

**Search Process**:
1. Embed query
2. Find top 5 chunks by semantic similarity
   - WEBHOOK_RULES.md (chunk 3) — 0.92 similarity
   - STRIPE_FLOW.md (chunk 2) — 0.88
   - PAYMENT_RECONCILIATION.md (chunk 1) — 0.85
   - ERROR_HANDLING.md (chunk 4) — 0.79
   - SECURITY_INCIDENT_RESPONSE.md (chunk 2) — 0.71

**Ranking**:
- WEBHOOK_RULES (priority:1, boost 1.0x) → 0.92 * 1.0 = 0.92
- STRIPE_FLOW (priority:2, boost 0.8x) → 0.88 * 0.8 = 0.70
- (others follow)

**Result**: Return WEBHOOK_RULES chunk 3 first (highest ranked)

---

### Example 2: Support Agent Asks

**Query**: "What is the refund policy for credit purchases?"

**Search Process**:
1. Semantic search finds: REFUND_POLICY_SOURCE, PURCHASE_RECONCILIATION
2. Keyword search finds: "refund", "purchase", "policy"
3. Combine results, REFUND_POLICY has exact "refund" mention → boost
4. Return REFUND_POLICY_SOURCE (priority:3) as primary result

---

## Success Criteria

- [x] Indexing strategy defined
- [x] Embedding model selected
- [x] Vector DB approach documented
- [x] Search algorithms specified
- [x] Ranking methodology detailed
- [x] Performance targets set
- [ ] Implementation in Phase 2
