-- Create sequences for auto-incrementing IDs
CREATE SEQUENCE user_id_seq;
CREATE SEQUENCE role_id_seq;
CREATE SEQUENCE user_role_id_seq;
CREATE SEQUENCE driver_id_seq;
CREATE SEQUENCE vehicle_model_id_seq;
CREATE SEQUENCE vehicle_id_seq;
CREATE SEQUENCE location_id_seq;
CREATE SEQUENCE stop_id_seq;
CREATE SEQUENCE route_id_seq;
CREATE SEQUENCE route_stop_id_seq;
CREATE SEQUENCE trip_id_seq;
CREATE SEQUENCE trip_stop_id_seq;
CREATE SEQUENCE vehicle_telemetry_id_seq;
CREATE SEQUENCE vehicle_telemetry_history_id_seq;
CREATE SEQUENCE shift_id_seq;

-- User table
CREATE TABLE "user"(
    "id" BIGINT NOT NULL DEFAULT nextval('user_id_seq'),
    "name" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    PRIMARY KEY("id")
);

-- Role table
CREATE TABLE "role"(
    "id" BIGINT NOT NULL DEFAULT nextval('role_id_seq'),
    "name" VARCHAR(255) NOT NULL,
    PRIMARY KEY("id")
);

-- User-Role junction table
CREATE TABLE "user_role"(
    "id" BIGINT NOT NULL DEFAULT nextval('user_role_id_seq'),
    "user_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,
    PRIMARY KEY("id"),
    FOREIGN KEY("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
    FOREIGN KEY("role_id") REFERENCES "role"("id") ON DELETE CASCADE
);

-- Driver table
CREATE TABLE "driver"(
    "id" BIGINT NOT NULL DEFAULT nextval('driver_id_seq'),
    "name" VARCHAR(255) NOT NULL,
    "qid" VARCHAR(255) NOT NULL UNIQUE,
    "phone" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    PRIMARY KEY("id")
);

-- Vehicle Model table
CREATE TABLE "vehicle_model"(
    "id" BIGINT NOT NULL DEFAULT nextval('vehicle_model_id_seq'),
    "make" VARCHAR(255) NOT NULL,
    "year" INTEGER NOT NULL,
    "manufacturer" VARCHAR(255) NOT NULL,
    "capacity" INTEGER NOT NULL,
    PRIMARY KEY("id")
);

-- Vehicle table
CREATE TABLE "vehicle"(
    "id" BIGINT NOT NULL DEFAULT nextval('vehicle_id_seq'),
    "plate_no" VARCHAR(255) NOT NULL UNIQUE,
    "fleet_no" VARCHAR(255) NOT NULL,
    "model_id" BIGINT NOT NULL,
    PRIMARY KEY("id"),
    FOREIGN KEY("model_id") REFERENCES "vehicle_model"("id") ON DELETE RESTRICT
);

-- Location table
CREATE TABLE "location"(
    "id" BIGINT NOT NULL DEFAULT nextval('location_id_seq'),
    "lat" DECIMAL(10, 8) NOT NULL,
    "lon" DECIMAL(11, 8) NOT NULL,
    PRIMARY KEY("id")
);

-- Stop table
CREATE TABLE "stop"(
    "id" BIGINT NOT NULL DEFAULT nextval('stop_id_seq'),
    "location_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    PRIMARY KEY("id"),
    FOREIGN KEY("location_id") REFERENCES "location"("id") ON DELETE CASCADE
);

-- Route table
CREATE TABLE "route"(
    "id" BIGINT NOT NULL DEFAULT nextval('route_id_seq'),
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "total_estimated_duration" INTEGER NOT NULL,
    PRIMARY KEY("id")
);

-- Route-Stop junction table
CREATE TABLE "route_stop"(
    "id" BIGINT NOT NULL DEFAULT nextval('route_stop_id_seq'),
    "route_id" BIGINT NOT NULL,
    "stop_id" BIGINT NOT NULL,
    "stop_order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "path" TEXT,
    "eta" INTEGER,
    "wait_time" INTEGER,
    PRIMARY KEY("id"),
    FOREIGN KEY("route_id") REFERENCES "route"("id") ON DELETE CASCADE,
    FOREIGN KEY("stop_id") REFERENCES "stop"("id") ON DELETE CASCADE
);

-- Trip table
CREATE TABLE "trip"(
    "id" BIGINT NOT NULL DEFAULT nextval('trip_id_seq'),
    "route_id" BIGINT NOT NULL,
    "scheduled_start_time" TIMESTAMP NOT NULL,
    "scheduled_end_time" TIMESTAMP NOT NULL,
    "scheduled_driver_id" BIGINT NOT NULL,
    "scheduled_vehicle_id" BIGINT NOT NULL,
    "start_time" TIMESTAMP,
    "end_time" TIMESTAMP,
    "start_location" BIGINT,
    "end_location" BIGINT,
    "driver_id" BIGINT NOT NULL,
    "vehicle_id" BIGINT NOT NULL,
    PRIMARY KEY("id"),
    FOREIGN KEY("route_id") REFERENCES "route"("id") ON DELETE RESTRICT,
    FOREIGN KEY("driver_id") REFERENCES "driver"("id") ON DELETE RESTRICT,
    FOREIGN KEY("vehicle_id") REFERENCES "vehicle"("id") ON DELETE RESTRICT,
    FOREIGN KEY("start_location") REFERENCES "location"("id") ON DELETE SET NULL,
    FOREIGN KEY("end_location") REFERENCES "location"("id") ON DELETE SET NULL
);

-- Trip-Stop junction table
CREATE TABLE "trip_stop"(
    "id" BIGINT NOT NULL DEFAULT nextval('trip_stop_id_seq'),
    "trip_id" BIGINT NOT NULL,
    "stop_id" BIGINT NOT NULL,
    "stop_order" INTEGER NOT NULL,
    "arrival_time" TIMESTAMP,
    "departure_time" TIMESTAMP,
    "eta" INTEGER,
    PRIMARY KEY("id"),
    FOREIGN KEY("trip_id") REFERENCES "trip"("id") ON DELETE CASCADE,
    FOREIGN KEY("stop_id") REFERENCES "stop"("id") ON DELETE CASCADE
);

-- Vehicle Telemetry table (real-time)
CREATE TABLE "vehicle_telemetry"(
    "id" BIGINT NOT NULL DEFAULT nextval('vehicle_telemetry_id_seq'),
    "lat" DECIMAL(10, 8) NOT NULL,
    "lon" DECIMAL(11, 8) NOT NULL,
    "speed" DECIMAL(5, 2),
    "ignition" BOOLEAN NOT NULL,
    "tracked_on" TIMESTAMP NOT NULL DEFAULT NOW(),
    "vehicle_id" BIGINT NOT NULL,
    PRIMARY KEY("id"),
    FOREIGN KEY("vehicle_id") REFERENCES "vehicle"("id") ON DELETE CASCADE
);

-- Vehicle Telemetry History table
CREATE TABLE "vehicle_telemetry_history"(
    "id" BIGINT NOT NULL DEFAULT nextval('vehicle_telemetry_history_id_seq'),
    "lat" DECIMAL(10, 8) NOT NULL,
    "lon" DECIMAL(11, 8) NOT NULL,
    "speed" DECIMAL(5, 2),
    "ignition" BOOLEAN NOT NULL,
    "tracked_on" TIMESTAMP NOT NULL,
    "vehicle_id" BIGINT NOT NULL,
    PRIMARY KEY("id"),
    FOREIGN KEY("vehicle_id") REFERENCES "vehicle"("id") ON DELETE CASCADE
);

-- Shift table
CREATE TABLE "shift"(
    "id" BIGINT NOT NULL DEFAULT nextval('shift_id_seq'),
    "start_time" TIMESTAMP NOT NULL,
    "end_time" TIMESTAMP NOT NULL,
    "vehicle_id" BIGINT NOT NULL,
    "driver_id" BIGINT NOT NULL,
    PRIMARY KEY("id"),
    FOREIGN KEY("vehicle_id") REFERENCES "vehicle"("id") ON DELETE CASCADE,
    FOREIGN KEY("driver_id") REFERENCES "driver"("id") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_user_username ON "user"("username");
CREATE INDEX idx_driver_username ON "driver"("username");
CREATE INDEX idx_driver_qid ON "driver"("qid");
CREATE INDEX idx_vehicle_plate_no ON "vehicle"("plate_no");
CREATE INDEX idx_vehicle_telemetry_vehicle_id ON "vehicle_telemetry"("vehicle_id");
CREATE INDEX idx_vehicle_telemetry_tracked_on ON "vehicle_telemetry"("tracked_on");
CREATE INDEX idx_vehicle_telemetry_history_vehicle_id ON "vehicle_telemetry_history"("vehicle_id");
CREATE INDEX idx_vehicle_telemetry_history_tracked_on ON "vehicle_telemetry_history"("tracked_on");
CREATE INDEX idx_trip_driver_id ON "trip"("driver_id");
CREATE INDEX idx_trip_vehicle_id ON "trip"("vehicle_id");
CREATE INDEX idx_trip_route_id ON "trip"("route_id");
CREATE INDEX idx_shift_driver_id ON "shift"("driver_id");
CREATE INDEX idx_shift_vehicle_id ON "shift"("vehicle_id");
CREATE INDEX idx_route_stop_route_id ON "route_stop"("route_id");
CREATE INDEX idx_route_stop_stop_id ON "route_stop"("stop_id");
CREATE INDEX idx_trip_stop_trip_id ON "trip_stop"("trip_id");
CREATE INDEX idx_trip_stop_stop_id ON "trip_stop"("stop_id");