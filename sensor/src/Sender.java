import metrics.Metric;
import org.json.JSONObject;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.Socket;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

class Sender {

    private String address;
    private int port;
    private String resourceId;
    private String resourceName;
    private String hostName;
    private Metric metric;

    Sender(String address, String hostName, int port, String resId,String resName, Metric metric) {
        this.address = address;
        this.port = port;
        this.resourceId = resId;
        this.hostName = hostName;
        this.resourceName = resName;
        this.metric = metric;
    }

    void sendValues() {
        try {
            Socket socket = new Socket(address, port);
            PrintWriter writer = new PrintWriter(socket.getOutputStream(), true);

            Date currentDate = Calendar.getInstance().getTime();
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd  HH:mm:ss");
            String formattedDate = formatter.format(currentDate);

            String message = generateValueMessage(metric.measure(), resourceId, formattedDate);

            writer.println(message);
            System.out.println("sendValues");

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    void sendMetadata() {
        try {
            Socket socket = new Socket(address, port);
            PrintWriter writer = new PrintWriter(socket.getOutputStream(), true);

            Date currentDate = Calendar.getInstance().getTime();
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd  HH:mm:ss");
            String formattedDate = formatter.format(currentDate);

            String message = generateMetadataMessage(resourceId, hostName, formattedDate, resourceName, metric.getMetricsName(), metric.getMetricUnitName(), metric.getDescription());

            writer.println(message);
            System.out.println("sendValues");

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String generateValueMessage(int value, String resourceId, String time) {
        JSONObject message = new JSONObject();
        message.put("time", time);
        message.put("resourceId", resourceId);
        message.put("value", value);
        return message.toString(0);
    }

    private String generateMetadataMessage(String resourceId, String hostName, String time, String resourceName, String metricName, String unit, String description) {
        JSONObject message = new JSONObject();
        message.put("time", time);
        message.put("resourceId", resourceId);
        message.put("resourceName", resourceName);
        message.put("metricName", metricName);
        message.put("unit", unit);
        message.put("description", description);
        message.put("hostName", hostName);

        return message.toString(0);
    }

}
