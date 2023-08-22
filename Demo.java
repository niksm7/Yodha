import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class Main {

	public static void main(String[] args) throws IOException {
		URL url = new URL("enter_url");
		HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
		httpConn.setRequestMethod("POST");

		httpConn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

		httpConn.setDoOutput(true);
		OutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());
		writer.write("username=&password=");
		writer.flush();
		writer.close();
		httpConn.getOutputStream().close();

		InputStream responseStream = httpConn.getResponseCode() / 100 == 2
				? httpConn.getInputStream()
				: httpConn.getErrorStream();
		Scanner s = new Scanner(responseStream).useDelimiter("\\A");
		String response = s.hasNext() ? s.next() : "";
		System.out.println(response);

		Pattern pattern = Pattern.compile("<SUCCESS>(.*?)</SUCCESS>");
	        Matcher matcher = pattern.matcher(response);
	
	        if (matcher.find()) {
	            String successValue = matcher.group(1);
	            System.out.println("session id: " + successValue);
	        } else {
	            System.out.println("session id not found");
	        }
		
	}
}
