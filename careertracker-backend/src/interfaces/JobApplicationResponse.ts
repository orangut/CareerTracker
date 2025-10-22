import { JobApplication } from "@monorepo/db-api-client/src/interfaces"

export interface JobApplicationResponse extends Omit<JobApplication, "lastStageId" > {
    lastStageType?: string;
}