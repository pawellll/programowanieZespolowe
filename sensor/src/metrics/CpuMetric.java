package metrics;


import com.sun.management.OperatingSystemMXBean;

import java.lang.management.ManagementFactory;

public class CpuMetric implements Metric {
    @Override
    public int measure() {
        OperatingSystemMXBean osBean = ManagementFactory.getPlatformMXBean(
                OperatingSystemMXBean.class);
        return (int)(osBean.getSystemCpuLoad() * 100);
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
