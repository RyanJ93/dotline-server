CREATE KEYSPACE IF NOT EXISTS dotline WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

CREATE TYPE IF NOT EXISTS aes_encryption_parameters (iv ASCII, mode ASCII, key_length SMALLINT);
CREATE TYPE IF NOT EXISTS password_cocktail (hash ASCII, salt ASCII, pepper ASCII, loop INT);
CREATE TYPE IF NOT EXISTS geo_location (latitude FLOAT, longitude FLOAT, text VARCHAR);

CREATE TABLE IF NOT EXISTS users (id TIMEUUID, username VARCHAR, password FROZEN<password_cocktail>, rsa_public_key ASCII, rsa_private_key ASCII, rsa_private_key_encryption_parameters FROZEN<aes_encryption_parameters>, last_access TIMESTAMP, created_at TIMESTAMP, updated_at TIMESTAMP, PRIMARY KEY (id));
-- CREATE CUSTOM INDEX IF NOT EXISTS users_by_username ON users (username) USING 'StorageAttachedIndex';
CREATE CUSTOM INDEX IF NOT EXISTS users_by_username ON users (username) USING 'org.apache.cassandra.index.sasi.SASIIndex';
CREATE TABLE IF NOT EXISTS conversations (owner_user_id TIMEUUID, id TIMEUUID, name VARCHAR, is_group BOOLEAN, PRIMARY KEY ((owner_user_id), id)) WITH CLUSTERING ORDER BY (id DESC);
CREATE TABLE IF NOT EXISTS conversation_counters (conversation_id TIMEUUID, user_id TIMEUUID, sent_messages COUNTER, received_messages COUNTER, unread_messages COUNTER, PRIMARY KEY(conversation_id, user_id));
CREATE TABLE IF NOT EXISTS conversation_users (conversation_id TIMEUUID, user_id TIMEUUID, encryption_key ASCII, encryption_params FROZEN<aes_encryption_parameters>, PRIMARY KEY (conversation_id, user_id));
CREATE TABLE IF NOT EXISTS messages (conversation_id TIMEUUID, id TIMEUUID, user_id TIMEUUID, signature ASCII, content ASCII, type ASCII, created_at TIMESTAMP, updated_at TIMESTAMP, is_edited BOOLEAN, PRIMARY KEY ((conversation_id), id)) WITH CLUSTERING ORDER BY (id DESC);
CREATE TABLE IF NOT EXISTS access_tokens (access_token ASCII, user_id TIMEUUID, first_access TIMESTAMP, last_access TIMESTAMP, location FROZEN<geo_location>, ip INET, browser_name VARCHAR, os_name VARCHAR, PRIMARY KEY(access_token));
-- CREATE CUSTOM INDEX IF NOT EXISTS access_tokens_by_user_id ON access_tokens (user_id) USING 'StorageAttachedIndex';
CREATE CUSTOM INDEX IF NOT EXISTS access_tokens_by_user_id ON access_tokens (user_id) USING 'org.apache.cassandra.index.sasi.SASIIndex';
CREATE TABLE IF NOT EXISTS message_attachments (conversation_id TIMEUUID, message_id TIMEUUID, id TIMEUUID, path ASCII, type ASCII, mime_type ASCII, signature ASCII, encryption_key ASCII, encryption_encryption_parameters FROZEN<aes_encryption_parameters>, PRIMARY KEY ((conversation_id, message_id), id)) WITH CLUSTERING ORDER BY (id DESC);


-- /api/conversation/0009a765-bdf2-4c05-ac50-1a7069a0f0eb/message/0009a765-bdf2-4c05-ac50-1a7069a0f0eb/attachment/0009a765-bdf2-4c05-ac50-1a7069a0f0eb/delete

TRUNCATE TABLE conversations;
TRUNCATE TABLE conversation_counters;
TRUNCATE TABLE messages;
TRUNCATE TABLE access_tokens;
TRUNCATE TABLE message_attachments;
TRUNCATE TABLE users;