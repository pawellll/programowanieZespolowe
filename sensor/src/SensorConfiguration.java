import metrics.CpuMetric;
import metrics.MemoryMetric;
import metrics.Metric;

import java.io.*;
import java.util.Properties;
import java.util.UUID;

class SensorConfiguration {
    private int interval; // in seconds
    private int metaDataInterval; // in seconds
    private String address;
    private String hostName;
    private int port;
    private Metric mMetric;
    private String resourceId;
    private static String propertiesComment = "interval in seconds. Available Metrics: CPU, MEMORY";

    SensorConfiguration(String fileName) {
        Properties properties = new Properties();
        InputStream in;
        OutputStream out;
        try {
            /*System.out.println("Working Directory = " +
                    System.getProperty("user.dir"));*/
            in = new FileInputStream(new File(fileName));
            properties.loadFromXML(in);
            address = properties.getProperty("address");
            hostName = properties.getProperty("hostName");
            interval = Integer.valueOf(properties.getProperty("interval_values")) * 1000;
            metaDataInterval = Integer.valueOf(properties.getProperty("interval_metadata")) * 1000;
            port = Integer.valueOf(properties.getProperty("port"));
            resourceId = obtainResourceId(properties,"resource_id");
            storePropertiesToXML(properties,fileName);

            defineMetricToMeasure(properties);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String obtainResourceId(Properties properties, String resourceProperty) {
        String resourceId = properties.getProperty(resourceProperty);
        if (resourceId == null) {
            resourceId = UUID.randomUUID().toString();
            properties.setProperty(resourceProperty, resourceId);
        }
        return resourceId;
    }

    private void storePropertiesToXML(Properties properties, String filename)
    {
        File file = new File(filename);
        FileOutputStream fileOut;
        try {
            fileOut = new FileOutputStream(file);
            properties.storeToXML(fileOut, propertiesComment);
            fileOut.close();
        } catch (IOException e) {
            System.out.println("Wystąpił błąd podczas zapisu do pliku konfiguracyjnego");
        }
    }

    private void defineMetricToMeasure(Properties properties) {
        String metric = properties.getProperty("metric");
        if (metric.equalsIgnoreCase("CPU")) {
            mMetric = new CpuMetric();
        } else if (metric.equalsIgnoreCase("MEMORY")) {
            mMetric = new MemoryMetric();
        } else {
            throw new RuntimeException("Set correct metric ('CPU','MEMORY') in 'config.xml'");
        }
    }

    int getInterval() {
        return interval;
    }

    String getAddress() {
        return address;
    }

    String getHostName() {
        return hostName;
    }

    int getPort() {
        return port;
    }

    Metric getMetricToMeasure() {
        return mMetric;
    }

    int getMetadataInterval() {
        return metaDataInterval;
    }

    String getResourceId()
    {
        return resourceId;
    }
}
