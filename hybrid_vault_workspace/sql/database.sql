BEGIN;

CREATE TABLE IF NOT EXISTS "Right_hand" (
    id VARCHAR(255) PRIMARY KEY,
    full_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Left_hand" (
    id VARCHAR(255) PRIMARY KEY,
    full_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Briefcase" (
    token_alnum VARCHAR(6) PRIMARY KEY,
    fee_amount DECIMAL(10,2) CHECK (fee_amount > 0),
    total_amount DECIMAL(10,2) CHECK (total_amount > 0),
    asset_description TEXT NOT NULL,
    activation_state TEXT CHECK (activation_state IN ('active', 'expired', 'completed')),
    begin_time TIMESTAMPTZ NOT NULL,
    End_Time TIMESTAMPTZ NOT NULL,
    payment_state TEXT CHECK (payment_state IN ('pending', 'payment_in_progress', 'completed'))
);

CREATE UNIQUE INDEX "token_alnum_index" ON "Briefcase" ("token_alnum");

CREATE POLICY "User_Access_Owner" ON "Briefcase"
FOR ALL TO "Right_hand"
USING ("Right_hand".id = "Briefcase".creator_id AND "Briefcase".activation_state = 'active');

CREATE POLICY "User_Access_Owner2" ON "Briefcase"
FOR ALL TO "Left_hand"
USING ("Left_hand".id = "Briefcase".validator_id AND "Briefcase".activation_state = 'active');

COMMIT;