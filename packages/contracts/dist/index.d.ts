import { z } from 'zod';
export declare const ProvenanceSchema: z.ZodObject<{
    source: z.ZodString;
    method: z.ZodOptional<z.ZodString>;
    confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW", "UNKNOWN"]>;
    freshnessSec: z.ZodNumber;
    licenseNote: z.ZodOptional<z.ZodString>;
    isSimulated: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    source: string;
    confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
    freshnessSec: number;
    isSimulated: boolean;
    method?: string | undefined;
    licenseNote?: string | undefined;
}, {
    source: string;
    confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
    freshnessSec: number;
    method?: string | undefined;
    licenseNote?: string | undefined;
    isSimulated?: boolean | undefined;
}>;
export declare const GeoEventSchema: z.ZodObject<{
    id: z.ZodString;
    source: z.ZodString;
    timestamp: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    altitude: z.ZodOptional<z.ZodNumber>;
    type: z.ZodString;
    subtype: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW", "UNKNOWN"]>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    provenance: z.ZodObject<{
        source: z.ZodString;
        method: z.ZodOptional<z.ZodString>;
        confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW", "UNKNOWN"]>;
        freshnessSec: z.ZodNumber;
        licenseNote: z.ZodOptional<z.ZodString>;
        isSimulated: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        isSimulated: boolean;
        method?: string | undefined;
        licenseNote?: string | undefined;
    }, {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        method?: string | undefined;
        licenseNote?: string | undefined;
        isSimulated?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    source: string;
    confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
    type: string;
    id: string;
    timestamp: string;
    latitude: number;
    longitude: number;
    title: string;
    provenance: {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        isSimulated: boolean;
        method?: string | undefined;
        licenseNote?: string | undefined;
    };
    altitude?: number | undefined;
    subtype?: string | undefined;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    source: string;
    confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
    type: string;
    id: string;
    timestamp: string;
    latitude: number;
    longitude: number;
    title: string;
    provenance: {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        method?: string | undefined;
        licenseNote?: string | undefined;
        isSimulated?: boolean | undefined;
    };
    altitude?: number | undefined;
    subtype?: string | undefined;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const AircraftTrackSchema: z.ZodObject<{
    id: z.ZodString;
    callsign: z.ZodString;
    aircraftType: z.ZodString;
    origin: z.ZodOptional<z.ZodString>;
    destination: z.ZodOptional<z.ZodString>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    altitudeFeet: z.ZodNumber;
    heading: z.ZodNumber;
    velocityKnots: z.ZodNumber;
    squawk: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    provenance: z.ZodObject<{
        source: z.ZodString;
        method: z.ZodOptional<z.ZodString>;
        confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW", "UNKNOWN"]>;
        freshnessSec: z.ZodNumber;
        licenseNote: z.ZodOptional<z.ZodString>;
        isSimulated: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        isSimulated: boolean;
        method?: string | undefined;
        licenseNote?: string | undefined;
    }, {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        method?: string | undefined;
        licenseNote?: string | undefined;
        isSimulated?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    timestamp: string;
    latitude: number;
    longitude: number;
    provenance: {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        isSimulated: boolean;
        method?: string | undefined;
        licenseNote?: string | undefined;
    };
    callsign: string;
    aircraftType: string;
    altitudeFeet: number;
    heading: number;
    velocityKnots: number;
    origin?: string | undefined;
    destination?: string | undefined;
    squawk?: string | undefined;
}, {
    id: string;
    timestamp: string;
    latitude: number;
    longitude: number;
    provenance: {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        method?: string | undefined;
        licenseNote?: string | undefined;
        isSimulated?: boolean | undefined;
    };
    callsign: string;
    aircraftType: string;
    altitudeFeet: number;
    heading: number;
    velocityKnots: number;
    origin?: string | undefined;
    destination?: string | undefined;
    squawk?: string | undefined;
}>;
export declare const VesselTrackSchema: z.ZodObject<{
    id: z.ZodString;
    vesselName: z.ZodString;
    mmsi: z.ZodString;
    imo: z.ZodOptional<z.ZodString>;
    vesselType: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    heading: z.ZodNumber;
    speedKnots: z.ZodNumber;
    destination: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    provenance: z.ZodObject<{
        source: z.ZodString;
        method: z.ZodOptional<z.ZodString>;
        confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW", "UNKNOWN"]>;
        freshnessSec: z.ZodNumber;
        licenseNote: z.ZodOptional<z.ZodString>;
        isSimulated: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        isSimulated: boolean;
        method?: string | undefined;
        licenseNote?: string | undefined;
    }, {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        method?: string | undefined;
        licenseNote?: string | undefined;
        isSimulated?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    timestamp: string;
    latitude: number;
    longitude: number;
    provenance: {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        isSimulated: boolean;
        method?: string | undefined;
        licenseNote?: string | undefined;
    };
    heading: number;
    vesselName: string;
    mmsi: string;
    vesselType: string;
    speedKnots: number;
    destination?: string | undefined;
    imo?: string | undefined;
}, {
    id: string;
    timestamp: string;
    latitude: number;
    longitude: number;
    provenance: {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        method?: string | undefined;
        licenseNote?: string | undefined;
        isSimulated?: boolean | undefined;
    };
    heading: number;
    vesselName: string;
    mmsi: string;
    vesselType: string;
    speedKnots: number;
    destination?: string | undefined;
    imo?: string | undefined;
}>;
export declare const SatelliteTrackSchema: z.ZodObject<{
    noradId: z.ZodNumber;
    name: z.ZodString;
    category: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    altitudeKm: z.ZodNumber;
    velocityKms: z.ZodNumber;
    tleLine1: z.ZodOptional<z.ZodString>;
    tleLine2: z.ZodOptional<z.ZodString>;
    nextPass: z.ZodOptional<z.ZodString>;
    provenance: z.ZodObject<{
        source: z.ZodString;
        method: z.ZodOptional<z.ZodString>;
        confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW", "UNKNOWN"]>;
        freshnessSec: z.ZodNumber;
        licenseNote: z.ZodOptional<z.ZodString>;
        isSimulated: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        isSimulated: boolean;
        method?: string | undefined;
        licenseNote?: string | undefined;
    }, {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        method?: string | undefined;
        licenseNote?: string | undefined;
        isSimulated?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    latitude: number;
    longitude: number;
    provenance: {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        isSimulated: boolean;
        method?: string | undefined;
        licenseNote?: string | undefined;
    };
    noradId: number;
    name: string;
    category: string;
    altitudeKm: number;
    velocityKms: number;
    tleLine1?: string | undefined;
    tleLine2?: string | undefined;
    nextPass?: string | undefined;
}, {
    latitude: number;
    longitude: number;
    provenance: {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        method?: string | undefined;
        licenseNote?: string | undefined;
        isSimulated?: boolean | undefined;
    };
    noradId: number;
    name: string;
    category: string;
    altitudeKm: number;
    velocityKms: number;
    tleLine1?: string | undefined;
    tleLine2?: string | undefined;
    nextPass?: string | undefined;
}>;
export declare const GroundStationSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    altitudeMeters: z.ZodNumber;
    status: z.ZodEnum<["ONLINE", "OFFLINE", "MAINTENANCE", "DEGRADED"]>;
    antennaType: z.ZodString;
    telemetryLinkState: z.ZodEnum<["ACTIVE", "IDLE", "ERROR"]>;
    lastContact: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "ONLINE" | "OFFLINE" | "MAINTENANCE" | "DEGRADED";
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    altitudeMeters: number;
    antennaType: string;
    telemetryLinkState: "ACTIVE" | "IDLE" | "ERROR";
    lastContact: string;
}, {
    status: "ONLINE" | "OFFLINE" | "MAINTENANCE" | "DEGRADED";
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    altitudeMeters: number;
    antennaType: string;
    telemetryLinkState: "ACTIVE" | "IDLE" | "ERROR";
    lastContact: string;
}>;
export declare const WebsiteAssetSchema: z.ZodObject<{
    domain: z.ZodString;
    ipAddresses: z.ZodArray<z.ZodString, "many">;
    serverHeader: z.ZodOptional<z.ZodString>;
    technologies: z.ZodArray<z.ZodString, "many">;
    dnsRecords: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>;
    sslValid: z.ZodBoolean;
    openPorts: z.ZodArray<z.ZodNumber, "many">;
    subdomains: z.ZodArray<z.ZodString, "many">;
    trackers: z.ZodArray<z.ZodString, "many">;
    scannedAt: z.ZodString;
    provenance: z.ZodObject<{
        source: z.ZodString;
        method: z.ZodOptional<z.ZodString>;
        confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW", "UNKNOWN"]>;
        freshnessSec: z.ZodNumber;
        licenseNote: z.ZodOptional<z.ZodString>;
        isSimulated: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        isSimulated: boolean;
        method?: string | undefined;
        licenseNote?: string | undefined;
    }, {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        method?: string | undefined;
        licenseNote?: string | undefined;
        isSimulated?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    provenance: {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        isSimulated: boolean;
        method?: string | undefined;
        licenseNote?: string | undefined;
    };
    domain: string;
    ipAddresses: string[];
    technologies: string[];
    dnsRecords: Record<string, string[]>;
    sslValid: boolean;
    openPorts: number[];
    subdomains: string[];
    trackers: string[];
    scannedAt: string;
    serverHeader?: string | undefined;
}, {
    provenance: {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        method?: string | undefined;
        licenseNote?: string | undefined;
        isSimulated?: boolean | undefined;
    };
    domain: string;
    ipAddresses: string[];
    technologies: string[];
    dnsRecords: Record<string, string[]>;
    sslValid: boolean;
    openPorts: number[];
    subdomains: string[];
    trackers: string[];
    scannedAt: string;
    serverHeader?: string | undefined;
}>;
export declare const IntelligenceItemSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    source: z.ZodString;
    publicationTime: z.ZodString;
    category: z.ZodString;
    entities: z.ZodArray<z.ZodString, "many">;
    summary: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    provenance: z.ZodObject<{
        source: z.ZodString;
        method: z.ZodOptional<z.ZodString>;
        confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW", "UNKNOWN"]>;
        freshnessSec: z.ZodNumber;
        licenseNote: z.ZodOptional<z.ZodString>;
        isSimulated: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        isSimulated: boolean;
        method?: string | undefined;
        licenseNote?: string | undefined;
    }, {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        method?: string | undefined;
        licenseNote?: string | undefined;
        isSimulated?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    source: string;
    id: string;
    title: string;
    provenance: {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        isSimulated: boolean;
        method?: string | undefined;
        licenseNote?: string | undefined;
    };
    category: string;
    publicationTime: string;
    entities: string[];
    summary: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
    url?: string | undefined;
}, {
    source: string;
    id: string;
    title: string;
    provenance: {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        method?: string | undefined;
        licenseNote?: string | undefined;
        isSimulated?: boolean | undefined;
    };
    category: string;
    publicationTime: string;
    entities: string[];
    summary: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
    url?: string | undefined;
}>;
export declare const SecurityFindingSchema: z.ZodObject<{
    id: z.ZodString;
    target: z.ZodString;
    category: z.ZodString;
    severity: z.ZodEnum<["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]>;
    title: z.ZodString;
    evidence: z.ZodString;
    remediation: z.ZodString;
    authorizationContext: z.ZodObject<{
        authorizedBy: z.ZodString;
        scope: z.ZodString;
        expiresAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        authorizedBy: string;
        scope: string;
        expiresAt: string;
    }, {
        authorizedBy: string;
        scope: string;
        expiresAt: string;
    }>;
    timestamp: z.ZodString;
    provenance: z.ZodObject<{
        source: z.ZodString;
        method: z.ZodOptional<z.ZodString>;
        confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW", "UNKNOWN"]>;
        freshnessSec: z.ZodNumber;
        licenseNote: z.ZodOptional<z.ZodString>;
        isSimulated: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        isSimulated: boolean;
        method?: string | undefined;
        licenseNote?: string | undefined;
    }, {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        method?: string | undefined;
        licenseNote?: string | undefined;
        isSimulated?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    timestamp: string;
    title: string;
    provenance: {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        isSimulated: boolean;
        method?: string | undefined;
        licenseNote?: string | undefined;
    };
    category: string;
    target: string;
    severity: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL" | "INFO";
    evidence: string;
    remediation: string;
    authorizationContext: {
        authorizedBy: string;
        scope: string;
        expiresAt: string;
    };
}, {
    id: string;
    timestamp: string;
    title: string;
    provenance: {
        source: string;
        confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
        freshnessSec: number;
        method?: string | undefined;
        licenseNote?: string | undefined;
        isSimulated?: boolean | undefined;
    };
    category: string;
    target: string;
    severity: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL" | "INFO";
    evidence: string;
    remediation: string;
    authorizationContext: {
        authorizedBy: string;
        scope: string;
        expiresAt: string;
    };
}>;
export declare const AgentTaskSchema: z.ZodObject<{
    id: z.ZodString;
    parentTaskId: z.ZodOptional<z.ZodString>;
    agentName: z.ZodString;
    objective: z.ZodString;
    status: z.ZodEnum<["PENDING", "RUNNING", "COMPLETED", "FAILED", "AWAITING_APPROVAL"]>;
    inputs: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    outputs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    executionTrace: z.ZodArray<z.ZodString, "many">;
    createdAt: z.ZodString;
    completedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "AWAITING_APPROVAL";
    id: string;
    agentName: string;
    objective: string;
    inputs: Record<string, unknown>;
    executionTrace: string[];
    createdAt: string;
    parentTaskId?: string | undefined;
    outputs?: Record<string, unknown> | undefined;
    completedAt?: string | undefined;
}, {
    status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "AWAITING_APPROVAL";
    id: string;
    agentName: string;
    objective: string;
    inputs: Record<string, unknown>;
    executionTrace: string[];
    createdAt: string;
    parentTaskId?: string | undefined;
    outputs?: Record<string, unknown> | undefined;
    completedAt?: string | undefined;
}>;
export type GeoEvent = z.infer<typeof GeoEventSchema>;
export type AircraftTrack = z.infer<typeof AircraftTrackSchema>;
export type VesselTrack = z.infer<typeof VesselTrackSchema>;
export type SatelliteTrack = z.infer<typeof SatelliteTrackSchema>;
export type GroundStation = z.infer<typeof GroundStationSchema>;
export type WebsiteAsset = z.infer<typeof WebsiteAssetSchema>;
export type IntelligenceItem = z.infer<typeof IntelligenceItemSchema>;
export type SecurityFinding = z.infer<typeof SecurityFindingSchema>;
export type AgentTask = z.infer<typeof AgentTaskSchema>;
