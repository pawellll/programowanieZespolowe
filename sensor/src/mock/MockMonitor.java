package mock;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;

public class MockMonitor {
    public static void main(String[] args) throws IOException {
        ServerSocket listener = new ServerSocket(9090);
        try {
            while (true) {
                Socket socket = listener.accept();
                try {
                    BufferedReader reader =
                            new BufferedReader(new InputStreamReader(socket.getInputStream()));
                    String line = reader.readLine();
                    System.out.println(line);
                } finally {
                    socket.close();
                }
            }
        }
        finally {
            listener.close();
        }
    }
}
