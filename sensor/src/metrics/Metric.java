package metrics;

public interface Metric {
    int measure();
    String getMetricsName();
    String getMetricUnitName();
    String getDescription();
    String getResourceName();
}
