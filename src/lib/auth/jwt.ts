import type { UserRole } from "@/types/auth";
import {
  ACCESS_TOKEN_COOKIE,
  parseJwt as baseParseJwt,
  isTokenExpired,
  isTokenAuthorized,
  jwtDecode,
  type DecodedJwt as BaseDecodedJwt,
} from "@timmbr/utils";

export { ACCESS_TOKEN_COOKIE, isTokenExpired, isTokenAuthorized, jwtDecode };

export interface DecodedJwt extends Omit<BaseDecodedJwt, "role"> {
  role?: UserRole;
}

/**
 * Parses and decodes a JWT payload safely across Edge, Node, and browser environments.
 * Re-exports the unified implementation from @timmbr/utils with console-specific UserRole typing.
 */
export function parseJwt(token: string): DecodedJwt | null {
  return baseParseJwt<DecodedJwt>(token);
}
