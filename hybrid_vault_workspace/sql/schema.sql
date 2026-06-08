CREATE TABLE "Right_hand" (
    id VARCHAR(255) UNIQUE,
    full_name TEXT
);

CREATE TABLE "Left_hand" (
    id VARCHAR(255) UNIQUE,
    full_name TEXT
);

CREATE TABLE "Briefcase" (
    token_alnum VARCHAR(6) PRIMARY KEY,
    fee_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    asset_description TEXT,
    activation_state TEXT,
    begin_time TIMESTAMPTZ,
    End_Time TIMESTAMPTZ,
    payment_state TEXT
);

CREATE POLICY "User_Access_Owner" ON "Briefcase"
FOR ALL TO "Right_hand"
USING ("Right_hand".id = EXISTS (
    SELECT 1 FROM briefcases WHERE "Briefcase".token_alnum = "Briefcase".token_alnum AND 
    "Briefcase".begin_time IS NOT NULL
));

CREATE POLICY "User_Access_Owner2" ON "Briefcase"
FOR ALL TO "Left_hand"
USING ("Left_hand".id = EXISTS (
    SELECT 1 FROM briefcases WHERE "Briefcase".token_alnum = "Briefcase".token_alnum AND 
    "Briefcase".begin_time IS NOT NULL
));