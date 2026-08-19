-- Guarda o utm_campaign da venda Kiwify para cruzar com as campanhas do Meta Ads
ALTER TABLE compras_alunos ADD COLUMN IF NOT EXISTS utm_campaign text;
