import { AircraftTrack, VesselTrack, SatelliteTrack, GroundStation, WebsiteAsset, IntelligenceItem, SecurityFinding } from '@command-center/contracts';
export declare class GodsEyeAdapter {
    static getLiveAircraft(): AircraftTrack[];
    static getLiveVessels(): VesselTrack[];
}
export declare class WorldMonitorAdapter {
    static getGlobalIntelligence(): IntelligenceItem[];
}
export declare class MissionControlAdapter {
    static getSatellites(): SatelliteTrack[];
    static getGroundStations(): GroundStation[];
}
export declare class WebCheckAdapter {
    static scanDomain(domain: string): WebsiteAsset;
}
export declare class SecurityLabAdapter {
    static runAssessment(target: string, authorizationContext: {
        authorizedBy: string;
        scope: string;
        expiresAt: string;
    }): SecurityFinding[];
}
