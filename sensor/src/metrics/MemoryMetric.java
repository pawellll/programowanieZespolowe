package metrics;

import oshi.SystemInfo;

import java.util.Random;

public class MemoryMetric implements Metric {
    @Override
    public int measure() {
        SystemInfo systemInfo = new SystemInfo();
        long available = systemInfo.getHardware().getMemory().getAvailable();
        long total = systemInfo.getHardware().getMemory().getTotal();
        double memoryUsage = (double)(total - available) / total;
        memoryUsage = memoryUsage * 100;
        return (int) memoryUsage;
    }

    @Override
    public String getMetricsName() {
        return "MemoryUtilization";
    }

    @Override
    public String getMetricUnitName() {
        return "percent";
    }

    @Override
    public String getDescription() {
        return "measure Memory Utilization in percents";
    }

    @Override
    public String getResourceName() {
        return "Memory";
    }
}
