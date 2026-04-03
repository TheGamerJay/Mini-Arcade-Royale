"""Monitoring and metrics collection for Mini Arcade Royale"""
from datetime import datetime
from typing import Dict, List
import time


class MetricsCollector:
    """Collect application metrics for monitoring"""
    
    def __init__(self):
        self.startup_time = datetime.now()
        self.total_requests = 0
        self.request_times = []
        self.errors = 0
        self.endpoint_stats: Dict[str, Dict] = {}
    
    def record_request(self, endpoint: str, method: str, status_code: int, duration_ms: float):
        """Record metrics for an API request"""
        self.total_requests += 1
        self.request_times.append(duration_ms)
        
        # Keep only last 1000 requests for memory efficiency
        if len(self.request_times) > 1000:
            self.request_times.pop(0)
        
        if status_code >= 400:
            self.errors += 1
        
        # Track per-endpoint stats
        key = f"{method} {endpoint}"
        if key not in self.endpoint_stats:
            self.endpoint_stats[key] = {
                "count": 0,
                "total_time": 0,
                "errors": 0,
                "min_time": float('inf'),
                "max_time": 0,
            }
        
        stats = self.endpoint_stats[key]
        stats["count"] += 1
        stats["total_time"] += duration_ms
        stats["min_time"] = min(stats["min_time"], duration_ms)
        stats["max_time"] = max(stats["max_time"], duration_ms)
        
        if status_code >= 400:
            stats["errors"] += 1
    
    def get_metrics(self) -> Dict:
        """Get current metrics summary"""
        uptime_seconds = (datetime.now() - self.startup_time).total_seconds()
        avg_time = sum(self.request_times) / len(self.request_times) if self.request_times else 0
        
        return {
            "timestamp": datetime.now().isoformat(),
            "uptime_seconds": uptime_seconds,
            "total_requests": self.total_requests,
            "error_count": self.errors,
            "error_rate": self.errors / self.total_requests if self.total_requests > 0 else 0,
            "avg_response_time_ms": avg_time,
            "min_response_time_ms": min(self.request_times) if self.request_times else 0,
            "max_response_time_ms": max(self.request_times) if self.request_times else 0,
            "endpoints": {
                endpoint: {
                    "count": stats["count"],
                    "avg_time_ms": stats["total_time"] / stats["count"],
                    "min_time_ms": stats["min_time"],
                    "max_time_ms": stats["max_time"],
                    "error_count": stats["errors"],
                }
                for endpoint, stats in self.endpoint_stats.items()
            }
        }


# Global metrics instance
metrics = MetricsCollector()


def get_health_status() -> Dict:
    """Get detailed health status"""
    metrics_data = metrics.get_metrics()
    
    # Determine overall health
    error_rate = metrics_data["error_rate"]
    if error_rate < 0.01:  # Less than 1% errors
        health_status = "healthy"
    elif error_rate < 0.05:  # Less than 5% errors
        health_status = "degraded"
    else:
        health_status = "unhealthy"
    
    return {
        "status": health_status,
        "timestamp": datetime.now().isoformat(),
        "uptime_hours": metrics_data["uptime_seconds"] / 3600,
        "requests": metrics_data["total_requests"],
        "errors": metrics_data["error_count"],
        "error_rate_percent": round(metrics_data["error_rate"] * 100, 2),
        "avg_response_time_ms": round(metrics_data["avg_response_time_ms"], 2),
        "top_endpoints": sorted(
            metrics_data["endpoints"].items(),
            key=lambda x: x[1]["count"],
            reverse=True
        )[:5]
    }


class AlertingManager:
    """Manage alert thresholds and triggers"""
    
    def __init__(self):
        self.thresholds = {
            "error_rate": 0.05,  # 5%
            "response_time_ms": 1000,  # 1 second
            "uptime_required_hours": 23.5,  # 99% uptime
        }
        self.active_alerts: List[Dict] = []
    
    def check_alerts(self) -> List[Dict]:
        """Check current metrics against thresholds"""
        self.active_alerts = []
        metrics_data = metrics.get_metrics()
        health = get_health_status()
        
        # Check error rate
        if metrics_data["error_rate"] > self.thresholds["error_rate"]:
            self.active_alerts.append({
                "type": "HIGH_ERROR_RATE",
                "severity": "CRITICAL",
                "current": round(metrics_data["error_rate"] * 100, 2),
                "threshold": round(self.thresholds["error_rate"] * 100, 2),
                "timestamp": datetime.now().isoformat(),
            })
        
        # Check response time
        if metrics_data["avg_response_time_ms"] > self.thresholds["response_time_ms"]:
            self.active_alerts.append({
                "type": "SLOW_RESPONSE",
                "severity": "WARNING",
                "current": round(metrics_data["avg_response_time_ms"], 2),
                "threshold": self.thresholds["response_time_ms"],
                "timestamp": datetime.now().isoformat(),
            })
        
        return self.active_alerts


# Global alerting instance
alerting = AlertingManager()
