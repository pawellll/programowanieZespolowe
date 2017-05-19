import java.util.Random;

public class Main {
    public static void main(String[] args)
    {
        SensorConfiguration configuration = new SensorConfiguration("config.xml");
        MeasureManager manager = new MeasureManager(configuration);

        manager.scheduleMeasurements(configuration.getMetricToMeasure(),configuration.getMetricToMeasure().getResourceName());
    }
}
