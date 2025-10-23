import { v4 as uuidv4 } from 'uuid';
import type { ErrorFormat, ExceptionConfig, ErrorIdentifier } from './types';

export class Exception<E extends string = string> extends Error {
  readonly id: string;
  readonly identifier: E;
  readonly status: number;
  readonly code: string;
  readonly messagePublic: string;
  readonly description?: string;
  readonly meta?: Record<string, unknown>;

  constructor(
    def: ErrorFormat & { identifier: E },
    opts?: { description?: string; meta?: Record<string, unknown> }
  ) {
    super(def.message);
    this.name = def.identifier;
    this.id = uuidv4();
    this.identifier = def.identifier;
    this.status = def.status;
    this.code = def.code;
    this.messagePublic = def.message;
    this.description = opts?.description;
    this.meta = opts?.meta;
  }
}

export function createExceptionKit<const T extends readonly ErrorFormat[]>(
  config: ExceptionConfig<T>
) {
  const mapById = new Map<string, ErrorFormat>();
  for (const e of config.errors) mapById.set(e.identifier, e);

  function raise(
    identifier: ErrorIdentifier<T>,
    opts?: { description?: string; meta?: Record<string, unknown> }
  ) {
    const def = mapById.get(identifier);
    if (!def) throw new Error(`Unknown error identifier: ${identifier}`);
    return new Exception({ ...def, identifier }, opts);
  }

  function findByStatus(status: number) {
    return config.errors.find(e => e.status === status);
  }

  return { raise, findByStatus };
}
