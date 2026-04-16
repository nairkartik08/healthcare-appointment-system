import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbDump {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://dpg-d7fif6lckfvc73fg4o0g-a.oregon-postgres.render.com:5432/healthcare_db_csjn";
        String user = "healthcare_db_csjn_user";
        String pass = "S6BdeBsPhnEm9bKtFaOTduRUnvWukSmV";

        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {

            System.out.println("--- CHECKING FOR DUPLICATE EMAILS ---");
            ResultSet rs = stmt.executeQuery("SELECT email, count(id) FROM users GROUP BY email HAVING count(id) > 1");
            while(rs.next()) {
                System.out.println("Duplicate email found in users: " + rs.getString("email"));
            }
            
            System.out.println("\n--- PATIENTS WITH NULL USER_ID ---");
            rs = stmt.executeQuery("SELECT id, email, user_id FROM patient WHERE user_id IS NULL");
            while(rs.next()) {
                System.out.println("Patient ID: " + rs.getLong("id") + ", Email: " + rs.getString("email") + ", User_ID: " + rs.getLong("user_id"));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
