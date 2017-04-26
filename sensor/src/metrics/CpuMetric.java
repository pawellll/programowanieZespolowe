package metrics;

import oshi.SystemInfo;

import javax.management.*;
import java.lang.management.ManagementFactory;
import java.util.Random;

public class CpuMetric implements Metric {
    @Override
    public int measure() {
        SystemInfo systemInfo = new SystemInfo();
        double cpuUsage = systemInfo.getHardware().getProcessor().getSystemCpuLoad() * 100;
        return (int) cpuUsage;
    }

    @Override
    public String getMetricsName() {
        return "CpuUtilization";
    }

    @Override
    public String getMetricUnitName() {
        return "percent";
    }

    @Override
    public String getDescription() {
        return "measure CPU Utilization in percents";
    }

    @Override
    public String getResourceName() {
        return "CPU";
    }
}
