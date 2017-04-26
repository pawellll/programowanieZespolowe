package metrics;

import java.util.Random;

public class CpuMetric implements Metric {
    @Override
    public int measure() {
        Random rand = new Random();
        return rand.nextInt(99) + 1;
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
