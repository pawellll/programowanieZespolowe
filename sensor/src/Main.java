import java.util.Random;

public class Main {
    public static void main(String[] args)
    {
        SensorConfiguration configuration = new SensorConfiguration("config.xml");
        MeasureManager manager = new MeasureManager(configuration);

        String resourceId = generateResourceId();

        manager.scheduleMeasurements(configuration.getMetricToMeasure(),resourceId,configuration.getMetricToMeasure().getResourceName());
    }

    private static String generateResourceId()
    {
        String id = "Resource_";
        Random rand = new Random();
        return id + rand.nextInt(1000);
    }
}
