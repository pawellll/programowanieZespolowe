import metrics.Metric;

import java.util.Timer;
import java.util.TimerTask;

class MeasureManager {
    private SensorConfiguration configuration;
    private Sender mSender;

    MeasureManager(SensorConfiguration configuration) {
        this.configuration = configuration;
    }

    void scheduleMeasurements(Metric metric, String resourceId, String resName) {
        mSender = new Sender(configuration.getAddress(), configuration.getPort(), resourceId,resName, metric);

        Timer timer = new Timer();

        timer.scheduleAtFixedRate(new TimerTask() {

            @Override
            public void run() {
                mSender.sendMetadata();
            }
        }, 0, configuration.getMetadataInterval());

        timer.scheduleAtFixedRate(new TimerTask() {

            @Override
            public void run() {
                mSender.sendValues();
            }
        }, 1, configuration.getInterval());
    }
}
