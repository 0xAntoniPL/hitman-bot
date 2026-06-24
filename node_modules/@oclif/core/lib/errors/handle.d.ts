import { OclifError, PrettyPrintableError } from '../interfaces';
export declare const handle: (err: Error & Partial<PrettyPrintableError> & Partial<OclifError>) => void;
