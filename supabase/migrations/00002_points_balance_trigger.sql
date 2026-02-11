-- Automatically update customers.points_balance when points_transactions change
CREATE OR REPLACE FUNCTION update_customer_points_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE customers
    SET points_balance = points_balance + NEW.amount
    WHERE id = NEW.customer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE customers
    SET points_balance = points_balance - OLD.amount
    WHERE id = OLD.customer_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_points_balance
  AFTER INSERT OR DELETE ON points_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_points_balance();
