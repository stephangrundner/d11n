-- Auditing: who (e-mail) created / last modified each entity (created_at/updated_at already exist).
ALTER TABLE users ADD COLUMN created_by VARCHAR(255);
ALTER TABLE users ADD COLUMN updated_by VARCHAR(255);

ALTER TABLE spaces ADD COLUMN created_by VARCHAR(255);
ALTER TABLE spaces ADD COLUMN updated_by VARCHAR(255);

ALTER TABLE directories ADD COLUMN created_by VARCHAR(255);
ALTER TABLE directories ADD COLUMN updated_by VARCHAR(255);

ALTER TABLE documents ADD COLUMN created_by VARCHAR(255);
ALTER TABLE documents ADD COLUMN updated_by VARCHAR(255);

ALTER TABLE blocks ADD COLUMN created_by VARCHAR(255);
ALTER TABLE blocks ADD COLUMN updated_by VARCHAR(255);

-- Diagram blocks (BlockType.DIAGRAM): rendered SVG + editable mxfile XML, stored inline.
ALTER TABLE blocks ADD COLUMN svg TEXT;
ALTER TABLE blocks ADD COLUMN diagram_xml TEXT;
