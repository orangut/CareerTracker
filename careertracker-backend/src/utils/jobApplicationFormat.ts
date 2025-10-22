import { JobApplicationPopulatedStage } from "../routes/index";
import { JobApplicationResponse } from "../interfaces/JobApplicationResponse";

/**
 * Converts a JobApplicationPopulatedStage object to a JobApplicationResponse object.
 * @param jobApp JobApplicationPopulatedStage
 * @returns JobApplicationResponse
 */
export function formatJobApplicationResponse(
    jobApp: JobApplicationPopulatedStage
): JobApplicationResponse {
    const { lastStage, ...rest } = { ...jobApp, lastStageType: jobApp.lastStage?.type || undefined };
    return rest as JobApplicationResponse;
}