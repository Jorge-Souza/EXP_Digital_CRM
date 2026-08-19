-- Log bruto de chamadas de webhook (Kiwify, etc) para diagnosticar payloads reais
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  payload jsonb NOT NULL,
  detected jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only" ON webhook_logs USING (current_user_is_admin());
CREATE POLICY "admin_only_insert" ON webhook_logs FOR INSERT WITH CHECK (true); -- webhook usa service role
