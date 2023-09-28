CREATE KEYSPACE IF NOT EXISTS dotline WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

CREATE TYPE IF NOT EXISTS attachment (id UUID, filename VARCHAR, size INT, mimetype ASCII, signature ASCII, encryption_iv ASCII);
CREATE TYPE IF NOT EXISTS conversation_member (encryption_key ASCII, signing_key ASCII, deleted_at TIMESTAMP);
CREATE TYPE IF NOT EXISTS aes_encryption_parameters (iv ASCII, mode ASCII, key_length SMALLINT);
CREATE TYPE IF NOT EXISTS password_cocktail (hash ASCII, salt ASCII, pepper ASCII, loop INT);
CREATE TYPE IF NOT EXISTS geo_location (latitude FLOAT, longitude FLOAT, text VARCHAR);
CREATE TYPE IF NOT EXISTS aes_static_parameters (mode ASCII, key_length SMALLINT);
CREATE TYPE IF NOT EXISTS hmac_signing_parameters (hash_name ASCII);

CREATE TABLE IF NOT EXISTS users (id TIMEUUID, username VARCHAR, surname VARCHAR, name VARCHAR, password FROZEN<password_cocktail>, rsa_public_key ASCII, rsa_private_key ASCII, rsa_private_key_encryption_parameters FROZEN<aes_encryption_parameters>, recovery_rsa_private_key ASCII, recovery_rsa_private_key_encryption_parameters FROZEN<aes_encryption_parameters>, recovery_key FROZEN<password_cocktail>, last_access TIMESTAMP, created_at TIMESTAMP, updated_at TIMESTAMP, PRIMARY KEY (id));
-- CREATE CUSTOM INDEX IF NOT EXISTS users_by_username ON users (username) USING 'StorageAttachedIndex';
CREATE CUSTOM INDEX IF NOT EXISTS users_by_username ON users (username) USING 'org.apache.cassandra.index.sasi.SASIIndex';

CREATE TABLE IF NOT EXISTS user_search_index (user_id TIMEUUID, fragment VARCHAR, PRIMARY KEY((user_id), fragment)) WITH CLUSTERING ORDER BY (fragment ASC);
-- CREATE CUSTOM INDEX IF NOT EXISTS user_search_index_by_fragment ON user_search_index (fragment) USING 'StorageAttachedIndex';
CREATE CUSTOM INDEX IF NOT EXISTS user_search_index_by_fragment ON user_search_index (fragment) USING 'org.apache.cassandra.index.sasi.SASIIndex';

CREATE TABLE IF NOT EXISTS user_recovery_sessions (session_token ASCII, user_id TIMEUUID, created_at TIMESTAMP, expires_at TIMESTAMP, location FROZEN<geo_location>, ip INET, browser_name VARCHAR, os_name VARCHAR, user_agent VARCHAR, fulfilled BOOLEAN, PRIMARY KEY(session_token));
-- CREATE CUSTOM INDEX IF NOT EXISTS user_recovery_session_by_user_id ON user_recovery_sessions (user_id) USING 'StorageAttachedIndex';
CREATE CUSTOM INDEX IF NOT EXISTS user_recovery_session_by_user_id ON user_recovery_sessions (user_id) USING 'org.apache.cassandra.index.sasi.SASIIndex';

CREATE TABLE IF NOT EXISTS conversations (id TIMEUUID, name VARCHAR, encryption_parameters FROZEN<aes_static_parameters>, signing_parameters FROZEN<hmac_signing_parameters>, members MAP<VARCHAR, FROZEN<conversation_member>>, PRIMARY KEY (id));
-- CREATE CUSTOM INDEX IF NOT EXISTS conversations_by_member ON conversations (members) USING 'StorageAttachedIndex';
CREATE CUSTOM INDEX IF NOT EXISTS conversations_by_member ON conversations (members) USING 'org.apache.cassandra.index.sasi.SASIIndex';

CREATE TABLE IF NOT EXISTS messages (conversation_id TIMEUUID, id TIMEUUID, user_id TIMEUUID, signature ASCII, content ASCII, type ASCII, created_at TIMESTAMP, updated_at TIMESTAMP, is_edited BOOLEAN, encryption_iv ASCII, attachments LIST<FROZEN<attachment>>, PRIMARY KEY ((conversation_id), id)) WITH CLUSTERING ORDER BY (id DESC);

CREATE TABLE IF NOT EXISTS access_tokens (access_token ASCII, user_id TIMEUUID, first_access TIMESTAMP, last_access TIMESTAMP, location FROZEN<geo_location>, ip INET, browser_name VARCHAR, os_name VARCHAR, user_agent VARCHAR, PRIMARY KEY(access_token));
-- CREATE CUSTOM INDEX IF NOT EXISTS access_tokens_by_user_id ON access_tokens (user_id) USING 'StorageAttachedIndex';
CREATE CUSTOM INDEX IF NOT EXISTS access_tokens_by_user_id ON access_tokens (user_id) USING 'org.apache.cassandra.index.sasi.SASIIndex';

CREATE TABLE IF NOT EXISTS user_settings (user_id TIMEUUID, locale ASCII, theme ASCII, PRIMARY KEY (user_id));

CREATE TABLE IF NOT EXISTS message_flags (conversation_id TIMEUUID, user_id TIMEUUID, flag ASCII, message_id TIMEUUID, PRIMARY KEY((conversation_id), user_id, flag, message_id)) WITH CLUSTERING ORDER BY (user_id ASC, flag ASC, message_id DESC);

CREATE TABLE IF NOT EXISTS conversation_stats (user_id TIMEUUID, conversation_id TIMEUUID, message_counter COUNTER, PRIMARY KEY ((user_id), conversation_id)) WITH CLUSTERING ORDER BY (conversation_id DESC);

CREATE TABLE IF NOT EXISTS message_commits (conversation_id TIMEUUID, user_id TIMEUUID, id TIMEUUID, message_id TIMEUUID, action ASCII, date TIMESTAMP, PRIMARY KEY ((conversation_id), user_id, id)) WITH CLUSTERING ORDER BY (user_id ASC, id DESC);
-- CREATE CUSTOM INDEX IF NOT EXISTS message_commits_by_message_id ON message_commits (message_id) USING 'StorageAttachedIndex';
CREATE CUSTOM INDEX IF NOT EXISTS message_commits_by_message_id ON message_commits (message_id) USING 'org.apache.cassandra.index.sasi.SASIIndex';

CREATE TABLE IF NOT EXISTS message_commit_stats (conversation_id TIMEUUID, user_id TIMEUUID, commit_counter COUNTER, PRIMARY KEY ((conversation_id), user_id)) WITH CLUSTERING ORDER BY (user_id ASC);

CREATE TABLE IF NOT EXISTS sticker_packs (id TIMEUUID, name VARCHAR, cover_picture BLOB, created_at TIMESTAMP, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS stickers (sticker_pack_id TIMEUUID, id TIMEUUID, emoji VARCHAR, content BLOB, animated BOOLEAN, PRIMARY KEY ((sticker_pack_id), id)) WITH CLUSTERING ORDER BY (id ASC);
