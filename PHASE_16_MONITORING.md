# Phase 16: Production Monitoring & Scaling

## Objective
Implement comprehensive monitoring, alerting, auto-scaling, and disaster recovery for production.

## Implementation

### 1. Metrics & Monitoring Dashboard

**Metrics Collected:**
- Request count (total, by endpoint, by status code)
- Response times (avg, p50, p95, p99)
- Error rates (5xx, 4xx, rate-limited)
- Database connection pool usage
- Cache hit rate
- User signups (daily, weekly)
- Revenue metrics (GMV, ARPU)
- Active players (concurrent, daily)
- Payment success rate
- Email delivery rate

**Monitoring Stacks (Choose 1-2):**

#### Option A: Prometheus + Grafana (Open-source)
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mini-arcade-royale'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
```

#### Option B: Datadog (SaaS)
- APM tracing for FastAPI/PostgreSQL
- Log aggregation
- Real-time alerting
- Custom dashboards

#### Option C: New Relic
- Application Performance Monitoring
- Infrastructure monitoring
- Error tracking
- Real-time insights

### 2. Alerting Rules

**Critical Alerts (page immediately):**
```
- Error rate > 5% for 5 minutes
- API response time p95 > 2 seconds for 10 minutes
- Database connection pool exhausted
- Payment processing failures > 10% for 5 minutes
- Service down (healthcheck failing for 1 minute)
- Disk space < 10%
```

**Warning Alerts (create ticket):**
```
- Error rate > 1% for 10 minutes
- API response time p95 > 500ms for 20 minutes
- High memory usage > 80%
- Database slow queries detected
- Cache miss rate > 50%
- Unverified email signups > 100
```

### 3. Auto-Scaling

#### Horizontal Scaling (multiple instances)
```yaml
# railway.yml - add multiple replicas
services:
  backend:
    replicas:
      min: 2
      max: 10
    cpu:
      min: 256
      max: 2048
```

**Scaling Triggers:**
- CPU > 70% → add instance (max 10)
- CPU < 30% → remove instance (min 2)
- Memory > 75% → add instance
- Response time p95 > 1s → add instance

#### Vertical Scaling (bigger instances)
```
Current: 2 vCPU, 512MB RAM
Step 1: 2 vCPU, 1GB RAM
Step 2: 4 vCPU, 2GB RAM
Step 3: 4 vCPU, 4GB RAM
```

### 4. Load Balancing

**Railway** provides built-in load balancing:
- Distributes traffic across instances
- Health checks every 10 seconds
- Automatic failover to healthy instances

### 5. Database Optimization

**Connection Pooling:**
```python
# config.py improvements
DB_POOL_SIZE = 20  # Up from default
DB_MAX_OVERFLOW = 40
DB_POOL_TIMEOUT = 30
DB_POOL_RECYCLE = 3600
```

**Query Optimization:**
```python
# Add indexes to high-query tables
class User(Base):
    __table_args__ = (
        Index('idx_email', 'email'),
        Index('idx_username', 'username'),
        Index('idx_created_at', 'created_at'),
    )

class GamePlay(Base):
    __table_args__ = (
        Index('idx_user_created', 'user_id', 'created_at'),
        Index('idx_game_key', 'game_key'),
    )
```

**Read Replicas (for scaling reads):**
- Use PostgreSQL read replicas for analytics queries
- Route read-heavy queries to replica
- Keep writes on primary

### 6. Disaster Recovery

**Backup Strategy:**
```
- Automated daily backups (retention: 30 days)
- WAL archiving for point-in-time recovery
- Weekly full backup to separate region
- Test restore monthly
```

**RTO/RPO Targets:**
- RTO (Recovery Time Objective): < 1 hour
- RPO (Recovery Point Objective): < 15 minutes

**Failover Plan:**
1. Detect primary database failure
2. Promote read replica to primary
3. Update connection string in app
4. Restart app instances
5. Notify users of brief downtime

### 7. Logging & Debugging

**Centralized Logging:**
```python
# Use structured logging
import structlog

logger = structlog.get_logger()
logger.info("user_login", user_id=user.id, timestamp=datetime.now())
logger.error("payment_failed", error=str(e), user_id=user.id)
```

**Log Aggregation Stack:**
- Elasticsearch: Store logs
- Kibana: Search/analyze logs
- Filebeat: Forward logs from app

**Retention Policy:**
- Error logs: 90 days
- Info logs: 30 days
- Debug logs: 7 days

### 8. Security Monitoring

**Suspicious Activity Detection:**
```python
# Track and alert on:
- Multiple failed login attempts (>5 in 1 hour)
- Unusual geographic login patterns
- API requests from VPNs/proxies
- Rapid credit purchases (>$1000 in 1 hour)
- User account takeover indicators
```

### 9. Cost Optimization

**Monitor Spend:**
- Railway compute costs
- PostgreSQL database costs
- Stripe processing fees (2.2%)
- Resend email costs
- AWS/CDN costs (if using)

**Cost Reduction Levers:**
- Auto-scale down at off-peak hours
- Batch email processing
- Optimize database queries (reduce storage)
- Cache responses aggressively
- Compress API responses

### 10. SLA & Uptime

**Service Level Agreement:**
```
Uptime Target: 99.5% (43.8 minutes downtime per month)
Response Time: p95 < 500ms
Error Rate: < 1%
```

**Uptime Status Page:**
- Public status page (Status.io or custom)
- Real-time incident notifications
- Historical uptime display

---

## Metrics Dashboard Template

```
┌─────────────────────────────────────────────────────────┐
│ Mini Arcade Royale - Production Dashboard               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ Uptime: 99.97%   │   Active Users: 2,341   │   Revenue: $5,234  │
│                                                           │
│ ┌───────────────────┐  ┌────────────────────┐             │
│ │ Request Rate      │  │ P95 Response Time  │             │
│ │ ▁▂▃▄▅▆▇█ 524/s   │  │ ▁▂▃▂▁▂▃█▁▂ 234ms  │             │
│ └───────────────────┘  └────────────────────┘             │
│                                                           │
│ ┌───────────────────┐  ┌────────────────────┐             │
│ │ Error Rate        │  │ Instances Running  │             │
│ │ ▁▁▁▂▁▁▁▁▁█ 0.3%  │  │ ██████ 6 active   │             │
│ └───────────────────┘  └────────────────────┘             │
│                                                           │
│ Top Endpoints:                                            │
│   1. POST /api/v1/games/bet        (142/s, 45ms)         │
│   2. GET /api/v1/leaderboard/global (89/s, 234ms)        │
│   3. POST /api/v1/auth/login       (34/s, 89ms)          │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment

```bash
# Add monitoring configuration to Dockerfile
RUN pip install prometheus-client datadog

# Start monitoring agents
# Update main.py to expose /metrics endpoint
```

---

## Success Metrics

- ✓ 99.5%+ uptime
- ✓ < 5 minute MTTR (Mean Time To Recovery)
- ✓ All critical alerts page within 5 minutes
- ✓ Auto-scaling working (responds to load within 2 minutes)
- ✓ Database backups passing restore tests
- ✓ Cost per user < $0.05/month
