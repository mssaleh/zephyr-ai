export interface SourceDiagnostic {
  path?: string;
  code: string;
  message: string;
}

export interface SourceExclusion {
  path: string;
  reason: string;
}

export interface SourceReport {
  discovered: number;
  indexed: number;
  intentionallyExcluded: SourceExclusion[];
  warnings: SourceDiagnostic[];
  errors: SourceDiagnostic[];
}
